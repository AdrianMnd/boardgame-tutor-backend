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

    retryCount: number;

    retryDelay: number;

    maxRetrievedChunks: number;

    minimumSimilarity: number;

}

export const IMPORT_CONFIGURATION: ImportConfiguration = {

    chunkSize: 600,

    chunkOverlap: 100,

    embeddingConcurrency:

        Number(process.env.IMPORT_EMBEDDING_CONCURRENCY) || 2,

    embeddingRequestDelay:

        Number(process.env.IMPORT_EMBEDDING_REQUEST_DELAY) || 300,

    retryCount: 3,

    retryDelay: 1000,

    maxRetrievedChunks: 5,

    minimumSimilarity: 0.70

};
