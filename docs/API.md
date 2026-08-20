# API

Base URL en local: `http://localhost:3000`. Todas las respuestas son JSON salvo donde se indica lo contrario.

## Autenticación

Los endpoints marcados con 🔒 requieren la cabecera:

```text
Authorization: Bearer <token>
```

El token se obtiene en `/api/auth/register` o `/api/auth/login`, y es un JWT firmado con `JWT_SECRET` (caducidad `JWT_EXPIRES_IN`, 30 días por defecto). Sin cabecera válida, estos endpoints responden `401`.

## Formato de errores

Cualquier error conocido (validación, no encontrado, no autenticado, conflicto) responde con este formato, con el código HTTP correspondiente:

```json
{ "error": "BAD_REQUEST", "message": "Descripción legible del problema." }
```

| HTTP | `error` | Cuándo |
|---|---|---|
| 400 | `BAD_REQUEST` | Datos de entrada inválidos o incompletos |
| 401 | `UNAUTHORIZED` | Token ausente/inválido, o contraseña incorrecta al confirmar un cambio sensible |
| 404 | `NOT_FOUND` | El recurso no existe |
| 409 | `CONFLICT` | Email ya registrado, etc. |
| 429 | `rate_limited` | Límite de peticiones superado (ver cada endpoint) |
| 500 | `internal_error` | Error no controlado |

Un error no controlado responde:

```json
{ "error": "internal_error", "message": "Ha ocurrido un error interno. Inténtalo de nuevo en unos segundos." }
```

Caso especial: si el error viene de comparar embeddings de dimensiones distintas, el mensaje señala explícitamente que hay que revisar `AI_EMBEDDING_PROVIDER` y volver a importar el juego afectado.

---

## Juegos

### `GET /api/games`

Lista todos los juegos.

```json
[
  {
    "id": "catan",
    "name": "Catan",
    "language": "es",
    "version": "1.0",
    "minPlayers": 3,
    "maxPlayers": 4,
    "year": 1995,
    "createdAt": "2020-01-01T00:00:00.000Z",
    "coverUrl": "http://localhost:3000/api/games/catan/cover",
    "documents": [{ "id": "rulebook", "name": "Reglamento" }]
  }
]
```

`createdAt` es la fecha de alta en el catálogo — el frontend lo usa para el aviso de "juegos nuevos". `coverUrl` es `null` si el juego no tiene portada.

### `GET /api/games/:id/cover`

Redirige (o sirve directamente) la imagen de portada, leída de B2. `404` si el juego no existe o no tiene portada.

### `GET /api/games/:id/manual`

Sirve el PDF del reglamento, leído de B2. `404` si el juego o el documento no existen.

---

## Chat

### `POST /api/chat`

Responde a una pregunta de una vez (sin streaming). Se mantiene por compatibilidad; el frontend usa la variante en streaming.

```json
// Petición
{
  "gameId": "catan",
  "question": "¿Cómo se gana la partida?",
  "history": [
    { "role": "user", "content": "¿cómo se gana?" },
    { "role": "assistant", "content": "Se gana al llegar a 10 puntos de victoria." }
  ],
  "playerCount": 4
}
```

`history` y `playerCount` son ambos **opcionales**. Sin ellos, la respuesta se comporta exactamente igual que antes de que existieran — ninguno cambia nada por defecto.

- `history`: últimos mensajes de la conversación, para entender preguntas de seguimiento ("¿y con 5 jugadores?"). El servidor se queda solo con los últimos 6 turnos, sin importar cuántos se manden — no hace falta recortarlo en el cliente.
- `playerCount`: con cuántos jugadores se está jugando esta partida. Si el reglamento distingue reglas según el número de jugadores, la respuesta las aplica específicamente. Entero entre 1 y 99; cualquier otro valor se descarta silenciosamente (no da error, simplemente se ignora).

```json
// Respuesta
{
  "answer": "...",
  "sources": [
    { "id": "catan-p8-c3", "gameId": "catan", "documentId": "rulebook", "documentName": "Reglamento", "page": 8, "score": 0.842, "text": "..." }
  ]
}
```

Si el contexto recuperado no responde de forma específica a la pregunta pero sí tiene algo relacionado, `answer` empieza con la frase "No se ha encontrado una respuesta específica a tu pregunta, pero esto es lo que se ha encontrado relacionado con el reglamento:", seguida de un resumen de lo relacionado. Solo si no hay nada relacionado en absoluto, `answer` es exactamente "No he encontrado esa información en el reglamento."

### `POST /api/chat/stream`

Misma petición que arriba (incluidos `history` y `playerCount`, igual de opcionales). La respuesta es *Server-Sent Events* (`Content-Type: text/event-stream`):

```text
event: sources
data: [{ "id": "...", "gameId": "...", "documentId": "...", "documentName": "...", "page": 8, "text": "...", "score": 0.842 }, ...]

event: chunk
data: { "text": "Para " }

event: chunk
data: { "text": "ganar " }

...

event: done
data: {}
```

