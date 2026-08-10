# Arquitectura

## Frontend

El frontend tiene una composición sencilla basada en componentes:

```text
main.tsx
└── QueryClientProvider
    └── ConversationProvider
        └── App
            └── Layout
                ├── Header
                └── Workspace
                    ├── Sidebar
                    └── Chat
                        └── Message
                            └── Sources

App
└── PdfViewer (overlay cuando se abre el manual)
```

### Estado global

`ConversationProvider` mantiene las conversaciones en React state y las persiste en:

```text
localStorage
```

La clave de almacenamiento se define dentro del contexto.

### Estado de datos remotos

TanStack React Query gestiona la consulta de:

```text
GET /api/games
```

### Comunicación HTTP

`services/apiClient.ts` utiliza `fetch` y antepone:

```text
VITE_API_URL
```

a los endpoints relativos.

## Backend

La organización sigue una separación por capas:

```text
src/
├── domain/
├── application/
├── infrastructure/
├── presentation/
├── shared/
├── config/
├── data/
└── types/
```

### Domain

Contiene contratos y lógica del dominio:

- juegos
- conocimiento
- embeddings
- prompts
- errores de dominio
- contratos de recuperación de conocimiento

### Application

Contiene casos de uso y comandos:

- listar juegos
- obtener manual
- preguntar
- importar juego
- comandos de prueba de proveedores

### Infrastructure

Contiene implementaciones concretas:

- filesystem Node
- repositorio basado en archivos
- extracción PDF
- generación de chunks
- embeddings
- escritura de conocimiento
- clientes de IA

### Presentation

Contiene Express:

- controllers
- DTOs
- mappers
- rutas
- errores HTTP

## Inyección de dependencias

`ApplicationContainer` construye:

```text
NodeFileSystem
    ↓
FileGameRepository
    ↓
ListGamesUseCase
GetGameManualUseCase
GameValidator

AIProviderFactory
    ↓
embeddingProvider
chatProvider
reranker
compressor

SemanticRetriever
ContextBuilder
AskQuestionUseCase
```

`application/container/Index.ts` exporta una instancia compartida del contenedor.

## Persistencia

No hay una base de datos en la versión entregada.

La fuente de verdad de los juegos es:

```text
games/
```

Los datos derivados del RAG se almacenan como JSON.

## Archivos importantes

### Juego

```text
games/<id>/metadata.json
games/<id>/source/rulebook.pdf
games/<id>/assets/cover.png
games/<id>/generated/knowledge.json
```

### Backend

```text
src/presentation/api/server.ts
src/application/container/ApplicationContainer.ts
src/infrastructure/repositories/FileGameRepository.ts
src/application/use-cases/ask-question/ask-question.use-case.ts
src/application/use-cases/import-game/import-game.use-case.ts
```

### Frontend

```text
src/App.tsx
src/services/apiClient.ts
src/services/games.service.ts
src/services/chat.service.ts
src/hooks/useChat.ts
src/contexts/ConversationContext.tsx
src/components/PdfViewer/PdfViewer.tsx
```
