# Configuración

Ver `.env.example` para la lista completa con valores por defecto comentados. Aquí, las que requieren más contexto.

## Base de datos y almacenamiento (obligatorias)

### `DATABASE_URL`

Cadena de conexión de [Neon](https://neon.tech) (Postgres + `pgvector`). Es la fuente de verdad de **todo**: juegos, documentos, fragmentos con sus embeddings, usuarios, favoritos, categorías y conversaciones — no hay nada en el sistema de archivos del servidor.

Puesta en marcha de un proyecto Neon nuevo:

1. Crea un proyecto en [neon.tech](https://neon.tech) (capa gratuita).
2. Copia la cadena de conexión que te da al `DATABASE_URL` de tu `.env`.
3. Pega el contenido de `db/schema.sql` en el "SQL Editor" del panel de Neon y ejecútalo — crea todas las tablas, incluida la extensión `pgvector`.

### `B2_ENDPOINT` / `B2_BUCKET` / `B2_ACCESS_KEY_ID` / `B2_SECRET_ACCESS_KEY`

Credenciales de un bucket de [Backblaze B2](https://www.backblaze.com/cloud-storage) (compatible con la API de S3). Aquí viven los PDF de los reglamentos, las portadas de los juegos, y los PDF de las solicitudes de juegos pendientes de revisar.

**El bucket debe ser privado.** El backend es el único que accede directamente (para servir portadas/manuales, o generar enlaces de descarga firmados para las solicitudes) — nunca debe haber una URL pública fija hacia el contenido del bucket.

## Autenticación (obligatorias)

### `JWT_SECRET`

Secreto usado para firmar los tokens de sesión. Mínimo 32 caracteres — genera uno con:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Nunca compartas este valor ni lo subas a git** — cualquiera que lo tenga podría fabricar tokens de sesión válidos para cualquier usuario, sin necesitar su contraseña.

### `JWT_EXPIRES_IN`

Cuánto dura la sesión antes de tener que volver a iniciar sesión. Acepta formatos de la librería `ms` (`30d`, `12h`...). Por defecto `30d`.

### `AUTH_RATE_LIMIT`

Máximo de intentos de login/registro por IP cada 15 minutos (10 por defecto) — protege contra fuerza bruta.

## Correo — solicitud de juegos nuevos (opcionales)

### `RESEND_API_KEY` / `NOTIFICATION_EMAIL`

[Resend](https://resend.com) tiene capa gratuita (3.000 correos/mes, sin tarjeta). **Limitación importante**: sin un dominio propio verificado en Resend, el remitente de pruebas (`onboarding@resend.dev`) solo puede mandar correo de forma fiable a la propia cuenta de Resend — no a destinatarios arbitrarios.

Por eso `NOTIFICATION_EMAIL` debe ser el mismo email con el que te registraste en Resend, y por eso quien solicita un juego nuevo **no recibe ningún correo de confirmación** — solo ve una confirmación en la propia pantalla. Si en algún momento se verifica un dominio propio, se podría extender `EmailService` para mandar también esa confirmación.

Sin estas dos variables, el resto de la aplicación funciona con normalidad — solo falla específicamente el envío del correo al solicitar un juego.

### `GAME_REQUEST_RATE_LIMIT`

Máximo de solicitudes de juegos nuevos por IP cada hora (5 por defecto) — más bajo que el resto de límites, porque cada solicitud sube archivos potencialmente grandes y manda un correo.

## Panel de administración (opcional)

### `ADMIN_EMAIL`

El email de la única cuenta con acceso a `/api/admin/*` (revisar solicitudes de juegos, restablecer contraseñas, ver el resumen de valoraciones) — tiene que coincidir exactamente (sin distinguir mayúsculas/minúsculas) con el email de una cuenta ya registrada en la app. Sin esta variable, nadie tiene acceso al panel — no falla el arranque, simplemente no hay administrador.

Como no hay recuperación de contraseña por correo (ver la limitación de Resend arriba), el propio panel de administración incluye una forma de restablecer manualmente la contraseña de cualquier cuenta — pensado para que, si alguien olvida la suya, el administrador se la comunique por su propio correo personal, sin pasar por Resend.

## Proveedor de embeddings (obligatoria)

### `AI_EMBEDDING_PROVIDER`

El único proveedor usado para generar embeddings — sin *fallback*. Tiene que valer **exactamente lo mismo** en cualquier entorno donde se importen juegos o se sirvan preguntas (tu máquina local y el servidor desplegado), o los juegos importados en un sitio no funcionarán en el otro — los vectores de proveedores distintos no son comparables entre sí, aunque tengan la misma dimensión numérica. Si falta, el servidor no arranca.

Valores válidos: `local`, `gemini`, `mistral`, `openai`, `deepinfra`, `together` (`openrouter` no soporta embeddings).

### `AI_PROVIDER_ORDER`

Orden de *fallback* para **chat** (no para embeddings, que no tiene *fallback* por el motivo de arriba). Por defecto: todos los proveedores conocidos en el orden declarado en `.env.example`. Los proveedores sin API key configurada se omiten automáticamente.

### `LOCAL_EMBEDDING_ENABLED` / `LOCAL_EMBEDDING_MODEL`

Modelo de embeddings local (`transformers.js`, gratis, sin límite de peticiones, corre en la propia máquina). Útil sobre todo para `npm run import`, donde evita agotar la cuota gratuita de los proveedores en la nube. En un plan gratuito de hosting (ej. Render free tier), activarlo para las preguntas en vivo tiene contrapartidas: arranque en frío más lento tras periodos de inactividad, y más uso de memoria.

### `IMPORT_EMBEDDING_BATCH_SIZE` / `_CONCURRENCY` / `_REQUEST_DELAY`

Controlan cuántos chunks se agrupan por petición al importar un juego (40 por defecto), cuántos lotes en paralelo (1), y la espera entre peticiones (500 ms). Lotes más grandes = menos peticiones = menos riesgo de agotar límites de cuota, pero algunos proveedores devuelven silenciosamente menos resultados de los pedidos en lotes muy grandes (ver `ENGINEERING-NOTES.md`).

## Servidor

### `API_PUBLIC_URL`

URL pública de este servicio, usada para construir las URLs de las portadas de los juegos. En Render se autodetecta con `RENDER_EXTERNAL_URL` si no se define explícitamente.

### `FRONTEND_URL` / `CHAT_RATE_LIMIT`

`FRONTEND_URL` añade orígenes permitidos por CORS además del dominio de producción (útil para desarrollo local). `CHAT_RATE_LIMIT` es el máximo de preguntas por IP cada 15 minutos (20 por defecto).

### `SENTRY_DSN` (opcional)

Monitorización de errores en producción — sin esta variable, la aplicación funciona exactamente igual, simplemente sin reportar nada a ningún sitio. Con ella, cualquier error no controlado (un fallo de programación, un proveedor de IA caído de forma inesperada, etc.) se reporta a [Sentry](https://sentry.io) además de devolver la respuesta de error normal al cliente — no cambia nada de lo que ve quien usa la app, solo añade visibilidad de lo que está fallando en producción sin depender de mirar los logs de Render a mano.

## Puesta en marcha local

```bash
npm install
cp .env.example .env
# Rellena .env — ver el README para lo mínimo imprescindible
npm run dev
```

## Despliegue en producción

El proyecto está desplegado así:

- **Frontend**: Vercel, build estático (`npm run build` → sirve `dist/`). URL: [boardgametutor.vercel.app](https://boardgametutor.vercel.app).
- **Backend**: Render, servicio web Node (`npm run build` compila TypeScript a `dist/`, `npm start` ejecuta `node dist/index.js`).
- **Base de datos**: Neon (Postgres + `pgvector`).
- **Almacenamiento de archivos**: Backblaze B2.
- **Correo**: Resend.

Puntos a tener en cuenta al desplegar:

- Todas las variables obligatorias (`DATABASE_URL`, `B2_*`, `JWT_SECRET`, `AI_EMBEDDING_PROVIDER` + su API key) tienen que configurarse en el panel de variables de entorno del hosting, igual que en el `.env` local — el backend se niega a arrancar si falta alguna.
- El frontend necesita `VITE_API_URL` apuntando a la URL pública del backend — al ser una variable `VITE_*`, queda incrustada en el bundle en tiempo de compilación, así que cambiarla requiere volver a desplegar, no solo cambiar la variable.
- Si renombras el proyecto de Vercel (cambia su URL `.vercel.app`), hay que actualizar también el origen permitido por CORS en `src/index.ts` del backend — si no, el navegador bloqueará las peticiones del frontend nuevo con un error de CORS.
- A diferencia de versiones anteriores del proyecto, **ya no hace falta preocuparse de que `games/` persista entre despliegues** — no hay nada en el disco del servidor, todo vive en Neon y B2. El backend es completamente *stateless*.

Ver [`docs/DEPLOYMENT.md`](./DEPLOYMENT.md) para más detalle sobre el propio proceso de despliegue.

## Importar un juego nuevo

Estructura necesaria en `games/<id>/` (solo en tu máquina local — esta carpeta no se despliega ni persiste en el servidor, es solo el punto de partida para `npm run import`):

```text
games/wingspan/
├── metadata.json
├── source/
│   └── rulebook.pdf
└── assets/
    └── cover.png
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

Esto extrae el texto del PDF, lo divide en fragmentos, genera un embedding para cada uno (con checkpoint de progreso ante fallos de cuota), sube el PDF y la portada a B2, y escribe el juego, los documentos y los fragmentos en Postgres.

Tras importar varios juegos, o si sospechas que alguno quedó con datos inconsistentes:

```bash
npm run check:embeddings
```

Recorre todos los juegos en la base de datos y avisa de cuáles tienen fragmentos sin embedding o con dimensiones mezcladas.
