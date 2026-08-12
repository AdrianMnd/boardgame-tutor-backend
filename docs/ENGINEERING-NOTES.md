# Notas de ingeniería

Decisiones de diseño y problemas reales de producción que se fueron encontrando y resolviendo durante el desarrollo. Se documentan aquí porque el "por qué" detrás de una decisión suele perderse si solo queda el código final.

## La inconsistencia de embeddings entre proveedores

**El síntoma**: preguntas sobre algunos juegos devolvían un error 500 aleatorio; otros juegos funcionaban perfectamente.

**La causa raíz**: el sistema de proveedores de IA con *fallback* automático (pensado para el chat, donde es totalmente seguro) se estaba usando también para embeddings. El problema es que dos proveedores distintos generan vectores en espacios matemáticos distintos — comparar un embedding de Gemini con uno de Mistral no es "menos preciso", es sencillamente una operación sin sentido. Cuando el juego se importaba con un proveedor y el servidor respondía preguntas con otro (porque el primero se había quedado sin cuota entre medias), la comparación de similitud fallaba con dimensiones incompatibles.

Un caso más sutil del mismo problema: el propio sistema de *checkpoint* de la importación (pensado para reanudar tras un fallo de cuota) podía mezclar proveedores **dentro del mismo juego**, si el proveedor disponible cambiaba entre el primer intento y el segundo, días después.

**La solución**: separar por completo ambos casos. El chat conserva el *fallback* entre varios proveedores (ahí es seguro, cada respuesta es independiente). Los embeddings pasan a usar un único proveedor fijo (`AI_EMBEDDING_PROVIDER`), sin ningún fallback — y el servidor se niega a arrancar si no está configurado sin ambigüedad. Además, el checkpoint de importación ahora comprueba la dimensión del proveedor activo antes de reutilizar progreso guardado, y descarta el checkpoint si no coincide en vez de mezclar.

## Lotes de embeddings: cuando "sin error" no significa "correcto"

Al optimizar la importación para hacer menos peticiones HTTP (agrupando chunks en lotes en vez de uno por petición), apareció un fallo mucho más difícil de detectar que un simple error HTTP: algunos modelos de embeddings aceptan un lote de N textos **sin devolver ningún error**, pero solo procesan el primero, devolviendo 1 resultado en vez de N.

Sin validación, esto habría dejado chunks con `embedding: undefined` guardados en `knowledge.json` en silencio (`JSON.stringify` elimina las claves `undefined`), rompiendo esas preguntas concretas mucho más tarde, de forma muy difícil de rastrear hasta el origen.

La solución fue doble: validar siempre que el número de embeddings devueltos coincide con el de textos pedidos, y si no coincide, caer automáticamente a pedirlos uno a uno para ese lote en concreto — más lento, pero la importación se completa igual, sin datos corruptos ni fallar por completo.

## El visor de PDF y el salto de página en móvil

Enlazar directamente a `documento.pdf#page=8` para abrir el reglamento en la página exacta usada como fuente funciona perfectamente en los visores de PDF integrados de los navegadores de escritorio. En Chrome para Android (y navegadores basados en el mismo motor), el visor integrado no respeta ese fragmento de forma fiable — el PDF se abre, pero siempre desde la página 1.

En vez de depender del comportamiento del visor nativo de cada plataforma (inconsistente y fuera de nuestro control), el PDF se renderiza directamente dentro de la aplicación con `pdf.js`, controlando la página mostrada por código. Esto además simplificó el código: ya no hace falta ninguna rama especial para móvil frente a escritorio, un único componente funciona igual en todas partes.

## Reordenar y comprimir el contexto en una sola llamada

El primer diseño del pipeline RAG tenía un paso de "reordenar por relevancia" y otro de "recortar lo irrelevante" como dos llamadas de IA independientes — sumadas a la llamada final que genera la respuesta, cada pregunta encadenaba tres llamadas de IA seguidas. Se fusionaron en un único prompt que hace ambas cosas a la vez, reduciendo el pipeline a dos llamadas por pregunta. Combinado con paralelizar la validación del juego y la generación del embedding de la pregunta (que tampoco dependían entre sí), el tiempo de respuesta se redujo notablemente sin perder calidad en las respuestas.

## Streaming con múltiples proveedores de respaldo

Añadir *streaming* de respuestas se complica en cuanto hay varios proveedores de *fallback* de por medio: ¿qué se hace si el proveedor activo falla a mitad de una respuesta que el usuario ya está viendo en pantalla? Cambiar de proveedor y "reiniciar" produciría una respuesta confusa, empezando de nuevo o mezclada con la anterior.

La solución adoptada: el *fallback* solo se aplica si el proveedor falla **antes** de emitir el primer fragmento (como con las llamadas normales, sin streaming). En cuanto se ha entregado el primer fragmento al usuario, un fallo posterior se propaga tal cual — se prefiere una respuesta incompleta pero honesta a una silenciosamente "recompuesta" con otro proveedor.

## Renombrar el proyecto de Vercel sin romper CORS

Al renombrar el proyecto del frontend en Vercel (cambia la URL `.vercel.app` asignada), el origen permitido por CORS en el backend queda apuntando a la URL antigua — las peticiones del frontend nuevo empiezan a fallar con un error de CORS, no de conexión, que puede confundirse con otro tipo de problema si no se sabe qué buscar. La lista de orígenes permitidos vive en `src/index.ts`; hay que actualizarla a mano cada vez que cambie la URL de producción del frontend.
