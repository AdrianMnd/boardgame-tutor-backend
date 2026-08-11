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
const LLMContextRefiner_1 = require("../common/LLMContextRefiner");
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
        const chatClient = this.createFallbackClient();
        const embeddingClient = this.createEmbeddingClient();
        return {
            embeddingProvider: new LLMEmbeddingProvider_1.LLMEmbeddingProvider(embeddingClient),
            chatProvider: new LLMChatProvider_1.LLMChatProvider(chatClient),
            refiner: new LLMContextRefiner_1.LLMContextRefiner(chatClient)
        };
    }
    /**
     * Construye el ÚNICO cliente usado para generar embeddings
     * — sin fallback entre proveedores (ver el comentario en
     * AI_CONFIGURATION.embeddingProvider sobre por qué). Se usa
     * tanto en el servidor (preguntas en vivo) como en
     * `npm run import`, para garantizar que ambos generan
     * embeddings exactamente iguales.
     */
    static createEmbeddingClient() {
        const name = ai_1.AI_CONFIGURATION.embeddingProvider;
        if (!name) {
            throw new Error("Falta configurar EMBEDDING_PROVIDER en el .env " +
                "(ej. EMBEDDING_PROVIDER=local o EMBEDDING_PROVIDER=gemini). " +
                "Tiene que ser EXACTAMENTE el mismo valor en tu máquina " +
                "local y en el servidor desplegado, o las preguntas sobre " +
                "los juegos importados en un sitio fallarán en el otro.");
        }
        const client = PROVIDER_BUILDERS[name]?.();
        if (!client) {
            throw new Error(`El proveedor configurado en EMBEDDING_PROVIDER ("${name}") ` +
                "no está disponible. Si es un proveedor en la nube, revisa " +
                "que tenga su API key configurada. Si es \"local\", revisa " +
                "que LOCAL_EMBEDDING_ENABLED=true.");
        }
        if (!client.supportsEmbeddings) {
            throw new Error(`El proveedor configurado en EMBEDDING_PROVIDER ("${name}") ` +
                "no soporta generación de embeddings (ej. \"openrouter\" no " +
                "los soporta). Elige otro proveedor.");
        }
        console.log(`Proveedor de embeddings (fijo, sin fallback): ${name}`);
        return client;
    }
}
exports.AIProviderFactory = AIProviderFactory;
