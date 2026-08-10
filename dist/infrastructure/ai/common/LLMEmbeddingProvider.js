"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMEmbeddingProvider = void 0;
class LLMEmbeddingProvider {
    client;
    constructor(client) {
        this.client = client;
    }
    async generate(text) {
        if (!this.client.generateEmbedding) {
            throw new Error("El proveedor actual no soporta embeddings.");
        }
        return this.client.generateEmbedding(text);
    }
    async generateBatch(texts) {
        if (!this.client.generateEmbeddingBatch) {
            // Sin soporte de lote a este nivel: se genera uno a
            // uno (el propio cliente/FallbackLLMClient decide
            // internamente cómo resolverlo).
            const results = [];
            for (const text of texts) {
                results.push(await this.generate(text));
            }
            return results;
        }
        return this.client.generateEmbeddingBatch(texts);
    }
}
exports.LLMEmbeddingProvider = LLMEmbeddingProvider;
