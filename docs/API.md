# API

Base URL en local: `http://localhost:3000`.

## `GET /`

Comprueba que el backend está disponible.

```json
{ "name": "BoardGame Tutor API", "version": "1.0.0" }
```

## `GET /api/games`

Devuelve los juegos descubiertos en `games/`.

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
    "coverUrl": "http://localhost:3000/games/catan/assets/cover.png"
  }
]
```

## `GET /api/games/:id/manual`

Devuelve el PDF del reglamento (`games/<id>/source/rulebook.pdf`) con `response.sendFile()`.

- `400` si el identificador es inválido.
- `404` si el juego o el PDF no existen.

## `POST /api/chat`

Responde a una pregunta de una vez (sin streaming). Se mantiene por compatibilidad; el frontend actual usa la variante en streaming.

Petición:

```json
{ "gameId": "catan", "question": "¿Cómo se gana la partida?" }
```

Respuesta:

```json
{
  "answer": "...",
  "sources": [
    { "id": "catan-p8-c3", "gameId": "catan", "page": 8, "score": 0.842, "text": "..." }
  ]
}
```

`score` se redondea a 3 decimales.

## `POST /api/chat/stream`

Igual que `/api/chat`, pero devuelve la respuesta como *Server-Sent Events* a medida que se genera. Misma petición que arriba; la respuesta es un stream con `Content-Type: text/event-stream`:

```text
event: sources
data: [{ "id": "...", "gameId": "...", "page": 8, "text": "...", "score": 0.842 }, ...]

event: chunk
data: { "text": "Para " }

event: chunk
data: { "text": "ganar " }

...

event: done
data: {}
```

Si algo falla a mitad de la generación, en vez de `done` llega:

```text
event: error
data: { "message": "..." }
```

El evento `sources` siempre llega primero — el contexto ya se conoce antes de empezar a generar texto — así que el frontend puede mostrar las fuentes de inmediato y el texto de la respuesta según va llegando.

Este endpoint tiene *rate limiting* (`CHAT_RATE_LIMIT`, 20 peticiones/15 min por IP por defecto); al superarlo responde `429`:

```json
{ "error": "rate_limited", "message": "Demasiadas preguntas seguidas. Espera unos minutos antes de volver a preguntar." }
```

## Archivos estáticos

`/games/<id>/assets/cover.png` y cualquier otro archivo bajo `games/` se sirve directamente como contenido estático.

## Manejo de errores

Cualquier excepción no controlada en una ruta llega a un middleware de error global que responde JSON en vez de la página HTML por defecto de Express:

```json
{ "error": "internal_error", "message": "Ha ocurrido un error interno. Inténtalo de nuevo en unos segundos." }
```

Hay un caso especial: si el error viene de comparar embeddings de dimensiones distintas, el mensaje señala explícitamente que hay que revisar `AI_EMBEDDING_PROVIDER` y volver a importar el juego afectado, en vez de un mensaje genérico.

## CORS

Restringido a una lista explícita de orígenes: el dominio de producción del frontend, más cualquiera que se añada en `FRONTEND_URL` (para desarrollo local).
