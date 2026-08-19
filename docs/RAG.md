# RAG y conocimiento

## Objetivo

El sistema responde preguntas utilizando el reglamento del juego como fuente de contexto. El prompt del proveedor de chat indica explícitamente que debe utilizar únicamente el contexto proporcionado, con tres casos posibles:

1. **Respuesta directa**: el contexto responde razonablemente a la pregunta (combinando fragmentos si hace falta) → responde con esa información.
2. **Relacionado pero no específico**: el contexto trata el tema pero no responde exactamente a lo preguntado → empieza con "No se ha encontrado una respuesta específica a tu pregunta, pero esto es lo que se ha encontrado relacionado con el reglamento:" y resume lo relacionado que sí aparece.
3. **Nada relacionado**: el contexto no trata el tema en absoluto → responde exactamente "No he encontrado esa información en el reglamento."

## Chunking (al importar)

`ChunkGenerator` procesa el PDF página por página y divide el texto en fragmentos:

```text
chunkSize = 600 caracteres
chunkOverlap = 100 caracteres
```

Los IDs tienen la forma `<gameId>-p<página>-c<índice>` (ej. `catan-p12-c3`). Cada chunk, junto con su embedding, se guarda como una fila en la tabla `chunks` de Postgres — no en un archivo, a diferencia de versiones anteriores del proyecto.

## Embeddings

La pregunta del usuario se convierte en embedding **antes** de recuperar conocimiento (en paralelo con la validación del juego, ver [`ARCHITECTURE.md`](./ARCHITECTURE.md)). Durante la importación se genera un embedding para cada chunk, con el mismo proveedor fijado en `AI_EMBEDDING_PROVIDER`.

## Recuperación: `PgVectorRetriever`

La búsqueda por similitud se hace **directamente en Postgres**, con el operador de distancia de `pgvector` (`<=>`, distancia coseno):

```sql
SELECT c.id, c.game_id, c.document_id, d.name AS document_name,
       c.page, c.text,
       1 - (c.embedding <=> $2::vector) AS score
FROM chunks c
JOIN documents d ON d.game_id = c.game_id AND d.id = c.document_id
WHERE c.game_id = $1
ORDER BY c.embedding <=> $2::vector ASC
LIMIT $3
```

`$1` es el juego (para no comparar contra chunks de otros juegos), `$2` el embedding de la pregunta, `$3` el máximo de resultados (`maxRetrievedChunks`, 5 por defecto). `score` se calcula como `1 - distancia` para que un número más alto signifique más parecido.

No hay un índice vectorial (HNSW/IVF) sobre la columna `embedding`, a propósito: con el volumen de esta app (unos pocos miles de chunks por juego, y siempre filtrando primero por `game_id`), una búsqueda exacta ya es rapidísima — un índice aproximado añadiría complejidad sin beneficio real a esta escala.

### `HybridRetriever` (implementado, no activo)

Existe también una implementación `HybridRetriever` en `domain/knowledge/`, que combinaría búsqueda semántica con búsqueda por palabras clave (mediante *Reciprocal Rank Fusion*). El contenedor de dependencias actual (`ApplicationContainer`) instancia directamente `PgVectorRetriever`, así que el flujo activo de `AskQuestionUseCase` no pasa por el híbrido. Queda como posible mejora si la búsqueda puramente semántica se quedara corta en algún caso.

## Construcción de contexto y respuesta

`ContextBuilder` transforma directamente los chunks recuperados (ya vienen ordenados por similitud desde `PgVectorRetriever`) en el texto que recibe el proveedor de chat. `LLMChatProvider` construye el prompt final con instrucciones + contexto + pregunta, y genera la respuesta.

Hubo un paso intermedio de reordenar los chunks con una llamada de IA extra antes de este — se eliminó por no aportar suficiente valor para su coste en tiempo de espera. Ver el porqué en [`ARCHITECTURE.md`](./ARCHITECTURE.md#por-qué-ya-no-hay-un-paso-de-reordenar-el-contexto).

## Compatibilidad de embeddings

Los vectores almacenados deben ser comparables con los embeddings generados para las preguntas nuevas — por eso `AI_EMBEDDING_PROVIDER` tiene que ser el mismo en cualquier entorno que importe juegos o responda preguntas. La columna `embedding` de Postgres tiene una dimensión fija (`VECTOR(3072)`, la que produce `gemini-embedding-001`); cambiar a un proveedor con otra dimensión requeriría además una migración de esquema, no solo volver a importar.
