# Configuración, despliegue e importación de juegos

## Variables de entorno

Ver `.env.example` para la lista completa con valores por defecto comentados. Las que requieren más contexto:

### `AI_EMBEDDING_PROVIDER` (obligatoria)

El único proveedor usado para generar embeddings — sin fallback. Tiene que valer exactamente lo mismo en cualquier entorno donde se importen juegos o se sirvan preguntas (tu máquina local y el servidor desplegado), o los juegos importados en un sitio no funcionarán en el otro. Si falta, el servidor no arranca.

Valores válidos: `local`, `gemini`, `mistral`, `openai`, `deepinfra`, `together` (`openrouter` no soporta embeddings).

### `AI_PROVIDER_ORDER`

Orden de *fallback* para chat (no para embeddings). Por defecto: `local` primero (si está activado), luego el valor de `AI_PROVIDER` (legado), luego el resto.

### `LOCAL_EMBEDDING_ENABLED` / `LOCAL_EMBEDDING_MODEL`

Modelo de embeddings local (`transformers.js`, gratis, sin límite de peticiones, corre en la propia máquina). Útil sobre todo para `npm run import`, donde evita agotar la cuota gratuita de los proveedores en la nube. En un plan gratuito de hosting (ej. Render free tier), activarlo para las preguntas en vivo tiene contrapartidas: arranque en frío más lento tras periodos de inactividad, y más uso de memoria.

### `IMPORT_EMBEDDING_BATCH_SIZE` / `_CONCURRENCY` / `_REQUEST_DELAY`

Controlan cuántos chunks se agrupan por petición al importar un juego (40 por defecto), cuántos lotes en paralelo (1), y la espera entre peticiones (500 ms). Lotes más grandes = menos peticiones = menos riesgo de agotar límites de cuota, pero algunos proveedores devuelven silenciosamente menos resultados de los pedidos en lotes muy grandes (ver `ENGINEERING-NOTES.md`).

### `API_PUBLIC_URL`

URL pública de este servicio, usada para construir las URLs de las portadas de los juegos. En Render se autodetecta con `RENDER_EXTERNAL_URL` si no se define explícitamente.

### `FRONTEND_URL` / `CHAT_RATE_LIMIT`

`FRONTEND_URL` añade orígenes permitidos por CORS además del dominio de producción (útil para desarrollo local). `CHAT_RATE_LIMIT` es el máximo de preguntas por IP cada 15 minutos (20 por defecto).

## Puesta en marcha local

```bash
npm install
cp .env.example .env
# Rellena .env con al menos una API key y AI_EMBEDDING_PROVIDER
npm run dev
```

## Despliegue en producción

El proyecto está desplegado así:

- **Frontend**: Vercel, build estático (`npm run build` → sirve `dist/`). URL: [boardgametutor.vercel.app](https://boardgametutor.vercel.app).
- **Backend**: Render, servicio web Node (`npm run build` compila TypeScript a `dist/`, `npm start` ejecuta `node dist/index.js`).

Puntos a tener en cuenta al desplegar:

- `games/` tiene que persistir entre despliegues (PDFs, portadas, `knowledge.json`) — no vale un filesystem efímero que se resetee.
- `AI_EMBEDDING_PROVIDER` (y la API key correspondiente) tienen que configurarse en el panel de variables de entorno del hosting, igual que en el `.env` local.
- El frontend necesita `VITE_API_URL` apuntando a la URL pública del backend — al ser una variable `VITE_*`, queda incrustada en el bundle en tiempo de compilación, así que cambiarla requiere volver a desplegar, no solo cambiar la variable.
- Si renombras el proyecto de Vercel (cambia su URL `.vercel.app`), hay que actualizar también el origen permitido por CORS en `src/index.ts` del backend — si no, el navegador bloqueará las peticiones del frontend nuevo con un error de CORS.

## Importar un juego nuevo

Estructura necesaria en `games/<id>/`:

```text
games/wingspan/
├── metadata.json
├── source/
│   └── rulebook.pdf
├── assets/
│   └── cover.png
└── generated/        ← se genera automáticamente
```

`metadata.json`:

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

El campo `id` debe coincidir con el nombre de la carpeta. Con la estructura lista:

```bash
npm run import wingspan
```

Esto extrae el texto del PDF, lo divide en fragmentos, genera un embedding para cada uno (con checkpoint de progreso ante fallos de cuota) y escribe `generated/knowledge.json`.

Tras importar varios juegos, o si sospechas que alguno quedó con datos inconsistentes:

```bash
npm run check:embeddings
```

Recorre todos los juegos y avisa de cuáles tienen fragmentos sin embedding o con dimensiones mezcladas.

## Juegos incluidos actualmente

| ID | Nombre | Jugadores | Año |
|---|---|---:|---:|
| `40k` | Warhammer 40k (11ª edición) | 2 | 2026 |
| `arkhamlcg` | Arkham Horror: El juego de cartas | 1–4 | 2016 |
| `catan` | Catan | 3–4 | 1995 |
| `cdmd` | Cthulhu: Death May Die | 1–5 | 2019 |
| `hotel` | Hotel | 2–4 | 1974 |
| `mansiones` | Mansiones de la Locura (2ª ed.) | 1–5 | 2016 |
| `marvelchampions` | Marvel Champions | 1–4 | 2019 |
| `nemesis` | Nemesis | 1–5 | 2018 |
| `nemesisrepresalia` | Nemesis: Represalia | 1–5 | 2026 |
| `terraforming` | Terraforming Mars | 1–5 | 2016 |
| `trivial` | Trivial Pursuit | 2–6 | 1979 |
| `zombicide` | Zombicide (2ª ed.) | 1–6 | 2021 |

Cada carpeta bajo `games/` se descubre automáticamente al listar — no hace falta registrar el juego en ningún otro sitio.
