# BoardGame Tutor — Backend

[![CI](https://github.com/AdrianMnd/boardgame-tutor-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/AdrianMnd/boardgame-tutor-backend/actions/workflows/ci.yml)

🔗 **[Ver la aplicación en vivo](https://boardgametutor.vercel.app)** (este repositorio es la API — la interfaz está en el [repositorio del frontend](https://github.com/AdrianMnd/boardgame-tutor-frontend))

API REST en Node.js/Express para **BoardGame Tutor**, una aplicación de preguntas y respuestas sobre reglamentos de juegos de mesa mediante RAG (*Retrieval-Augmented Generation*): el usuario pregunta en lenguaje natural, la API recupera los fragmentos más relevantes del PDF del reglamento y genera una respuesta citando las páginas exactas usadas como fuente.

Repositorio del frontend: [boardgame-tutor-frontend](https://github.com/AdrianMnd/boardgame-tutor-frontend)

![Ejemplo de conversación con fuentes citadas](docs/screenshots/conversacion.png)

## Características

- **RAG completo**: extracción de PDF → *chunking* → embeddings → búsqueda por similitud coseno → generación de respuesta con contexto.
- **Streaming de respuestas** (Server-Sent Events): el texto aparece progresivamente en vez de esperar a la respuesta completa.
- **6 proveedores de IA soportados** (Gemini, OpenRouter, Mistral, OpenAI, DeepInfra, Together) con *fallback* automático ante fallos de cuota — y también un modelo de embeddings local (`transformers.js`) sin dependencias externas.
- **Consistencia de embeddings garantizada por diseño**: a diferencia del chat (donde varios proveedores son intercambiables), los embeddings usan siempre un único proveedor fijo — mezclar proveedores distintos rompería la búsqueda por similitud, así que el sistema se niega a arrancar si no está configurado de forma inequívoca.
- **Importación de juegos resiliente**: *checkpoints* para reanudar una importación interrumpida por cuota agotada, embeddings en lote (menos peticiones HTTP), y verificación automática de que no queden fragmentos con embeddings incompletos o inconsistentes.
- **Rate limiting** por IP en el endpoint de chat, para proteger la cuota de los proveedores de pago.
- Arquitectura por capas (dominio / aplicación / infraestructura / presentación), con inyección de dependencias manual.

## Arquitectura

```text
┌───────────────────────────────┐
│ React + Vite                  │
│ Frontend                      │
│                                │
│ Sidebar · Chat · PDF Viewer   │
└───────────────┬───────────────┘
                │ HTTP/JSON + SSE
                ▼
┌───────────────────────────────┐
│ Node.js + Express             │
│ Backend                       │
│                                │
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

## Flujo de una pregunta

```text
Frontend
  │
  │ POST /api/chat/stream
  ▼
ChatController
  │
  ▼
AskQuestionUseCase
  │
  ├── valida el juego            ─┐
  ├── genera embedding            ├─ en paralelo
  │                              ─┘
  ├── recupera chunks por similitud
  ├── reordena y recorta el contexto (1 sola llamada de IA)
  └── genera la respuesta (streaming)
  │
  ▼
sources + respuesta en fragmentos (SSE)
```

## Flujo de importación de un juego

```text
PDF
 ↓
Pdf2JsonExtractor
 ↓
TextCleaner
 ↓
ChunkGenerator
 ↓
EmbeddingGenerator (en lotes, con checkpoint de progreso)
 ↓
KnowledgeWriter
 ↓
generated/knowledge.json
```

## Tecnologías

- Node.js + TypeScript
- Express 5
- Vitest
- `@google/genai` (Gemini)
- `@huggingface/transformers` (embeddings locales, opcional)
- `pdf2json`
- `express-rate-limit`

## Puesta en marcha local

```bash
npm install
cp .env.example .env
# Rellena .env con al menos una API key de un proveedor de IA
npm run dev
```

El servidor arranca en el puerto definido por `PORT` (por defecto `3000`).

**Importante**: revisa `AI_EMBEDDING_PROVIDER` en `.env.example` — es obligatoria, y debe tener el mismo valor en cualquier entorno donde importes juegos o sirvas preguntas (ver los comentarios del propio archivo para el porqué).

## Scripts

```bash
npm run dev              # servidor en desarrollo (hot reload)
npm run build             # compilar TypeScript
npm start                 # ejecutar la build compilada
npm run import <gameId>   # importar un juego (PDF → embeddings)
npm run ask <gameId> <p>  # preguntar desde la CLI, sin pasar por HTTP
npm run check:embeddings  # detectar juegos con embeddings dañados/inconsistentes
npm test                  # tests (Vitest)
npm run test:coverage     # tests con cobertura
```

Comandos de prueba individuales por proveedor: `test:gemini`, `test:openrouter`, `test:mistral`, `test:openai`, `test:deepinfra`, `test:together`, `test:local-embedding`.

## Juegos incluidos

Cada carpeta bajo `games/` se descubre automáticamente; no hace falta registrarla en ningún otro sitio. Actualmente incluye 10 juegos importados (Catan, Zombicide, Nemesis, Cthulhu: Death May Die, Arkham Horror LCG, Marvel Champions, Mansiones de la Locura, Terraforming Mars, Trivial Pursuit y Nemesis: Represalia).

## Visor de PDF

```text
GET /api/games/:id/manual
```

El frontend renderiza el PDF con `pdf.js` directamente en la propia aplicación (no delegado al visor nativo del navegador), lo que garantiza que el salto a una página concreta funcione igual en cualquier dispositivo — incluidos navegadores móviles, donde el visor de PDF integrado no siempre respeta el estándar de apertura en una página específica.

## Seguridad

- Ninguna clave de API se sube nunca al repositorio (`.env` está en `.gitignore`).
- Rate limiting configurable (`CHAT_RATE_LIMIT`) en el endpoint de chat.
- CORS restringido a orígenes explícitos (`FRONTEND_URL` para desarrollo local, más el dominio de producción).

## Limitaciones conocidas

- `npm audit` reporta 4 vulnerabilidades de severidad alta, todas en dependencias transitivas de `@huggingface/transformers` (el motor de embeddings locales, opcional) sin parche disponible todavía por parte de sus mantenedores. No afectan si no activas `LOCAL_EMBEDDING_ENABLED`.
- El almacenamiento de juegos es el sistema de archivos local (`games/`); no hay base de datos.
- La persistencia de conversaciones vive en `localStorage` del navegador, no en el backend.

## Licencia

ISC — ver [LICENSE](./LICENSE).

## Más documentación

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — el pipeline RAG en detalle, el sistema de proveedores de IA (por qué embeddings y chat se tratan de forma distinta), streaming.
- [`docs/API.md`](docs/API.md) — referencia completa de endpoints, incluido el protocolo SSE.
- [`docs/CONFIGURATION.md`](docs/CONFIGURATION.md) — variables de entorno, despliegue, cómo importar un juego nuevo.
- [`docs/ENGINEERING-NOTES.md`](docs/ENGINEERING-NOTES.md) — problemas reales de producción encontrados y resueltos durante el desarrollo.
