"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiClient = void 0;
const genai_1 = require("@google/genai");
const retry_1 = require("../../common/retry");
const isRetryableProviderError_1 = require("../../common/isRetryableProviderError");
class GeminiClient {
    configuration;
    supportsEmbeddings = true;
    supportsChat = true;
    client;
    constructor(configuration) {
        this.configuration = configuration;
        this.client =
            new genai_1.GoogleGenAI({
                apiKey: configuration.apiKey
            });
    }
    async generateText(prompt) {
        const response = await (0, retry_1.retry)(() => this.client.models.generateContent({
            model: this.configuration.chatModel,
            contents: prompt
        }), {
            shouldRetry: error => !(0, isRetryableProviderError_1.isRetryableProviderError)(error)
        });
        return response.text ?? "";
    }
    async generateChat(messages) {
        const prompt = messages
            .map(message => `${message.role.toUpperCase()}

${message.content}`)
            .join("\n\n");
        return this.generateText(prompt);
    }
    async generateEmbedding(text) {
        const response = await (0, retry_1.retry)(() => this.client.models.embedContent({
            model: this.configuration.embeddingModel,
            contents: text
        }), {
            shouldRetry: error => !(0, isRetryableProviderError_1.isRetryableProviderError)(error)
        });
        return (response.embeddings?.[0]?.values
            ?? []);
    }
    async generateEmbeddingBatch(texts) {
        const response = await (0, retry_1.retry)(() => this.client.models.embedContent({
            model: this.configuration.embeddingModel,
            contents: texts
        }), {
            shouldRetry: error => !(0, isRetryableProviderError_1.isRetryableProviderError)(error)
        });
        return (response.embeddings?.map(embedding => embedding.values ?? [])
            ?? []);
    }
}
exports.GeminiClient = GeminiClient;
