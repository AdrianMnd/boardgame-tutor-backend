# Juegos y almacenamiento

## Dónde vive cada cosa

```text
Postgres (tablas games, documents, chunks)   Backblaze B2
├── metadatos (nombre, jugadores, año...)     ├── <gameId>/source/rulebook.pdf
├── ruta del PDF (documents.storage_path)     └── <gameId>/assets/cover.png
├── ruta de la portada (games.cover_path)
└── texto + embedding de cada fragmento
```

`PostgresGameRepository` implementa `IGameRepository` — es la única pieza que sabe cómo se guardan los juegos; el resto de la aplicación solo conoce la interfaz de dominio.

## Metadata de un juego (al importar)

```json
{
  "id": "catan",
  "name": "Catan",
  "language": "es",
  "version": "1.0",
  "minPlayers": 3,
  "maxPlayers": 4,
  "year": 1995
}
```

El campo `id` debe coincidir con el nombre de la carpeta local en `games/<id>/` en el momento de importar (ver [`docs/CONFIGURATION.md`](./CONFIGURATION.md)) — esa carpeta es solo el punto de partida para `npm run import`, no algo que persista después: tras importar, el juego vive enteramente en Postgres y B2.

## Documentos

Un juego puede tener más de un documento (por ejemplo, reglamento + FAQ) — cada uno con su propio `id` *dentro* del juego (no global), nombre para mostrar, y ruta en B2. El importador actual crea siempre un documento con `id: "rulebook"` a partir de `source/rulebook.pdf`.

## Portadas

`games.cover_path` guarda la ruta dentro del bucket de B2 (ej. `catan/assets/cover.png`), o `NULL` si el juego no tiene portada. La API nunca expone esa ruta interna directamente — `GET /api/games/:id/cover` es quien lee de B2 y sirve el archivo, y `coverUrl` en la respuesta de `/api/games` ya viene como una URL completa lista para usar.

## Juegos incluidos actualmente

Para ver el catálogo real y actualizado, la fuente de verdad es la propia base de datos — `GET /api/games` en cualquier momento, o:

```sql
SELECT id, name, min_players, max_players, year FROM games ORDER BY name;
```

directamente en el "SQL Editor" de Neon.
