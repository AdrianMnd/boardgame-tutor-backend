import { AI_CONFIGURATION } from "../../../config/ai";
import { GEMINI } from "../../../config/gemini";
import { OPENROUTER } from "../../../config/openrouter";
import { MISTRAL } from "../../../config/mistral";

import type { AIProviders } from "./AIProviders";
import type { ILLMClient } from "../common/ILLMClient";

import { GeminiClient } from "../providers/gemini/geminiClient";
import { OpenRouterClient } from "../providers/openrouter/OpenRouterClient";
import { MistralClient } from "../providers/mistral/MistralClient";

import { FallbackLLMClient, type NamedLLMClient } from "../common/FallbackLLMClient";

import { LLMChatProvider } from "../common/LLMChatProvider";
import { LLMEmbeddingProvider } from "../common/LLMEmbeddingProvider";
import { LLMContextReranker } from "../common/LLMContextReranker";
import { LLMContextCompressor } from "../common/LLMContextCompressor";

const PROVIDER_BUILDERS: Record<

    string,

    () => ILLMClient | null

> = {

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
                "GEMINI_API_KEY, OPENROUTER_API_KEY, MISTRAL_API_KEY."

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
