# IA y proveedores

## Configuración

La configuración reconoce:

```text
gemini
openrouter
mistral
openai
deepinfra
together
```

`AI_PROVIDER` se conserva como proveedor principal/compatibilidad.

`AI_PROVIDER_ORDER` permite definir explícitamente el orden de fallback.

Si no se especifica `AI_PROVIDER_ORDER`, se utiliza:

```text
AI_PROVIDER
+
resto de proveedores conocidos
```

Los proveedores sin API key válida se omiten.

## Fallback

`AIProviderFactory.createFallbackClient()` construye una cadena de clientes.

Ante errores considerados reintentables, `FallbackLLMClient` pasa al siguiente proveedor.

Esto se aplica a:

- generación de texto;
- chat;
- embeddings.

Para embeddings se filtran primero los clientes con:

```text
supportsEmbeddings === true
```

## Proveedores

### Gemini

Configuración:

```env
GEMINI_API_KEY=
GEMINI_CHAT_MODEL=
GEMINI_EMBEDDING_MODEL=
GEMINI_API_VERSION=
```

Valores por defecto observados:

```text
chatModel: gemini-2.5-flash
embeddingModel: text-embedding-004
apiVersion: v1beta
```

### OpenRouter

Configuración:

```env
OPENROUTER_API_KEY=
OPENROUTER_CHAT_MODEL=
```

Base URL:

```text
https://openrouter.ai/api/v1
```

El cliente actual declara `supportsEmbeddings` heredado como `false` y su `generateEmbedding()` lanza explícitamente:

```text
OpenRouter no implementa embeddings.
```

Por tanto, OpenRouter no debe considerarse proveedor de embeddings en esta versión.

### Mistral

```env
MISTRAL_API_KEY=
MISTRAL_CHAT_MODEL=
MISTRAL_EMBEDDING_MODEL=
```

Valores por defecto:

```text
chatModel: mistral-small-latest
embeddingModel: mistral-embed
```

El cliente utiliza el endpoint de embeddings compatible con OpenAI.

### OpenAI

```env
OPENAI_API_KEY=
OPENAI_MODEL=
OPENAI_EMBEDDING_MODEL=
```

Valores por defecto:

```text
chatModel: gpt-4o-mini
embeddingModel: text-embedding-3-small
```

### DeepInfra

```env
DEEPINFRA_API_KEY=
DEEPINFRA_CHAT_MODEL=
DEEPINFRA_EMBEDDING_MODEL=
```

Valores por defecto:

```text
chatModel: meta-llama/Meta-Llama-3.1-8B-Instruct
embeddingModel: BAAI/bge-m3
```

### Together

```env
TOGETHER_API_KEY=
TOGETHER_CHAT_MODEL=
TOGETHER_EMBEDDING_MODEL=
```

Valores por defecto:

```text
chatModel: meta-llama/Llama-3.3-70B-Instruct-Turbo-Free
embeddingModel: BAAI/bge-base-en-v1.5
```

## Recomendación operativa

No mezclar embeddings generados por modelos incompatibles dentro del mismo `knowledge.json`.

Cuando se cambia el proveedor/modelo de embeddings, documentar el modelo utilizado y regenerar los índices afectados si es necesario.

## Variables de importación

```env
IMPORT_EMBEDDING_CONCURRENCY=2
IMPORT_EMBEDDING_REQUEST_DELAY=300
```

Estas variables reducen la velocidad/concurrencia de las peticiones para trabajar mejor con límites de proveedores.

## Seguridad

Las API keys solo deben existir en variables de entorno del servidor/desarrollo.

No deben almacenarse en Git.
