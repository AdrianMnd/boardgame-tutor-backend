# Importación de juegos

Guía práctica del comando `npm run import`. Para el porqué de cada decisión de diseño del pipeline, ver [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md); para el formato de `metadata.json`, [`docs/CONFIGURATION.md`](./CONFIGURATION.md).

## Estructura necesaria (local, temporal)

```text
games/
└── wingspan/
    ├── metadata.json
    ├── source/
    │   └── rulebook.pdf
    └── assets/
        └── cover.png
```

Esta carpeta es solo el punto de partida — no se despliega ni persiste en ningún sitio. Tras `npm run import`, todo el contenido relevante ya está en Postgres (metadatos, chunks con embeddings) y B2 (el PDF y la portada); la carpeta local se puede borrar sin perder nada.

## Ejecutar

```bash
npm run import wingspan
```

## Pasos internos

```text
1. Validar metadata.json
2. Extraer texto del PDF (Pdf2JsonExtractor)
3. Limpiar el texto (TextCleaner)
4. Dividir en chunks (ChunkGenerator)
5. Generar embeddings (en lotes, con checkpoint)
6. Subir el PDF y la portada a B2
7. Escribir el juego, documentos y chunks en Postgres
```

## Checkpoint de progreso

Durante el paso de embeddings se guarda un archivo de checkpoint local temporal. Si el proceso falla (típicamente por cuota agotada), basta con volver a ejecutar el mismo comando:

```bash
npm run import wingspan
```

Retoma desde donde se quedó, **siempre que el proveedor de embeddings no haya cambiado** entre el primer intento y el reintento — si cambió, el checkpoint se descarta automáticamente y se regenera todo desde cero, para no mezclar embeddings de dimensiones distintas dentro del mismo juego. El checkpoint se elimina al completarse la importación con éxito.

## Problemas de cuota durante la importación

Los embeddings **no** tienen *fallback* entre proveedores (a diferencia del chat) — si `AI_EMBEDDING_PROVIDER` se queda sin cuota, la importación falla con ese proveedor concreto. El checkpoint permite reanudar más tarde, sin volver a procesar los chunks ya completados.

## Reimportar un juego desde cero

Volver a ejecutar `npm run import <id>` sobrescribe el juego existente en Postgres (metadatos, documentos y chunks) y los archivos en B2. Útil tras cambiar `AI_EMBEDDING_PROVIDER`, o si se corrigió algo en el PDF de origen.

## Verificar el estado de los juegos importados

```bash
npm run check:embeddings
```

Recorre todos los juegos en la base de datos y avisa de cuáles tienen chunks sin embedding o con dimensiones inconsistentes — útil tras varias importaciones, o si se sospecha que alguna quedó a medias sin que se notara en su momento.
