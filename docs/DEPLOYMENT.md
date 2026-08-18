# Despliegue

Cómo está desplegado en producción ahora mismo. Para el detalle de cada variable de entorno, ver [`docs/CONFIGURATION.md`](./CONFIGURATION.md).

## Resumen

| Pieza | Dónde | Capa gratuita |
|---|---|---|
| Frontend | [Vercel](https://vercel.com) | Sí |
| Backend | [Render](https://render.com) | Sí |
| Base de datos | [Neon](https://neon.tech) (Postgres + `pgvector`) | Sí |
| Archivos (PDF, portadas) | [Backblaze B2](https://www.backblaze.com/cloud-storage) | Sí |
| Correo | [Resend](https://resend.com) | Sí |

Todo el proyecto corre sobre capas gratuitas — ninguna pieza requiere tarjeta de crédito ni tiene coste mientras se mantenga dentro de esos límites.

## Backend (Render)

- Servicio web de tipo Node.
- Build: `npm run build` (compila TypeScript a `dist/`).
- Arranque: `npm start` (`node dist/index.js`).
- Variables de entorno: todas las de `.env.example` se configuran en el panel de Render, igual que en el `.env` local — el proceso se niega a arrancar si falta alguna obligatoria.
- `API_PUBLIC_URL` no hace falta configurarla explícitamente: se autodetecta con `RENDER_EXTERNAL_URL`, que Render define automáticamente.

Nota sobre el plan gratuito de Render: el servicio "duerme" tras un periodo sin tráfico, y la primera petición tras eso tarda más (arranque en frío) — normal en este tipo de capa gratuita, no es un fallo.

## Frontend (Vercel)

- Build estático: `npm run build` genera `dist/`, que Vercel sirve directamente.
- `VITE_API_URL` debe apuntar a la URL pública del backend en Render. Al ser una variable `VITE_*`, Vite la incrusta en el bundle **en tiempo de compilación** — cambiarla en el panel de Vercel no tiene efecto hasta el siguiente despliegue.

## Base de datos (Neon)

1. Crear un proyecto en Neon (capa gratuita).
2. Aplicar `db/schema.sql` una vez, desde el "SQL Editor" del panel — crea todas las tablas y la extensión `pgvector`.
3. Copiar la cadena de conexión a `DATABASE_URL` en las variables de entorno de Render.

Neon en su capa gratuita también "duerme" la base de datos tras inactividad — la primera consulta tras eso es más lenta, se reactiva sola.

## Almacenamiento (Backblaze B2)

Bucket **privado** — nunca público. Las cuatro variables `B2_*` se configuran igual que el resto, solo en el backend (el frontend nunca habla con B2 directamente, siempre a través de la API).

## Correo (Resend)

Solo necesario si se quiere que funcione la solicitud de juegos nuevos. Ver la limitación importante sobre el remitente de pruebas en [`docs/CONFIGURATION.md`](./CONFIGURATION.md) — sin ello, el resto de la aplicación sigue funcionando con normalidad.

## CORS

```ts
app.use(cors({ origin: [...] }));
```

Restringido a una lista explícita: el dominio de producción del frontend más lo que se añada en `FRONTEND_URL`. **Si se renombra el proyecto de Vercel** (cambia su URL `.vercel.app`), hay que actualizar también esta lista en `src/index.ts` y volver a desplegar el backend — si no, el navegador bloqueará las peticiones del frontend nuevo con un error de CORS.

## HTTPS

Tanto Render como Vercel sirven HTTPS por defecto, sin configuración adicional.

## Checklist antes de desplegar un cambio

```bash
npm run build
npm test
```

En el backend. En el frontend, además: `npm run lint`, `npm run test`, y `npm run test:e2e` si el cambio afecta a un flujo cubierto por esos tests. Ambos repositorios tienen CI (GitHub Actions) que ejecuta esto mismo automáticamente en cada `push`/PR a `dev` o `master` — ver la pestaña "Actions" de cada repositorio.
