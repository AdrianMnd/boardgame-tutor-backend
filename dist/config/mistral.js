"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MISTRAL = void 0;
exports.MISTRAL = {
    apiKey: process.env.MISTRAL_API_KEY ?? "",
    baseUrl: "https://api.mistral.ai/v1",
    chatModel: process.env.MISTRAL_CHAT_MODEL
        ?? "mistral-small-latest",
    embeddingModel: process.env.MISTRAL_EMBEDDING_MODEL
        ?? "mistral-embed"
};
