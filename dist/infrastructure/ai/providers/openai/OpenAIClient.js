"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIClient = void 0;
const OpenAICompatibleClient_1 = require("../../common/OpenAICompatibleClient");
/**
 * Cliente para la API oficial de OpenAI. Soporta chat y
 * embeddings de forma nativa (es literalmente el formato en el
 * que se basa OpenAICompatibleClient).
 */
class OpenAIClient extends OpenAICompatibleClient_1.OpenAICompatibleClient {
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
exports.OpenAIClient = OpenAIClient;
