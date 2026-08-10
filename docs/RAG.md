# RAG y conocimiento

## Objetivo

El sistema responde preguntas utilizando el reglamento del juego como fuente de contexto.

El prompt del proveedor de chat indica explícitamente que debe utilizar únicamente el contexto proporcionado y que, si la información no aparece claramente, debe responder:

```text
No he encontrado esa información en el reglamento.
```

## Generación de conocimiento

La importación produce `knowledge.json`.

Cada chunk contiene:

```text
id
gameId
page
index
text
embedding
```

El índice contiene además:

```text
gameId
createdAt
totalChunks
embeddingModel
chunks
```

## Chunking

La configuración actual es:

```text
chunkSize = 600
chunkOverlap = 100
```

El `ChunkGenerator` procesa página por página.

Los IDs tienen la forma:

```text
<gameId>-p<page>-c<index>
```

Ejemplo:

```text
catan-p12-c3
```

## Embeddings

La pregunta del usuario se convierte en embedding antes de recuperar conocimiento.

Durante la importación se genera un embedding para cada chunk.

La configuración permite:

```env
IMPORT_EMBEDDING_CONCURRENCY
IMPORT_EMBEDDING_REQUEST_DELAY
```

Valores por defecto:

```text
concurrency = 2
delay = 300 ms
```

## Recuperación semántica

`SemanticRetriever`:

1. carga `knowledge.json`;
2. calcula similitud coseno entre el embedding de la pregunta y cada chunk;
3. ordena de mayor a menor;
4. devuelve como máximo `maxRetrievedChunks`.

Configuración:

```text
maxRetrievedChunks = 5
minimumSimilarity = 0.70
```

Nota: en la implementación actual de `SemanticRetriever` se aplica el límite de chunks, pero no se observa un filtro explícito por `minimumSimilarity`.

## Recuperación por palabras

Existe `KeywordRetriever`, que:

- separa la pregunta en palabras;
- ignora palabras de longitud <= 2;
- cuenta coincidencias en el texto;
- ordena por número de coincidencias;
- limita resultados.

## HybridRetriever

Existe una implementación `HybridRetriever` que combina:

```text
SemanticRetriever
+
KeywordRetriever
```

mediante `ReciprocalRankFusion`.

Sin embargo, el `ApplicationContainer` actual instancia directamente:

```text
SemanticRetriever
```

por lo que el flujo activo de `AskQuestionUseCase` utiliza el recuperador semántico, no el híbrido.

## Reranking

Los chunks recuperados pasan a `LLMContextReranker`.

Si hay cero o un chunk, devuelve el resultado directamente.

Para varios chunks construye un prompt y procesa la respuesta del modelo.

## Compresión

`LLMContextCompressor` reduce el contexto antes de construir el prompt final.

## Construcción de contexto

`ContextBuilder` transforma los chunks seleccionados en el texto que recibe el proveedor de chat.

## Respuesta

`LLMChatProvider` construye un prompt con:

- instrucciones;
- contexto;
- pregunta.

El proveedor genera la respuesta final.

## Compatibilidad de embeddings

Los vectores almacenados deben ser comparables con los embeddings generados para las nuevas preguntas.

Cambiar el modelo de embeddings requiere regenerar el conocimiento si las dimensiones o el espacio vectorial no son compatibles.

Por este motivo, el campo `embeddingModel` de `knowledge.json` es importante para identificar con qué modelo se generó el índice.
