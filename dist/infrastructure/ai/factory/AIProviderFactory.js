"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIProviderFactory = void 0;
const ai_1 = require("../../../config/ai");
const gemini_1 = require("../../../config/gemini");
const openrouter_1 = require("../../../config/openrouter");
const mistral_1 = require("../../../config/mistral");
const openai_1 = require("../../../config/openai");
const deepinfra_1 = require("../../../config/deepinfra");
const together_1 = require("../../../config/together");
const localEmbedding_1 = require("../../../config/localEmbedding");
const geminiClient_1 = require("../providers/gemini/geminiClient");
const OpenRouterClient_1 = require("../providers/openrouter/OpenRouterClient");
const MistralClient_1 = require("../providers/mistral/MistralClient");
const OpenAIClient_1 = require("../providers/openai/OpenAIClient");
const DeepInfraClient_1 = require("../providers/deepinfra/DeepInfraClient");
const TogetherClient_1 = require("../providers/together/TogetherClient");
const LocalEmbeddingClient_1 = require("../providers/local/LocalEmbeddingClient");
const FallbackLLMClient_1 = require("../common/FallbackLLMClient");
const LLMChatProvider_1 = require("../common/LLMChatProvider");
const LLMEmbeddingProvider_1 = require("../common/LLMEmbeddingProvider");
const LLMContextReranker_1 = require("../common/LLMContextReranker");
const LLMContextCompressor_1 = require("../common/LLMContextCompressor");
const PROVIDER_BUILDERS = {
    local: () => localEmbedding_1.LOCAL_EMBEDDING.enabled
        ? new LocalEmbeddingClient_1.LocalEmbeddingClient(localEmbedding_1.LOCAL_EMBEDDING)
        : null,
    gemini: () => gemini_1.GEMINI.apiKey
        ? new geminiClient_1.GeminiClient(gemini_1.GEMINI)
        : null,
    openrouter: () => openrouter_1.OPENROUTER.apiKey
        ? new OpenRouterClient_1.OpenRouterClient()
        : null,
    mistral: () => mistral_1.MISTRAL.apiKey
        ? new MistralClient_1.MistralClient(mistral_1.MISTRAL)
        : null,
    openai: () => openai_1.OPENAI.apiKey
        ? new OpenAIClient_1.OpenAIClient(openai_1.OPENAI)
        : null,
    deepinfra: () => deepinfra_1.DEEPINFRA.apiKey
        ? new DeepInfraClient_1.DeepInfraClient(deepinfra_1.DEEPINFRA)
        : null,
    together: () => together_1.TOGETHER.apiKey
        ? new TogetherClient_1.TogetherClient(together_1.TOGETHER)
        : null
};
class AIProviderFactory {
    /**
     * Construye el cliente con fallback automático entre todos
     * los proveedores de IA configurados (con API key presente),
     * respetando el orden de AI_CONFIGURATION.providerOrder.
     *
     * Se reutiliza tanto para el servidor (chat, reranker,
     * compressor, embeddings) como para el comando `npm run import`.
     */
    static createFallbackClient() {
        const clients = ai_1.AI_CONFIGURATION.providerOrder
            .map((name) => ({
            name,
            client: PROVIDER_BUILDERS[name]?.() ?? null
        }))
            .filter((entry) => entry.client !== null);
        if (clients.length === 0) {
            throw new Error("No hay ningún proveedor de IA configurado. " +
                "Define al menos una de estas variables en tu .env: " +
                "GEMINI_API_KEY, OPENROUTER_API_KEY, MISTRAL_API_KEY, " +
                "OPENAI_API_KEY, DEEPINFRA_API_KEY, TOGETHER_API_KEY " +
                "— o activa LOCAL_EMBEDDING_ENABLED=true para embeddings " +
                "sin depender de ningún proveedor externo.");
        }
        console.log("Proveedores IA disponibles (en orden de prioridad):", clients.map(entry => entry.name).join(" → "));
        return new FallbackLLMClient_1.FallbackLLMClient(clients);
    }
    static create() {
        const client = this.createFallbackClient();
        return {
            embeddingProvider: new LLMEmbeddingProvider_1.LLMEmbeddingProvider(client),
            chatProvider: new LLMChatProvider_1.LLMChatProvider(client),
            reranker: new LLMContextReranker_1.LLMContextReranker(client),
            compressor: new LLMContextCompressor_1.LLMContextCompressor(client)
        };
    }
}
exports.AIProviderFactory = AIProviderFactory;
