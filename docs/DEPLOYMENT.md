# Despliegue

Esta documentación describe lo que exige el código actual. La plataforma concreta de producción no se deduce de los ZIP.

## Requisitos

El backend necesita:

- Node.js compatible con las dependencias del proyecto.
- acceso a las variables de entorno de IA;
- filesystem con la carpeta `games/`;
- PDFs y `knowledge.json` disponibles en ese filesystem.

El frontend necesita una URL pública del backend mediante:

```env
VITE_API_URL=<URL_PUBLICA_API>
```

## Frontend

Construcción:

```bash
npm run build
```

El resultado de Vite se genera en:

```text
dist/
```

El servidor estático de producción debe servir ese contenido.

## Backend

El backend arranca con:

```bash
npm run dev
```

El script de producción no está definido en el `package.json` entregado.

El build actual es:

```bash
npm run build
```

y solo ejecuta `tsc --noEmit`.

Por tanto, la estrategia concreta para ejecutar TypeScript compilado en producción debe definirse antes de automatizar un despliegue basado en `npm run build`.

## Variables

Backend:

```env
PORT=
API_PUBLIC_URL=

AI_PROVIDER=
AI_PROVIDER_ORDER=

GEMINI_API_KEY=
GEMINI_CHAT_MODEL=
GEMINI_EMBEDDING_MODEL=
GEMINI_API_VERSION=

OPENAI_API_KEY=
OPENAI_MODEL=
OPENAI_EMBEDDING_MODEL=

OPENROUTER_API_KEY=
OPENROUTER_CHAT_MODEL=

MISTRAL_API_KEY=
MISTRAL_CHAT_MODEL=
MISTRAL_EMBEDDING_MODEL=

DEEPINFRA_API_KEY=
DEEPINFRA_CHAT_MODEL=
DEEPINFRA_EMBEDDING_MODEL=

TOGETHER_API_KEY=
TOGETHER_CHAT_MODEL=
TOGETHER_EMBEDDING_MODEL=

IMPORT_EMBEDDING_CONCURRENCY=
IMPORT_EMBEDDING_REQUEST_DELAY=
```

Frontend:

```env
VITE_API_URL=
```

## CORS

Actualmente Express utiliza:

```ts
app.use(cors());
```

En producción se recomienda limitarlo al dominio real del frontend.

## HTTPS

El backend y frontend deberían publicarse mediante HTTPS.

## Persistencia

No desplegar el backend en un entorno donde `games/` desaparezca al reiniciar si se pretende conservar:

- PDFs;
- portadas;
- `knowledge.json`;
- checkpoints.

## Portadas y PDFs

El backend expone:

```text
/games
```

como contenido estático.

Esto requiere que la carpeta `games/` exista en el entorno de producción.

## Estado de conversaciones

Las conversaciones viven en el navegador mediante `localStorage`.

No se almacenan en el backend.

## Variables públicas

`VITE_API_URL` queda incorporada al bundle del frontend durante la compilación. No debe contener secretos.

Las API keys de proveedores solo deben estar en el backend.
