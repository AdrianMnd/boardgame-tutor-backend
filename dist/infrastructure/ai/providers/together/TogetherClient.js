"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TogetherClient = void 0;
const OpenAICompatibleClient_1 = require("../../common/OpenAICompatibleClient");
/**
 * Together AI: API compatible con OpenAI para chat y embeddings.
 * https://docs.together.ai
 */
class TogetherClient extends OpenAICompatibleClient_1.OpenAICompatibleClient {
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
exports.TogetherClient = TogetherClient;