El evento `sources` siempre llega primero — el contexto ya se conoce antes de empezar a generar texto — así que el frontend puede mostrarlas de inmediato y el texto según va llegando. Si algo falla a mitad de la generación, en vez de `done` llega:

```text
event: error
data: { "message": "..." }
```

Rate limit: `CHAT_RATE_LIMIT` peticiones/15 min por IP (20 por defecto) → `429` si se supera.

---

## Autenticación 👤

### `POST /api/auth/register`

```json
// Petición
{ "email": "ana@example.com", "password": "contraseñaSegura123", "displayName": "Ana" }
```

```json
// Respuesta (201)
{ "token": "...", "user": { "id": "...", "email": "ana@example.com", "displayName": "Ana" } }
```

`409` si el email ya está registrado.

### `POST /api/auth/login`

```json
{ "email": "ana@example.com", "password": "contraseñaSegura123" }
```

Misma respuesta que `register`. `401` con el mismo mensaje genérico tanto si el email no existe como si la contraseña es incorrecta (evita revelar qué cuentas existen).

### `GET /api/auth/me` 🔒

Devuelve `{ id, email, displayName }` del usuario del token.

### `PATCH /api/auth/me` 🔒

```json
{ "displayName": "Ana García" }
```

No pide contraseña — riesgo bajo.

### `PATCH /api/auth/me/email` 🔒

```json
{ "email": "nueva@example.com", "currentPassword": "contraseñaSegura123" }
```

`401` si `currentPassword` no coincide (nunca se llega a tocar el email). `409` si el nuevo email ya lo usa otra cuenta.

### `PATCH /api/auth/me/password` 🔒

```json
{ "currentPassword": "contraseñaSegura123", "newPassword": "otraContraseña456" }
```

`401` si `currentPassword` no coincide. `newPassword` debe tener al menos 8 caracteres.

Rate limit de todo `/api/auth/*`: `AUTH_RATE_LIMIT` peticiones/15 min por IP (10 por defecto).

---

## Favoritos 🔒

Todos requieren sesión.

### `GET /api/favorites`

```json
{ "gameIds": ["catan", "wingspan"] }
```

### `POST /api/favorites/:gameId`

Marca el juego como favorito. `204` sin cuerpo.

### `DELETE /api/favorites/:gameId`

Quita el juego de favoritos. `204` sin cuerpo.

---

## Categorías personalizadas 🔒

Todos requieren sesión.

### `GET /api/categories`

```json
[{ "id": "...", "name": "Cooperativos", "gameIds": ["catan"] }]
```

### `POST /api/categories`

```json
{ "name": "Cooperativos" }
```

Respuesta `201` con la categoría creada (`gameIds` vacío).

### `PATCH /api/categories/:categoryId`

```json
{ "name": "Nuevo nombre" }
```

### `DELETE /api/categories/:categoryId`

`204` sin cuerpo. Por diseño de la base de datos (`ON DELETE CASCADE`), borra también las asignaciones de juegos a esa categoría.

### `POST /api/categories/:categoryId/games/:gameId`

Añade el juego a la categoría. `204` sin cuerpo.

### `DELETE /api/categories/:categoryId/games/:gameId`

Quita el juego de la categoría. `204` sin cuerpo.

Todas las mutaciones comprueban a nivel de base de datos (`WHERE user_id = $1`) que la categoría pertenece a quien hace la petición — no basta con adivinar un `categoryId` ajeno.

---

## Conversaciones 🔒

Todos requieren sesión. Solo hay **una** conversación activa por (usuario, juego) — no varios hilos guardados.

### `GET /api/conversations/:gameId`

```json
[
  { "id": "...", "role": "user", "content": "¿Cómo se gana?", "sources": null, "createdAt": "..." },
  { "id": "...", "role": "assistant", "content": "...", "sources": [...], "createdAt": "..." }
]
```

### `POST /api/conversations/:gameId/messages`

```json
{ "role": "user", "content": "¿Cómo se gana?", "sources": null }
```

`role` es `"user"` o `"assistant"`. `sources` es opcional (solo tiene sentido para `"assistant"`). Respuesta `201` con el mensaje guardado.

Cada conversación (usuario + juego) guarda como máximo los **30 mensajes más recientes** — al añadir uno que supere ese límite, se borra automáticamente el más antiguo de esa misma conversación. Es transparente para quien usa la API: no hay ningún error ni aviso, simplemente el historial no crece sin límite.

### `DELETE /api/conversations/:gameId`

Borra todos los mensajes de esa conversación ("Nueva conversación"). `204` sin cuerpo.

---

## Solicitud de juegos nuevos 🔒

### `POST /api/game-requests`

Petición `multipart/form-data`, no JSON:

| Campo | Tipo | Obligatorio |
|---|---|---|
| `gameName` | texto | Sí |
| `bggUrl` | texto (debe contener `boardgamegeek.com`) | No |
| `pdfs` | uno o varios archivos PDF | No |

