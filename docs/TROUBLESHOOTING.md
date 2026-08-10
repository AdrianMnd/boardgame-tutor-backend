# Troubleshooting

## El frontend no carga juegos

Comprobar:

```text
VITE_API_URL
```

y:

```text
GET /api/games
```

Si la API responde correctamente, revisar la consola del navegador.

## Las portadas no aparecen

Comprobar primero:

```text
GET /api/games
```

La respuesta debe incluir:

```text
coverUrl
```

Después abrir directamente la URL de `coverUrl`.

La URL debe apuntar al backend, no al servidor de Vite.

## El manual no abre

Probar:

```text
GET /api/games/<id>/manual
```

Comprobar que exista:

```text
games/<id>/source/rulebook.pdf
```

## El chat falla

Comprobar:

1. `gameId` válido.
2. `generated/knowledge.json`.
3. proveedor de embeddings disponible.
4. proveedor de chat disponible.
5. API key válida.
6. modelo configurado.
7. logs del backend.

## Error 429 de IA

El sistema tiene fallback entre proveedores para errores reintentables.

Comprobar:

```env
AI_PROVIDER_ORDER=
```

y que existan proveedores alternativos con API keys.

Para embeddings, recordar que OpenRouter no implementa embeddings en la versión actual.

## Embeddings incompatibles

`SimilarityCalculator` exige que los vectores tengan la misma dimensión.

Si se cambia de modelo de embeddings y se mezclan vectores de distintas dimensiones, la recuperación semántica fallará.

La solución es regenerar el conocimiento del juego con un modelo compatible.

## Importación interrumpida

Buscar:

```text
games/<id>/generated/embeddings-checkpoint.json
```

Volver a ejecutar:

```bash
npm run import <id>
```

El caso de uso intenta reanudar los chunks ya procesados.

## El juego no existe

Comprobar:

```text
games/<id>/metadata.json
```

y:

```json
"id": "<id>"
```

El ID de metadata debe coincidir con el directorio.

## El PDF tiene un nombre diferente

La implementación actual construye siempre:

```text
source/rulebook.pdf
```

Renombrar el archivo o adaptar `FileGameRepository`.

## CORS

El backend actual usa CORS abierto:

```ts
app.use(cors());
```

Si se restringe en producción, comprobar que el dominio real del frontend esté permitido.

## Build del backend

El script actual:

```bash
npm run build
```

solo ejecuta:

```text
tsc --noEmit
```

Es una comprobación de tipos, no una compilación a `dist`.

## Verificación

Antes de publicar una versión:

```bash
# frontend
npm run build
npm run lint

# backend
npm run build
npm test
```

