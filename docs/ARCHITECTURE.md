# Arquitectura

## Visión general

El backend sigue una arquitectura por capas inspirada en Clean Architecture, con inyección de dependencias manual (sin contenedor DI):

```text
presentation/    → Express: rutas, controladores, DTOs, mappers, manejo de errores
application/     → casos de uso, contenedor de dependencias, comandos CLI
domain/          → lógica de negocio pura: entidades, interfaces, servicios de dominio
infrastructure/  → implementaciones concretas: Postgres, B2, IA, email, JWT
```

La regla de dependencia es la habitual: `domain` no importa nada de las otras capas — define interfaces (`IGameRepository`, `IUserRepository`, `IFavoritesRepository`, `ICategoryRepository`, `IConversationRepository`, `IEmbeddingProvider`, `IFileStorage`...) que `infrastructure` implementa. `application` orquesta casos de uso combinando piezas de `domain` e `infrastructure`. `ApplicationContainer` es el único sitio donde se construyen las instancias concretas y se conectan entre sí.

## Almacenamiento: Postgres + B2

Todo el estado vive en dos servicios externos:

```text
Postgres (Neon) + pgvector          Backblaze B2 (privado, API S3)
├── games                            ├── <gameId>/source/rulebook.pdf
├── documents                        ├── <gameId>/assets/cover.png
├── chunks (con su embedding)        └── pending-requests/<uuid>/*.pdf
├── users
├── user_favorites                  (solicitudes de juegos nuevos,
├── user_categories                  pendientes de revisión manual)
├── user_category_games
└── conversation_messages
```

El principio general: **Postgres guarda datos estructurados y metadatos** (incluida la *ruta* del archivo en B2), **B2 guarda los binarios en sí** (PDF, imágenes). Ningún archivo se sirve nunca directamente desde el sistema de archivos del servidor — el backend es completamente *stateless*, lo que simplifica el despliegue en un plan gratuito de hosting.

El bucket de B2 es privado. Para portadas y manuales, el backend hace de intermediario (`GET /api/games/:id/cover` y `/manual` leen de B2 y sirven el contenido). Para las solicitudes de juegos, en vez de proxear cada descarga se generan **enlaces firmados** con `@aws-sdk/s3-request-presigner` (válidos 7 días) — así el correo de notificación puede incluir un enlace en el que simplemente se puede clicar.

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
Genera la respuesta, en streaming
```

Todo esto vive en `AskQuestionUseCase`, con dos métodos públicos: `execute()` (respuesta completa) y `executeStream()` (igual, pero entregando la respuesta en fragmentos vía un generador asíncrono).

### Por qué el embedding y la validación van en paralelo

Ninguno depende del resultado del otro — validar que el juego existe es una consulta a Postgres, generar el embedding es una llamada de red a un proveedor de IA. Lanzarlos con `Promise.all` en vez de uno detrás de otro ahorra ese tiempo sin ningún riesgo.

### Por qué ya no hay un paso de reordenar el contexto

Hubo un paso intermedio (`LLMContextRefiner`) que reordenaba los chunks recuperados por relevancia con una llamada de IA extra, antes de generar la respuesta — llegó a fusionar dos pasos en uno (reordenar + recortar) para bajar de tres llamadas de IA por pregunta a dos. Se eliminó por completo: `ContextBuilder` siempre incluía **todos** los chunks recuperados en el contexto final, reordenados o no, así que ese paso no cambiaba qué información llegaba a la respuesta — solo el orden en que la IA la leía, un efecto sutil. El coste, en cambio, era una llamada de IA completa y sin streaming que bloqueaba el inicio de cualquier respuesta, notándose en tiempos de espera de 30+ segundos en reglamentos densos. Ahora la generación empieza en cuanto termina la recuperación por vectores (que ya devuelve los chunks ordenados por similitud), sin ese paso intermedio.

## El sistema de proveedores de IA

Hay dos necesidades muy distintas que fácilmente se confunden si no se piensa con cuidado:

- **Generar texto**: cada llamada es independiente. Si un proveedor falla por cuota, no pasa nada por usar otro distinto en la siguiente llamada.
- **Generar embeddings**: los vectores de una misma base de conocimiento tienen que venir **siempre del mismo modelo**. Comparar un embedding de Gemini con uno de OpenAI no tiene ningún sentido, aunque tengan la "misma" dimensión.

```text
Chat (generateText / generateChat / refine)
    → FallbackLLMClient: prueba varios proveedores en orden
    → si uno falla por cuota, pasa automáticamente al siguiente