Límites: 150MB por archivo, 10 archivos como máximo (`multer`, error `400` con mensaje explicativo si se superan). Solo se aceptan archivos con tipo `application/pdf`.

Al recibirse: cada PDF se sube a B2 bajo `pending-requests/<uuid>/`, se genera un enlace de descarga firmado (válido 7 días), y se manda un correo (Resend) a `NOTIFICATION_EMAIL` con el nombre del juego, el enlace a BGG y los enlaces de descarga. Quien hace la solicitud no recibe ningún correo (ver [`CONFIGURATION.md`](./CONFIGURATION.md) sobre esta limitación) — ve una confirmación directamente en la interfaz.

Respuesta `204` sin cuerpo si todo va bien.

Rate limit: `GAME_REQUEST_RATE_LIMIT` peticiones/hora por IP (5 por defecto) — más bajo que el resto, ya que cada petición sube archivos y manda un correo.

---

## Valoración de respuestas

### `POST /api/ratings`

Sesión **opcional** — funciona igual con o sin cuenta, pero si hay sesión iniciada se guarda de quién es la valoración.

```json
{
  "gameId": "catan",
  "question": "¿Cómo se gana?",
  "answer": "Se gana al llegar a 10 puntos de victoria.",
  "rating": "up"
}
```

`rating` es `"up"` o `"down"`. Respuesta `204` sin cuerpo. No hay ningún endpoint para consultar o cambiar una valoración ya enviada — es una señal de un solo sentido, pensada para que el mantenedor revise qué respuestas fallan más (ver `GET /api/admin/ratings/summary`).

---

## Administración 🔒👑

Todos los endpoints bajo `/api/admin` requieren sesión **y** que el email de la cuenta coincida con `ADMIN_EMAIL` — con sesión pero sin ser el administrador, responden `401` igual que sin sesión en absoluto (no se distingue el motivo, para no dar pistas de que el endpoint existe).

### `GET /api/admin/game-requests`

Lista las solicitudes de juegos nuevos, no revisadas primero. Cada elemento incluye enlaces de descarga **firmados en el momento de la petición** (no los que se mandaron por correo en su día, que ya podrían haber caducado a los 7 días).

```json
[
  {
    "id": "...",
    "requesterName": "Ana",
    "requesterEmail": "ana@example.com",
    "gameName": "Wingspan",
    "bggUrl": "https://boardgamegeek.com/boardgame/266192/wingspan",
    "pdfLinks": ["https://..."],
    "reviewed": false,
    "createdAt": "..."
  }
]
```

### `PATCH /api/admin/game-requests/:id/reviewed`

Marca una solicitud como revisada. `204` sin cuerpo. No hay endpoint para "desmarcar" — es intencionado, no un descuido.

### `POST /api/admin/users/reset-password`

```json
{ "email": "usuario@example.com" }
```

Genera una contraseña temporal aleatoria, la guarda (hasheada) para esa cuenta, y la **devuelve una única vez** en la respuesta:

```json
{ "temporaryPassword": "Xk29fpQzR1a" }
```

No hay recuperación de contraseña por correo (ver la limitación de Resend en [`CONFIGURATION.md`](./CONFIGURATION.md)) — este endpoint existe para que el administrador comunique la contraseña temporal manualmente, por su propio correo personal. `404` si no existe ninguna cuenta con ese email.

### `GET /api/admin/ratings/summary`

```json
{
  "byGame": [
    { "gameId": "catan", "gameName": "Catan", "up": 12, "down": 3 }
  ],
  "recentNegative": [
    {
      "gameId": "catan",
      "gameName": "Catan",
      "question": "¿Cómo se comercia con el banco?",
      "answer": "No he encontrado esa información en el reglamento.",
      "createdAt": "..."
    }
  ]
}
```

`byGame` ordenado con más valoraciones negativas primero. `recentNegative` son las últimas 15 respuestas marcadas con 👎, con la pregunta y la respuesta completas — pensado para detectar de un vistazo qué reglamentos necesitan revisión.

---

## Salud

### `GET /health`

Sin autenticación, sin base de datos, sin proveedores de IA — solo confirma que el proceso está vivo. Pensado para un servicio externo de monitorización (UptimeRobot, cron-job.org...) que le haga ping periódicamente y reduzca los arranques en frío del plan gratuito de Render.

```json
{ "status": "ok" }
```

No cuenta contra ningún límite de tasa.

---

## Archivos estáticos

Ninguno — a diferencia de versiones anteriores del proyecto, ya no se sirve nada directamente desde el sistema de archivos del servidor. Portadas y PDF se leen de B2 bajo demanda (`GET /api/games/:id/cover` y `/manual`).

## CORS

Restringido a una lista explícita de orígenes: el dominio de producción del frontend, más cualquiera que se añada en `FRONTEND_URL` (para desarrollo local).
