"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPENROUTER = void 0;
exports.OPENROUTER = {
    apiKey: process.env.OPENROUTER_API_KEY ?? "",
    baseUrl: "https://openrouter.ai/api/v1",
    chatModel: process.env.OPENROUTER_CHAT_MODEL
        ?? "openai/gpt-4.1-mini",
    embeddingModel: "text-embedding-3-small"
};
