-- Esquema de BoardGame Tutor — Neon (Postgres) + pgvector
--
-- Sustituye a la antigua carpeta games/ como fuente de verdad
-- en producción. Los PDF y portadas viven aparte, en Backblaze
-- B2 (bucket privado) — aquí solo se guarda su ruta.
--
-- Para aplicarlo: pega este archivo en el "SQL Editor" del
-- panel de Neon, o ejecútalo con psql apuntando a tu
-- DATABASE_URL.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS games (

    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    language      TEXT NOT NULL,
    version       TEXT NOT NULL,
    min_players   INTEGER NOT NULL,
    max_players   INTEGER NOT NULL,
    year          INTEGER NOT NULL,

    -- Ruta del archivo dentro del bucket de B2, ej.
    -- "catan/assets/cover.png". NULL si el juego no tiene
    -- portada todavía.
    cover_path    TEXT,

    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()

);

CREATE TABLE IF NOT EXISTS documents (

    -- Identificador DENTRO del juego, no global — ej.
    -- "rulebook", "faq-2026". La clave primaria real es el par
    -- (game_id, id).
    id             TEXT NOT NULL,

    game_id        TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,

    name           TEXT NOT NULL,

    -- Ruta del PDF dentro del bucket de B2, ej.
    -- "catan/source/rulebook.pdf".
    storage_path   TEXT NOT NULL,

    PRIMARY KEY (game_id, id)

);

CREATE TABLE IF NOT EXISTS chunks (

    id            TEXT PRIMARY KEY,
    game_id       TEXT NOT NULL,
    document_id   TEXT NOT NULL,
    page          INTEGER NOT NULL,
    chunk_index   INTEGER NOT NULL,
    text          TEXT NOT NULL,

    -- gemini-embedding-001 devuelve 3072 dimensiones. Si algún
    -- día se cambia de proveedor/dimensión, esta tabla habría
    -- que recrearla (o añadir una columna nueva) — no se pueden
    -- mezclar dimensiones distintas en la misma columna vector.
    embedding     VECTOR(3072) NOT NULL,

    FOREIGN KEY (game_id, document_id)
        REFERENCES documents(game_id, id) ON DELETE CASCADE

);

-- Índices para las consultas que hace la aplicación:
-- - listar/filtrar chunks de un juego concreto antes de comparar
--   por similitud (la comparación en sí no lleva índice HNSW/IVF
--   a propósito — con el volumen de esta app, una búsqueda
--   exacta sobre "los chunks de este juego" ya es rapidísima, y
--   evita la complejidad y las aproximaciones de un índice
--   vectorial que aquí no hace falta).
CREATE INDEX IF NOT EXISTS idx_chunks_game_id
    ON chunks(game_id);

CREATE INDEX IF NOT EXISTS idx_documents_game_id
    ON documents(game_id);
