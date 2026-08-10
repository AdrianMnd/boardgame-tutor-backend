"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepInfraClient = void 0;
const OpenAICompatibleClient_1 = require("../../common/OpenAICompatibleClient");
/**
 * DeepInfra: API compatible con OpenAI para chat y embeddings.
 * https://deepinfra.com/docs
 */
class DeepInfraClient extends OpenAICompatibleClient_1.OpenAICompatibleClient {
    supportsEmbeddings = true;
    constructor(configuration) {
        super(configuration);
    }
    async generateEmbedding(text) {
        return this.generateEmbeddingViaOpenAiApi(text);
    }
    async generateEmbeddingBatch(texts) {
        return this.generateEmbeddingBatchViaOpenAiApi(texts);
    }
}
exports.DeepInfraClient = DeepInfraClient;
