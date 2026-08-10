# Importación de juegos

## Estructura necesaria

Para un juego con ID `wingspan`:

```text
games/
└── wingspan/
    ├── metadata.json
    ├── source/
    │   └── rulebook.pdf
    ├── assets/
    │   └── cover.png
    └── generated/
```

`metadata.json` debe contener:

```json
{
  "id": "wingspan",
  "name": "Wingspan",
  "language": "es",
  "version": "1.0",
  "minPlayers": 1,
  "maxPlayers": 5,
  "year": 2019
}
```

El `id` debe coincidir con el nombre de la carpeta.

## Ejecutar

Desde el backend:

```bash
npm run import wingspan
```

## Pasos internos

```text
1. Validación
2. Extracción PDF
3. Limpieza
4. Chunks
5. Embeddings
6. knowledge.json
```

## Checkpoint

Durante los embeddings se crea:

```text
games/<id>/generated/embeddings-checkpoint.json
```

Si el proceso falla, se conserva el progreso y el siguiente:

```bash
npm run import <gameId>
```

puede reutilizar los embeddings ya generados.

Cuando la importación termina correctamente, el checkpoint se elimina.

## Problemas de cuota

Si un proveedor devuelve un error de cuota/rate-limit y está considerado reintentable:

```text
FallbackLLMClient
    ↓
siguiente proveedor con soporte de embeddings
```

Si todos los proveedores capaces de embeddings fallan, la importación termina con error.

## Importación desde cero

Para regenerar conocimiento desde cero, eliminar el checkpoint correspondiente antes de volver a importar.

Si también se desea regenerar todos los embeddings, hay que considerar el contenido actual de `generated/knowledge.json` y el modelo utilizado.

## Portadas

El backend genera:

```text
/games/<id>/assets/cover.png
```

como `coverUrl`.

La imagen debe existir físicamente con ese nombre para que el `Sidebar` pueda mostrarla.

## Juegos actuales

La versión entregada contiene:

| ID | Nombre | Jugadores | Año |
|---|---|---:|---:|
| catan | Catan | 3-4 | 1995 |
| zombicide | Zombicide 2nd Edition | 1-6 | 2021 |
| nemesis | nemesis | 1-5 | 2018 |
| cdmd | Cthulhu Death May Die | 1-5 | 2019 |
