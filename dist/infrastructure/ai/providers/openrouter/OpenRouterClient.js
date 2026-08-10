"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenRouterClient = void 0;
const openrouter_1 = require("../../../../config/openrouter");
const OpenAICompatibleClient_1 = require("../../common/OpenAICompatibleClient");
class OpenRouterClient extends OpenAICompatibleClient_1.OpenAICompatibleClient {
    constructor() {
        super(openrouter_1.OPENROUTER);
    }
    async generateEmbedding(text) {
        throw new Error("OpenRouter no implementa embeddings.");
    }
}
exports.OpenRouterClient = OpenRouterClient;
