export interface ImportConfiguration {

    chunkSize: number;

    chunkOverlap: number;

    embeddingConcurrency: number;

    /**
     * Espera mínima (ms) entre peticiones de embedding, por
     * worker concurrente. Con varios proveedores gratuitos con
     * límites de peticiones-por-minuto ajustados, espaciar las
     * peticiones evita agotar ese límite en segundos y aprovecha
     * mejor la cuota real disponible de cada uno.
     */
    embeddingRequestDelay: number;

    /**
     * Cuántos chunks se agrupan en una sola petición de
     * embeddings. Lotes más grandes = menos peticiones = menos
     * probabilidad de agotar límites de peticiones-por-minuto o
     * al día. PERO algunos proveedores (Gemini incluido) pueden
     * devolver silenciosamente menos resultados de los pedidos
     * si el lote es demasiado grande, en vez de dar un error —
     * por eso ahora se valida la respuesta (ver GeminiClient /
     * OpenAICompatibleClient) y se lanza un error claro si no
     * cuadra, para que puedas bajar este valor si hace falta en
     * vez de acabar con datos corruptos en silencio.
     */
    embeddingBatchSize: number;

    retryCount: number;

    retryDelay: number;

    maxRetrievedChunks: number;

    minimumSimilarity: number;

}

export const IMPORT_CONFIGURATION: ImportConfiguration = {

    chunkSize: 600,

    chunkOverlap: 100,

    embeddingConcurrency:

        Number(process.env.IMPORT_EMBEDDING_CONCURRENCY) || 1,

    embeddingRequestDelay:

        Number(process.env.IMPORT_EMBEDDING_REQUEST_DELAY) || 500,

    embeddingBatchSize:

        Number(process.env.IMPORT_EMBEDDING_BATCH_SIZE) || 40,

    retryCount: 3,

    retryDelay: 1000,

    maxRetrievedChunks: 5,

    minimumSimilarity: 0.70

};
