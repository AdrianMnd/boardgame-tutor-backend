import { AI_CONFIGURATION } from "../../../config/ai";
import { GEMINI } from "../../../config/gemini";
import { OPENROUTER } from "../../../config/openrouter";
import { MISTRAL } from "../../../config/mistral";
import { OPENAI } from "../../../config/openai";
import { DEEPINFRA } from "../../../config/deepinfra";
import { TOGETHER } from "../../../config/together";
import { LOCAL_EMBEDDING } from "../../../config/localEmbedding";

import type { AIProviders } from "./AIProviders";
import type { ILLMClient } from "../common/ILLMClient";

import { GeminiClient } from "../providers/gemini/geminiClient";
import { OpenRouterClient } from "../providers/openrouter/OpenRouterClient";
import { MistralClient } from "../providers/mistral/MistralClient";
import { OpenAIClient } from "../providers/openai/OpenAIClient";
import { DeepInfraClient } from "../providers/deepinfra/DeepInfraClient";
import { TogetherClient } from "../providers/together/TogetherClient";
import { LocalEmbeddingClient } from "../providers/local/LocalEmbeddingClient";

import { FallbackLLMClient, type NamedLLMClient } from "../common/FallbackLLMClient";

import { LLMChatProvider } from "../common/LLMChatProvider";
import { LLMEmbeddingProvider } from "../common/LLMEmbeddingProvider";
import { LLMContextReranker } from "../common/LLMContextReranker";
import { LLMContextCompressor } from "../common/LLMContextCompressor";

const PROVIDER_BUILDERS: Record<

    string,

    () => ILLMClient | null

> = {

    local: () =>

        LOCAL_EMBEDDING.enabled
            ? new LocalEmbeddingClient(LOCAL_EMBEDDING)
            : null,

    gemini: () =>

        GEMINI.apiKey
            ? new GeminiClient(GEMINI)
            : null,

    openrouter: () =>

        OPENROUTER.apiKey
            ? new OpenRouterClient()
            : null,

    mistral: () =>

        MISTRAL.apiKey
            ? new MistralClient(MISTRAL)
            : null,

    openai: () =>

        OPENAI.apiKey
            ? new OpenAIClient(OPENAI)
            : null,

    deepinfra: () =>

        DEEPINFRA.apiKey
            ? new DeepInfraClient(DEEPINFRA)
            : null,

    together: () =>

        TOGETHER.apiKey
            ? new TogetherClient(TOGETHER)
            : null

};

export class AIProviderFactory {

    /**
     * Construye el cliente con fallback automático entre todos
     * los proveedores de IA configurados (con API key presente),
     * respetando el orden de AI_CONFIGURATION.providerOrder.
     *
     * Se reutiliza tanto para el servidor (chat, reranker,
     * compressor, embeddings) como para el comando `npm run import`.
     */
    static createFallbackClient(): FallbackLLMClient {

        interface Candidate {

            name: string;

            client: ILLMClient | null;

        }

        const clients: NamedLLMClient[] =

            AI_CONFIGURATION.providerOrder

                .map((name): Candidate => ({

                    name,

                    client: PROVIDER_BUILDERS[name]?.() ?? null

                }))

                .filter(

                    (entry): entry is NamedLLMClient =>

                        entry.client !== null

                );

        if (clients.length === 0) {

            throw new Error(

                "No hay ningún proveedor de IA configurado. " +
                "Define al menos una de estas variables en tu .env: " +
                "GEMINI_API_KEY, OPENROUTER_API_KEY, MISTRAL_API_KEY, " +
                "OPENAI_API_KEY, DEEPINFRA_API_KEY, TOGETHER_API_KEY " +
                "— o activa LOCAL_EMBEDDING_ENABLED=true para embeddings " +
                "sin depender de ningún proveedor externo."

            );

        }

        console.log(

            "Proveedores IA disponibles (en orden de prioridad):",

            clients.map(entry => entry.name).join(" → ")

        );

        return new FallbackLLMClient(

            clients

        );

    }

    static create(): AIProviders {

        const client =

            this.createFallbackClient();

        return {

            embeddingProvider:

                new LLMEmbeddingProvider(client),

            chatProvider:

                new LLMChatProvider(client),

            reranker:

                new LLMContextReranker(client),

            compressor:

                new LLMContextCompressor(client)

        };

    }

}
