# Configuración

## Backend `.env`

Variables observadas:

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

No se documentan valores secretos.

## AI_PROVIDER

Identifica el proveedor principal/compatibilidad de configuración.

## AI_PROVIDER_ORDER

Permite controlar el fallback:

```env
AI_PROVIDER_ORDER=openrouter,gemini,mistral
```

Solo se incluyen realmente los proveedores que tengan configuración válida.

## API_PUBLIC_URL

Se utiliza para construir las URLs públicas de las portadas:

```text
<API_PUBLIC_URL>/games/<id>/assets/cover.png
```

## PORT

Puerto HTTP del backend.

Por defecto:

```text
3000
```

## Importación

```text
IMPORT_EMBEDDING_CONCURRENCY
IMPORT_EMBEDDING_REQUEST_DELAY
```

Controlan concurrencia y separación entre solicitudes de embeddings.

## Frontend `.env`

La variable funcional del frontend es:

```env
VITE_API_URL=http://localhost:3000
```

Ejemplo de producción:

```env
VITE_API_URL=https://api.example.com
```

Las variables `VITE_*` quedan expuestas en el bundle, por lo que no deben contener secretos.
