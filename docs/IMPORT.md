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

## Rellenar `metadata.json` automáticamente desde BoardGameGeek (opcional)

```bash
npm run fetch-bgg <idLocal> <idOrUrlDeBGG>

# Ejemplos:
npm run fetch-bgg catan 13
npm run fetch-bgg catan https://boardgamegeek.com/boardgame/13/catan
```

Consulta la API pública de BGG y escribe (o completa) `games/<idLocal>/metadata.json` con el nombre, año y número de jugadores — crea también las carpetas `source/` y `assets/` si no existían. **Nunca pisa un campo que ya estuviera relleno a mano** — así que si ya se había corregido algo (o si ya se ejecutó antes y solo hace falta rellenar lo que falta), no hay que preocuparse de perderlo. El idioma y la versión del reglamento **no** los rellena (BGG no los conoce) — siempre quedan con un valor por defecto (`es`, `1.0`) la primera vez, a revisar a mano.

> **Estado actual: bloqueado, pendiente de aprobación de BGG.** Tras probarlo, BoardGameGeek exige ahora aprobación explícita para usar su API (`Unauthorized. See https://boardgamegeek.com/using_the_xml_api` — confirmado directamente en el navegador, no solo desde este comando, así que no es un problema del código). Ya se ha solicitado esa aprobación; hasta que llegue, `npm run fetch-bgg` fallará siempre con un error 401. **Esto no bloquea nada más** — sigue funcionando exactamente igual que antes de que existiera este comando: rellenar `metadata.json` a mano y ejecutar `npm run import` como siempre. En cuanto se apruebe el acceso, se revisará si hace falta algo más que la cabecera `User-Agent` ya añadida (posiblemente una clave de API en las peticiones).

**Si el `id` de dentro de `metadata.json` no coincide con el nombre de la carpeta** (por ejemplo, al usar `fetch-bgg` con un id local distinto al que luego se usa para importar), `npm run import` **ya no falla** — el identificador real del juego (usado en Postgres y B2) es siempre el `id` de dentro de `metadata.json`, nunca el nombre de la carpeta, que solo sirve para localizar los archivos en disco. Si hay un desajuste, se muestra un aviso informativo (no un error) por si no era intencionado.


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
