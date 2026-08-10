"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MistralClient = void 0;
const OpenAICompatibleClient_1 = require("../../common/OpenAICompatibleClient");
/**
 * La Plataforme (Mistral AI) expone una API compatible con el
 * formato de OpenAI tanto para chat/completions como para
 * embeddings, incluye un nivel gratuito con límites de uso
 * razonables. https://docs.mistral.ai
 */
class MistralClient extends OpenAICompatibleClient_1.OpenAICompatibleClient {
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
exports.MistralClient = MistralClient;
