"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOGETHER = void 0;
/**
 * Together AI expone una API compatible con el formato de
 * OpenAI tanto para chat como para embeddings, y ofrece
 * crédito gratuito para cuentas nuevas.
 * https://docs.together.ai
 */
exports.TOGETHER = {
    apiKey: process.env.TOGETHER_API_KEY ?? "",
    baseUrl: "https://api.together.xyz/v1",
    chatModel: process.env.TOGETHER_CHAT_MODEL
        ?? "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
    embeddingModel: process.env.TOGETHER_EMBEDDING_MODEL
        ?? "BAAI/bge-base-en-v1.5"
};
