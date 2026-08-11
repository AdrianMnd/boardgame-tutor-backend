# BoardGame Tutor

BoardGame Tutor es una aplicación web que permite seleccionar un juego de mesa, consultar su reglamento mediante lenguaje natural y abrir el reglamento PDF para revisar las páginas utilizadas como fuente.

## Arquitectura

```text
┌───────────────────────────────┐
│ React + Vite                  │
│ Frontend                      │
│                               │
│ Sidebar · Chat · PDF Viewer   │
└───────────────┬───────────────┘
                │ HTTP/JSON
                ▼
┌───────────────────────────────┐
│ Node.js + Express             │
│ Backend                       │
│                               │
│ API · RAG · IA · importador   │
└───────────────┬───────────────┘
                │
                ▼
        games/<gameId>/
        ├── metadata.json
        ├── source/rulebook.pdf
        ├── generated/
        │   ├── knowledge.json
        │   └── embeddings-checkpoint.json (temporal)
        └── assets/cover.png
```

## Tecnologías

### Frontend

- React 19
- TypeScript 6
- Vite 8
- TanStack React Query
- Axios (dependencia instalada; el cliente actual usa `fetch`)
- React Router DOM (dependencia instalada; la aplicación actual no registra rutas)
- `react-pdf` y `pdfjs-dist` (el visor actual utiliza un `iframe`)
- React Markdown
- remark-gfm
- rehype-highlight / highlight.js
- lucide-react

### Backend

- Node.js
- TypeScript
- Express 5
- `tsx`
- `pdf2json`
- Vitest
- Google GenAI SDK
- clientes compatibles con la API de OpenAI para varios proveedores

## Desarrollo local

### Frontend

```bash
cd boardgame-tutor-frontend
npm install
npm run dev
```

La configuración entregada contiene:

```env
VITE_API_URL=http://localhost:3000
API_PUBLIC_URL=http://localhost:3000
```

`VITE_API_URL` es la variable utilizada por el frontend para las llamadas HTTP.

### Backend

```bash
cd boardgame-tutor-backend
npm install
npm run dev
```

El backend utiliza el puerto definido por `PORT` y, si no existe, usa `3000`.

## Scripts

### Frontend

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

### Backend

```bash
npm run dev
npm run build
npm run import <gameId>
npm run ask <gameId> <pregunta>
npm test
npm run test:watch
npm run test:coverage
```

También existen comandos de prueba individuales para los proveedores:

```bash
npm run test:gemini
npm run test:openrouter
npm run test:mistral
npm run test:openai
npm run test:deepinfra
npm run test:together
```

## Juegos incluidos en la versión documentada

- `catan`
- `zombicide`
- `nemesis`
- `cdmd` (Cthulhu Death May Die)

Cada juego se descubre leyendo la carpeta `games/`; no existe un registro obligatorio adicional para que `FileGameRepository` lo encuentre.

## Flujo de una pregunta

```text
Frontend
  │
  │ POST /api/chat
  ▼
ChatController
  │
  ▼
AskQuestionUseCase
  │
  ├── valida el juego
  ├── genera embedding de la pregunta
  ├── recupera chunks semánticos
  ├── reordena contexto
  ├── comprime contexto
  ├── construye contexto
  └── genera respuesta
  │
  ▼
ChatMapper
  │
  ▼
answer + sources
```

## Flujo de importación

```text
PDF
 ↓
Pdf2JsonExtractor
 ↓
TextCleaner
 ↓
ChunkGenerator
 ↓
EmbeddingGenerator
 ↓
KnowledgeWriter
 ↓
generated/knowledge.json
```

El proceso dispone de checkpoints para poder reanudar una importación interrumpida durante la generación de embeddings.

## Visor PDF

El frontend solicita:

```text
GET /api/games/:id/manual
```

El backend devuelve el PDF con `response.sendFile()`.

El frontend utiliza la URL resultante como fuente de un `iframe`. Las fuentes de las respuestas pueden abrir el visor en una página concreta.

## Seguridad de configuración

No deben subirse valores de claves API al repositorio.

## Estado y límites conocidos

- El almacenamiento de juegos es filesystem local (`games/`).
- La persistencia de conversaciones del frontend se realiza en `localStorage`.
- El backend expone `games/` como contenido estático.
- El frontend y backend están desacoplados por URL mediante `VITE_API_URL`.
- El backend tiene fallback entre proveedores de IA.
- OpenRouter está configurado como cliente de chat compatible con OpenAI, pero su cliente actual declara que no implementa embeddings.
- Las APIs de importación y borrado que aparecen como métodos en `GamesService` del frontend no tienen rutas equivalentes en el backend entregado; la importación disponible actualmente es un comando CLI.
