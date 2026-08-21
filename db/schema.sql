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

-- ============================================================
-- Usuarios, favoritos y categorías personalizadas
--
-- El login es opcional: sin cuenta, favoritos/categorías siguen
-- funcionando en localStorage como hasta ahora (ver frontend).
-- Con cuenta, se guardan aquí y así se conservan al cambiar de
-- dispositivo (incluida la futura app de Android).
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (

    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email           TEXT NOT NULL UNIQUE,

    -- Nunca se guarda la contraseña en sí, solo su hash con
    -- bcrypt (ver src/infrastructure/auth/PasswordHasher.ts).
    password_hash   TEXT NOT NULL,

    display_name    TEXT NOT NULL,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()

);

CREATE TABLE IF NOT EXISTS user_favorites (

    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    game_id     TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,

    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (user_id, game_id)

);

CREATE TABLE IF NOT EXISTS user_categories (

    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    name        TEXT NOT NULL,

    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()

);

CREATE TABLE IF NOT EXISTS user_category_games (

    category_id     UUID NOT NULL REFERENCES user_categories(id) ON DELETE CASCADE,

    game_id         TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,

    PRIMARY KEY (category_id, game_id)

);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id
    ON user_favorites(user_id);

CREATE INDEX IF NOT EXISTS idx_user_categories_user_id
    ON user_categories(user_id);

CREATE INDEX IF NOT EXISTS idx_user_category_games_category_id
    ON user_category_games(category_id);

-- ============================================================
-- Historial de conversación por (usuario, juego)
--
-- Solo hay UNA conversación activa por juego (igual que ya
-- funciona en localStorage sin sesión) — no varios hilos
-- guardados. "Nueva conversación" borra las filas de esa
-- (usuario, juego) y empieza de cero. Igual que el resto de
-- datos de usuario, el login es opcional: sin cuenta, sigue
-- funcionando solo en localStorage.
-- ============================================================

CREATE TABLE IF NOT EXISTS conversation_messages (

    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    game_id     TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,

    role        TEXT NOT NULL CHECK (role IN ('user', 'assistant')),

    content     TEXT NOT NULL,

    -- Solo relevante para role='assistant' — las fuentes citadas
    -- en esa respuesta concreta, en el mismo formato que ya
    -- devuelve /api/chat/stream.
    sources     JSONB,

    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()

);

CREATE INDEX IF NOT EXISTS idx_conversation_messages_user_game
    ON conversation_messages(user_id, game_id, created_at);

-- ============================================================
-- Solicitudes de juegos nuevos — panel de administración
--
-- Antes solo se mandaba un correo, sin guardar nada aquí. Con
-- el panel, hace falta un listado real. Se guardan nombre/email
-- de quien solicita como texto plano (no una referencia a
-- users) para que la solicitud siga teniendo sentido aunque esa
-- cuenta cambie de email o se borre más adelante.
-- ============================================================

CREATE TABLE IF NOT EXISTS game_requests (

    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    requester_name  TEXT NOT NULL,

    requester_email TEXT NOT NULL,

    game_name       TEXT NOT NULL,

    bgg_url         TEXT,

    -- Rutas dentro del bucket de B2 (no URLs firmadas — esas
    -- caducan a los 7 días; se regeneran al vuelo cada vez que
    -- se lista, a partir de estas rutas).
    pdf_keys        TEXT[] NOT NULL DEFAULT '{}',

    -- Ruta de la portada en B2 (opcional) — igual que pdf_keys,
    -- una ruta interna, no una URL firmada (esas caducan).
    cover_key       TEXT,

    reviewed        BOOLEAN NOT NULL DEFAULT false,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()

);

CREATE INDEX IF NOT EXISTS idx_game_requests_reviewed
    ON game_requests(reviewed, created_at);

-- Si la tabla ya existía de antes de que se añadiera cover_key
-- (versión anterior de esta funcionalidad), esto la pone al día
-- sin perder nada — CREATE TABLE por sí solo no toca una tabla
-- ya existente.
ALTER TABLE game_requests
    ADD COLUMN IF NOT EXISTS cover_key TEXT;

-- ============================================================
-- Valoración rápida de respuestas (👍/👎)
--
-- Independiente de conversation_messages a propósito — esa tabla
-- solo existe para usuarios con sesión iniciada, y aquí se
-- quiere poder valorar con o sin cuenta. user_id es opcional y
-- solo informativo (no hace falta para nada funcional).
-- ============================================================

CREATE TABLE IF NOT EXISTS message_ratings (

    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    game_id     TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,

    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,

    question    TEXT NOT NULL,

    answer      TEXT NOT NULL,

    rating      TEXT NOT NULL CHECK (rating IN ('up', 'down')),

    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()

);

CREATE INDEX IF NOT EXISTS idx_message_ratings_game_rating
    ON message_ratings(game_id, rating);

-- ============================================================
-- Solicitudes de "olvidé mi contraseña"
--
-- No se valida que el email corresponda a una cuenta real al
-- crear la solicitud (evita revelar qué emails están
-- registrados) — el propio administrador lo descubre al
-- intentar restablecer la contraseña desde el panel.
-- ============================================================

CREATE TABLE IF NOT EXISTS password_reset_requests (

    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email       TEXT NOT NULL,

    resolved    BOOLEAN NOT NULL DEFAULT false,

    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()

);

CREATE INDEX IF NOT EXISTS idx_password_reset_requests_resolved
    ON password_reset_requests(resolved, created_at);
