"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMPORT_CONFIGURATION = void 0;
exports.IMPORT_CONFIGURATION = {
    chunkSize: 600,
    chunkOverlap: 100,
    embeddingConcurrency: Number(process.env.IMPORT_EMBEDDING_CONCURRENCY) || 2,
    embeddingRequestDelay: Number(process.env.IMPORT_EMBEDDING_REQUEST_DELAY) || 300,
    retryCount: 3,
    retryDelay: 1000,
    maxRetrievedChunks: 5,
    minimumSimilarity: 0.70
};
