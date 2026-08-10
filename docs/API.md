# API

## GET /

Comprueba que el backend está disponible.

Respuesta:

```json
{
  "name": "BoardGame Tutor API",
  "version": "1.0.0"
}
```

## GET /api/games

Devuelve los juegos descubiertos desde `games/`.

Ejemplo:

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

Los valores exactos dependen de `metadata.json`.

## GET /api/games/:id/manual

Devuelve el reglamento PDF del juego.

Ejemplo:

```text
GET /api/games/catan/manual
```

El backend localiza:

```text
games/catan/source/rulebook.pdf
```

y lo envía con `sendFile`.

### Errores

- `400`: identificador inválido.
- `404`: juego no encontrado o reglamento no encontrado.

## POST /api/chat

Request:

```json
{
  "gameId": "catan",
  "question": "¿Cómo se gana la partida?"
}
```

Response:

```json
{
  "answer": "...",
  "sources": [
    {
      "id": "catan-p1-c1",
      "gameId": "catan",
      "page": 1,
      "score": 0.842,
      "text": "..."
    }
  ]
}
```

El score se redondea a tres decimales en `ChatMapper`.

## Archivos estáticos

El backend monta:

```text
/games
```

sobre la carpeta física:

```text
games/
```

Por ejemplo:

```text
GET /games/catan/assets/cover.png
```

sirve la portada.

## CORS

La versión actual usa:

```ts
app.use(cors());
```

No hay restricción de origen en el código entregado.

Para producción conviene restringir el origen permitido.

## Endpoints no implementados

El frontend actual contiene métodos en `GamesService` para:

```text
POST /api/games/import
DELETE /api/games/:id
```

pero las rutas entregadas en `games.routes.ts` solo registran:

```text
GET /
GET /:id/manual
```

Por tanto, esos dos métodos del frontend no deben considerarse endpoints disponibles de la API actual.

La importación real se ejecuta mediante:

```bash
npm run import <gameId>
```
