# Juegos y almacenamiento

## Estructura

```text
games/
└── <gameId>/
    ├── metadata.json
    ├── source/
    │   └── rulebook.pdf
    ├── generated/
    │   ├── knowledge.json
    │   └── embeddings-checkpoint.json
    └── assets/
        └── cover.png
```

`chunks.json` forma parte del modelo de paths del dominio, aunque el flujo actual de `KnowledgeWriter` escribe `knowledge.json`.

## Metadata

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

## Repositorio

`FileGameRepository` no utiliza una base de datos.

Hace:

```text
listDirectories(games)
    ↓
findById(directory)
    ↓
metadata.json
```

Los directorios sin `metadata.json` se ignoran en el listado.

## Juegos incluidos

### Catan

```text
id: catan
language: es
version: 1.0
players: 3-4
year: 1995
```

### Zombicide 2nd Edition

```text
id: zombicide
language: es
version: 1.0
players: 1-6
year: 2021
```

El PDF actual se llama:

```text
Zombicide-2aedicion_reglamento_(spanish).pdf
```

El repositorio, sin embargo, construye el path estándar:

```text
source/rulebook.pdf
```

Por tanto, para que el flujo estándar del repositorio encuentre ese reglamento, el archivo debe estar disponible con el nombre esperado.

### Nemesis

```text
id: nemesis
language: es
version: 1.0
players: 1-5
year: 2018
```

### Cthulhu Death May Die

```text
id: cdmd
name: Cthulhu Death May Die
language: es
version: 1.0
players: 1-5
year: 2019
```

## Portadas

La API devuelve siempre:

```text
/games/<id>/assets/cover.png
```

Por tanto, `cover.png` es el nombre canónico utilizado por el frontend actual.

En la copia recibida, `nemesis` y `cdmd` contienen además `cover.jpg`, pero el mapper no utiliza ese archivo.

## PDF

El path canónico utilizado por `FileGameRepository` es:

```text
games/<id>/source/rulebook.pdf
```

Cualquier juego cuyo PDF tenga otro nombre debe adaptarse a esa convención o requeriría cambiar el repositorio.
