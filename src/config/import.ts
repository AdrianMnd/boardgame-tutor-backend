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
     * embeddings. Con lotes de 20, un juego de 350 chunks pasa
     * de necesitar ~350 peticiones a necesitar ~18 — la mejora
     * con más impacto real para no agotar los límites de
     * peticiones-por-minuto de los proveedores gratuitos.
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

        Number(process.env.IMPORT_EMBEDDING_BATCH_SIZE) || 100,

    retryCount: 3,

    retryDelay: 1000,

    maxRetrievedChunks: 5,

    minimumSimilarity: 0.70

};
