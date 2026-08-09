export interface ImportConfiguration {

    chunkSize: number;

    chunkOverlap: number;

    embeddingConcurrency: number;

    retryCount: number;

    retryDelay: number;

    maxRetrievedChunks: number;

    minimumSimilarity: number;

}

export const IMPORT_CONFIGURATION: ImportConfiguration = {

    chunkSize: 600,

    chunkOverlap: 100,

    embeddingConcurrency: 5,

    retryCount: 3,

    retryDelay: 1000,

    maxRetrievedChunks: 5,

    minimumSimilarity: 0.70

};