# Backend

## Stack

- Node.js
- TypeScript
- Express 5
- pdf2json
- Vitest
- Google GenAI SDK
- APIs compatibles con OpenAI para varios proveedores

## Arranque

```bash
npm install
npm run dev
```

El script de desarrollo utiliza:

```text
tsx watch src/index.ts
```

## Servidor HTTP

`src/index.ts`:

- carga `.env`;
- crea Express;
- habilita CORS;
- habilita JSON;
- expone `/games` como estático;
- registra `/api/games`;
- registra `/api/chat`;
- inicia el servidor.

Rutas base:

```text
GET  /
GET  /api/games
GET  /api/games/:id/manual
POST /api/chat
```

## Repositorio de juegos

`FileGameRepository` descubre juegos leyendo:

```text
games/
```

Cada subdirectorio se interpreta como un `gameId`.

Para encontrar un juego exige:

```text
games/<gameId>/metadata.json
```

Los paths derivados son:

```text
root
metadata
source
rulebook
generated
chunks
knowledge
assets
```

El reglamento esperado por el repositorio es:

```text
games/<gameId>/source/rulebook.pdf
```

## Caso de uso: listar juegos

`ListGamesUseCase` obtiene los juegos desde `IGameRepository`.

`GamesController` transforma los resultados mediante `GameMapper`.

La portada se expone como:

```text
${API_PUBLIC_URL}/games/<gameId>/assets/cover.png
```

Si `API_PUBLIC_URL` no está definida, se utiliza:

```text
http://localhost:<PORT>
```

## Caso de uso: manual

`GetGameManualUseCase` obtiene el path del reglamento desde el repositorio.

El controller utiliza:

```text
response.sendFile(...)
```

Si el juego no existe devuelve `404`.

## Caso de uso: preguntas

`AskQuestionUseCase` ejecuta:

```text
1. Validación del juego
2. Embedding de la pregunta
3. Recuperación semántica
4. Reranking
5. Compresión
6. Construcción de contexto
7. Generación de respuesta
```

La respuesta incluye:

```text
answer
sources[]
```

## Caso de uso: importación

El comando es:

```bash
npm run import <gameId>
```

El caso de uso ejecuta:

```text
Validar juego
→ Extraer PDF
→ Limpiar texto
→ Generar chunks
→ Generar embeddings
→ Guardar knowledge.json
```

El proceso utiliza:

```text
generated/embeddings-checkpoint.json
```

para conservar el progreso de embeddings si el proceso falla.

Al completar correctamente la importación, el checkpoint se elimina.

## Comandos de consulta

```bash
npm run ask <gameId> <pregunta>
```

Ejemplo:

```bash
npm run ask catan "¿Cómo se gana la partida?"
```

El comando imprime la respuesta y las páginas de las fuentes.

## Tests

El proyecto usa Vitest.

Scripts:

```bash
npm test
npm run test:watch
npm run test:coverage
```

En la versión recibida hay tests del `GameValidator` y fakes para filesystem y embeddings.

## Build

```bash
npm run build
```

El script actual ejecuta:

```text
tsc --noEmit
```

No genera una carpeta `dist` mediante ese script.
