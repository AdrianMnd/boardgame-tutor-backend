# Desarrollo

## Flujo recomendado

Mantener dos entornos conceptuales:

```text
Desarrollo
├── frontend → Vite
└── backend  → Express

Producción
├── frontend → build estático
└── backend  → Node/Express
```

La configuración local recibida apunta a:

```text
Frontend API → http://localhost:3000
Backend      → puerto 3000
```

## Cambios en frontend

Después de modificar React:

```bash
npm run build
```

y opcionalmente:

```bash
npm run lint
```

## Cambios en backend

Después de modificar TypeScript:

```bash
npm run build
npm test
```

## Añadir un juego

1. Crear `games/<id>/`.
2. Añadir `metadata.json`.
3. Añadir el PDF en `source/rulebook.pdf`.
4. Añadir `assets/cover.png`.
5. Ejecutar:

```bash
npm run import <id>
```

## Probar RAG por CLI

```bash
npm run ask <id> "<pregunta>"
```

## Probar API

```text
GET  /
GET  /api/games
GET  /api/games/<id>/manual
POST /api/chat
```

## Errores habituales

### Juego no encontrado

Comprobar:

```text
games/<id>/metadata.json
```

y que el nombre de la carpeta coincida con `metadata.id`.

### Portada no visible

Comprobar:

```text
games/<id>/assets/cover.png
```

y la URL devuelta por `/api/games`.

### Embeddings agotados

Comprobar:

- `AI_PROVIDER_ORDER`;
- API keys disponibles;
- proveedores que soportan embeddings;
- `IMPORT_EMBEDDING_CONCURRENCY`;
- `IMPORT_EMBEDDING_REQUEST_DELAY`;
- checkpoint existente.

### Respuestas pobres del RAG

Comprobar:

- que exista `generated/knowledge.json`;
- que el embedding del índice sea compatible con el embedding de la consulta;
- número de chunks recuperados;
- score de similitud;
- reranker/compressor;
- contenido del reglamento extraído.

## No cambiar arquitectura sin comprobar

La aplicación depende actualmente del filesystem de `games/`. Cualquier migración a almacenamiento externo debe contemplar simultáneamente:

- repositorio de juegos;
- PDFs;
- portadas;
- conocimiento generado;
- checkpoints.
