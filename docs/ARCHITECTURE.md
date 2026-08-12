# Arquitectura

## Visión general

El backend sigue una arquitectura por capas inspirada en Clean Architecture, con inyección de dependencias manual (sin contenedor DI):

```text
presentation/    → Express: rutas, controladores, DTOs, mappers, manejo de errores
application/     → casos de uso, contenedor de dependencias, comandos CLI
domain/          → lógica de negocio pura: entidades, interfaces, servicios de dominio
infrastructure/  → implementaciones concretas: proveedores de IA, filesystem, PDF
```

La regla de dependencia es la habitual: `domain` no importa nada de las otras capas: define interfaces (`IGameRepository`, `IEmbeddingProvider`, `IContextRefiner`...) que `infrastructure` implementa. `application` orquesta casos de uso combinando piezas de `domain` e `infrastructure`.

## El pipeline RAG

Responder una pregunta es un *pipeline* de *Retrieval-Augmented Generation*: en vez de que el modelo de IA responda solo con lo que "sabe", se le da como contexto los fragmentos del reglamento más relevantes para esa pregunta concreta.

```text
Pregunta del usuario
        │
        ├─ valida el juego            ─┐
        ├─ genera embedding            ├─ en paralelo (no dependen entre sí)
        │                              ─┘
        ▼
Recupera los chunks más similares (similitud coseno)
        ▼
Reordena y recorta el contexto (1 llamada de IA)
        ▼
Genera la respuesta, en streaming
```

Todo esto vive en `AskQuestionUseCase`, con dos métodos públicos: `execute()` (respuesta completa) y `executeStream()` (igual, pero entregando la respuesta en fragmentos vía un generador asíncrono). Ambos comparten la preparación del contexto (`prepareContext()`); solo cambia el último paso.

### Por qué el embedding y la validación van en paralelo

Ninguno depende del resultado del otro — validar que el juego existe es una lectura local de disco, generar el embedding es una llamada de red. Lanzarlos con `Promise.all` en vez de uno detrás de otro ahorra ese tiempo sin ningún riesgo.

### Reordenar y recortar en una sola llamada

Al principio esto eran dos pasos independientes: un *reranker* que reordenaba los chunks por relevancia, y un *compressor* que recortaba cada uno a lo esencial. Cada paso era una llamada de IA completa — es decir, cada pregunta encadenaba **tres** llamadas de IA (reordenar → comprimir → responder), no una.

Se fusionaron en `LLMContextRefiner`: un único prompt le pide al modelo que haga ambas cosas a la vez (reordenar y recortar), devolviendo el resultado en JSON. Esto reduce el pipeline a **dos** llamadas de IA por pregunta en vez de tres, con una mejora de latencia notable y sin pérdida de calidad apreciable.

## El sistema de proveedores de IA

Hay dos necesidades muy distintas que fácilmente se confunden si no se piensa con cuidado:

- **Generar texto** (responder preguntas, reordenar contexto): cada llamada es independiente. Si un proveedor falla por cuota, no pasa nada por usar otro distinto en la siguiente llamada.
- **Generar embeddings**: los vectores de una misma base de conocimiento tienen que venir **siempre del mismo modelo**. Cada proveedor genera vectores en un espacio matemático distinto — comparar un embedding de Gemini con uno de OpenAI no tiene ningún sentido, por mucho que ambos tengan la "misma" dimensión.

Por eso el backend trata ambos casos de forma distinta:

```text
Chat (generateText / generateChat / refine)
    → FallbackLLMClient: prueba varios proveedores en orden
    → AI_PROVIDER_ORDER controla el orden
    → si uno falla por cuota, pasa automáticamente al siguiente

Embeddings (generate / generateBatch)
    → un único proveedor fijo, sin fallback
    → AI_EMBEDDING_PROVIDER lo determina explícitamente
    → si no está configurado, el servidor NO arranca
```

Esta asimetría no es casualidad: viene de un bug real de producción (ver `ENGINEERING-NOTES.md`) en el que mezclar proveedores de embeddings entre el momento de importar un juego y el momento de responder una pregunta causaba errores 500 impredecibles.

### Streaming