Embeddings (generate / generateBatch)
    → un único proveedor fijo, sin fallback
    → si no está configurado, el servidor NO arranca
```

Esta asimetría viene de un bug real de producción (ver [`ENGINEERING-NOTES.md`](./ENGINEERING-NOTES.md)) en el que mezclar proveedores de embeddings causaba errores 500 impredecibles. Detalle de cada proveedor en [`docs/AI.md`](./AI.md).

### Streaming

`ILLMClient` expone `generateTextStream()` como método opcional. **Gemini** usa `generateContentStream` del SDK oficial. Los **proveedores compatibles con OpenAI** (OpenRouter, Mistral, OpenAI, DeepInfra, Together) no tienen SDK propio, así que se hace `fetch` con `stream: true` y se parsea a mano el formato SSE de la API.

`FallbackLLMClient.generateTextStream()` trata el streaming distinto al resto: si un proveedor falla **antes** de emitir texto, prueba el siguiente. Si falla **a mitad** de una respuesta ya empezada, el error se propaga tal cual — no tiene sentido cambiar de proveedor cuando el usuario ya está viendo texto en pantalla.

## Autenticación

JWT con `bcrypt` para las contraseñas — sin sesiones en servidor: el propio token firmado (`userId` + expiración) es toda la prueba de identidad que necesita cada petición.

```text
POST /api/auth/register
    → PasswordHasher.hash() (bcrypt, 12 rondas)
    → PostgresUserRepository.create()
    → JwtService.sign({ userId })

Cualquier ruta protegida
    → requireAuth middleware → JwtService.verify(token) → userId
```

Decisiones de seguridad concretas:

- **Mismo mensaje de error** tanto si el email no existe como si la contraseña es incorrecta — evita revelar qué emails están registrados.
- **Comparación de contraseña simulada** (hash *dummy*) cuando el email no existe — evita un ataque de temporización.
- **Cambiar email o contraseña exige la contraseña actual**, incluso con sesión ya iniciada — un token robado no basta por sí solo.
- **Todas las mutaciones de favoritos/categorías/conversaciones filtran por `user_id` a nivel de SQL**, no solo de aplicación.

## Favoritos, categorías y conversaciones

Los tres siguen el mismo patrón: tablas propias con `user_id` como clave foránea y `ON DELETE CASCADE`. El **login es opcional** en el frontend — sin cuenta, estos datos funcionan en `localStorage`; con cuenta, se sincronizan aquí entre dispositivos.

Particularidad de las conversaciones: solo existe **una** conversación activa por (usuario, juego), no varios hilos guardados — coincide con el modelo que ya tenía el frontend en local. "Nueva conversación" borra las filas de esa combinación y empieza de cero. Cada conversación guarda como máximo los **30 mensajes más recientes** — al añadir uno que supere el límite, se borra automáticamente el más antiguo de esa misma conversación (recorte por cantidad, no por antigüedad, para no penalizar a quien vuelve tras un tiempo sin preguntar).

## Memoria conversacional y modo de jugadores

Dos señales opcionales que se pueden mandar junto a cada pregunta, sin que ninguna cambie nada si no se indican:

- **Historial** (`history`): los últimos turnos de la conversación, para que preguntas de seguimiento como "¿y con 5 jugadores?" tengan sentido. El *prompt* dice explícitamente que el historial es solo para entender el contexto de la pregunta, nunca una fuente de reglas por sí mismo — el reglamento (el `context` recuperado) sigue siendo la única fuente de verdad, así que la IA no puede dar por buena una afirmación de su propia respuesta anterior si no está respaldada por el contexto actual.
- **Número de jugadores** (`playerCount`): si el reglamento distingue reglas según cuántos jugadores hay, se aplican específicamente las que correspondan.

Ambas se recortan/validan en el servidor sin importar lo que mande el cliente: el historial se queda con los últimos 6 turnos como mucho (evita que una conversación de 30 mensajes infle el *prompt* de cada pregunta nueva), y `playerCount` se descarta silenciosamente si no es un entero razonable (1–99).

## Solicitud de juegos nuevos

```text
POST /api/game-requests (multipart/form-data, requiere sesión)
    ├─ valida nombre del juego y (si viene) el enlace a BGG
    ├─ sube cada PDF a B2 bajo pending-requests/<uuid>/
    ├─ genera un enlace de descarga firmado por archivo (7 días)
    ├─ guarda la solicitud en Postgres (game_requests) — ANTES de mandar el correo,
    │  para que la solicitud no se pierda si el correo llegara a fallar
    └─ EmailService.sendGameRequestNotification() (Resend)
```

Se guarda en Postgres (a diferencia de una versión anterior de este mismo diseño, que deliberadamente no lo hacía) porque ahora existe un panel de administración que necesita poder **listar** las solicitudes, no solo recibir un correo puntual por cada una. Se guarda la *ruta* de cada PDF en B2 (`pdf_keys`), no una URL firmada — las firmadas caducan a los 7 días, así que el panel regenera enlaces frescos cada vez que se lista (ver `ListGameRequestsUseCase`). Ver [`docs/CONFIGURATION.md`](./CONFIGURATION.md) sobre por qué el correo de confirmación solo llega a la cuenta propia, no a quien hace la solicitud.

## Valoración de respuestas

`POST /api/ratings` guarda pregunta, respuesta, juego y si fue 👍/👎 en una tabla independiente de `conversation_messages` — a propósito, porque esa tabla solo existe para usuarios con sesión iniciada, y aquí interesa poder valorar con o sin cuenta. Usa `optionalAuth` (no `requireAuth`): con sesión, se guarda de quién es la valoración; sin sesión, se guarda igualmente, solo que sin `user_id`.

`optionalAuth` es el primer *middleware* del proyecto que nunca rechaza la petición — intenta leer un token si lo hay, pero sigue adelante igual si no hay ninguno o es inválido, tratando la petición como de un invitado. Reutilizable para cualquier futuro endpoint con sesión opcional, no solo este.

## Panel de administración

Un único administrador, identificado por email (`ADMIN_EMAIL`) — no hay roles ni permisos más finos porque no hacen falta todavía. `requireAdmin` (que va después de `requireAuth` en la cadena de *middlewares*) consulta el email **actual** del usuario en la base de datos en cada petición, no uno guardado en el token — así, si el administrador cambiara de email, el cambio se aplica sin esperar a que caduquen los tokens ya emitidos.

Tres funciones, todas bajo `/api/admin`:

- **Revisar solicitudes de juegos**: listar (con enlaces de descarga regenerados en el momento) y marcar como revisada.
- **Restablecer contraseñas manualmente**: como no hay recuperación de contraseña por correo (la misma limitación de Resend que afecta a las solicitudes de juegos), el panel genera una contraseña temporal aleatoria que el administrador comunica por su propio canal personal — nunca por la app.
- **Resumen de valoraciones**: agregado de 👍/👎 por juego, más las últimas respuestas peor valoradas con su pregunta y respuesta completas, para detectar de un vistazo qué reglamentos necesitan revisión.

## Importación de un juego

```text
PDF
 ↓ Pdf2JsonExtractor → texto por página
 ↓ TextCleaner → texto limpio
 ↓ ChunkGenerator (600 caracteres, solape de 100)
Chunks (id: <gameId>-p<página>-c<índice>)
 ↓ EmbeddingGenerator (en lotes, con checkpoint de progreso)
 ↓ se sube el PDF y la portada a B2
 ↓ se escribe el juego, los documentos y los chunks en Postgres
```

Dos protecciones importantes en el paso de embeddings:

- **Checkpoint de progreso**: si la importación falla a mitad (típicamente por cuota agotada), el progreso se guarda en un archivo temporal local. Al reintentar, se retoma donde se quedó — pero solo si el proveedor de hoy genera la misma dimensión que el checkpoint de ayer; si no coincide, se descarta y se regenera todo desde cero.
- **Lotes con auto-recuperación**: los chunks se agrupan en lotes (`IMPORT_EMBEDDING_BATCH_SIZE`) para reducir peticiones HTTP. Si un proveedor no soporta pedir varios embeddings a la vez (algunos aceptan el lote sin error, pero devuelven solo 1 resultado), el sistema lo detecta y cae automáticamente a pedirlos uno a uno para ese lote.