`ILLMClient` expone `generateTextStream()` como método opcional. Los proveedores que lo implementan (todos los actuales) lo hacen así:

- **Gemini**: usa `generateContentStream` del SDK oficial directamente.
- **Proveedores compatibles con OpenAI** (OpenRouter, Mistral, OpenAI, DeepInfra, Together): no hay SDK, así que se hace `fetch` con `stream: true` y se parsea a mano el formato *Server-Sent Events* que devuelve la API.

`FallbackLLMClient.generateTextStream()` trata el streaming de forma distinta al resto de operaciones: si un proveedor falla **antes** de emitir ningún fragmento, prueba el siguiente (igual que con las llamadas normales). Pero si falla **a mitad** de una respuesta ya empezada, el error se propaga tal cual — no tiene sentido "cambiar de proveedor" cuando el usuario ya está viendo texto en pantalla.

## Recuperación semántica

`SemanticRetriever`:

1. Carga `knowledge.json` del juego.
2. Calcula similitud coseno entre el embedding de la pregunta y el de cada chunk.
3. Ordena de mayor a menor similitud.
4. Devuelve como máximo `maxRetrievedChunks` (5 por defecto).

Un detalle a tener en cuenta: existe también un valor `minimumSimilarity` (0.70) en la configuración, pero el código actual no lo aplica como filtro — solo se usa el límite de cantidad. En la práctica no ha hecho falta, porque con 5 chunks de un único juego la relevancia siempre es razonable, pero es una mejora pendiente si el catálogo creciera mucho.

Si algún chunk se guardó sin un embedding válido (por ejemplo, por un fallo pasado de un proveedor a mitad de una importación), se omite de la búsqueda con un aviso en los logs, en vez de romper la pregunta entera con un error 500.

## Importación de un juego

```text
PDF
 ↓ Pdf2JsonExtractor
Texto por página
 ↓ TextCleaner
Texto limpio
 ↓ ChunkGenerator (600 caracteres, solape de 100)
Chunks (id: <gameId>-p<página>-c<índice>)
 ↓ EmbeddingGenerator (en lotes, con checkpoint de progreso)
Chunks con embedding
 ↓ KnowledgeWriter
generated/knowledge.json
```

El paso de embeddings tiene dos protecciones importantes:

- **Checkpoint de progreso**: si la importación falla a mitad (típicamente por cuota agotada), el progreso se guarda en `embeddings-checkpoint.json`. Al reintentar, se retoma donde se quedó — pero solo si el proveedor de hoy genera la misma dimensión que el checkpoint de ayer; si no coincide, se descarta el checkpoint y se regenera todo desde cero con el proveedor actual, para no acabar mezclando dimensiones dentro del mismo juego.
- **Lotes con auto-recuperación**: los chunks se agrupan en lotes (`IMPORT_EMBEDDING_BATCH_SIZE`, 40 por defecto) para reducir drásticamente el número de peticiones HTTP. Si un proveedor concreto no soporta pedir varios embeddings a la vez (algunos modelos aceptan el lote sin dar error, pero solo devuelven 1 resultado), el sistema lo detecta y cae automáticamente a pedirlos uno a uno para ese lote, en vez de fallar la importación entera o guardar datos corruptos en silencio.

## Frontend

Estructura por dominio dentro de `src/`:

```text
components/
├── Chat/       conversación, mensajes, fuentes
├── Header/      cabecera + menú móvil
├── Layout/       estructura general y workspace
├── Sidebar/       panel de juegos (drawer en móvil, favoritos)
├── PdfViewer/      visor de PDF con pdf.js (no un <iframe>)
└── Welcome/         pantalla de bienvenida
hooks/       useChat, useConversation, useFavorites, useSpeechRecognition
services/     clientes HTTP (games, chat)
```

El visor de PDF merece una mención aparte: al principio usaba un `<iframe>` apuntando al PDF con `#page=N` en la URL para saltar a una página concreta. Funcionaba perfecto en escritorio, pero fallaba en Android/Chromium — el visor de PDF integrado del sistema no siempre respeta ese fragmento de URL. La solución fue renderizar el PDF dentro de la propia aplicación con `pdf.js`, controlando la página mostrada por código en vez de depender de una convención de URL que el navegador puede o no respetar.
