import type { AIProviders } from "../../factory/AIProviders";
import type { IAIProvider } from "../IAIProvider";

import { GEMINI } from "../../../../config/gemini";

import { GeminiClient } from "../../providers/gemini/geminiClient";

import { OpenRouterClient } from "./OpenRouterClient";
import { OpenRouterChatProvider } from "./OpenRouterChatProvider";

import { LLMEmbeddingProvider } from "../../common/LLMEmbeddingProvider";
import { LLMContextReranker } from "../../common/LLMContextReranker";
import { LLMContextCompressor } from "../../common/LLMContextCompressor";

export class OpenRouterProvider
    implements IAIProvider {

    create(): AIProviders {

        const openRouterClient =
            new OpenRouterClient();

        const geminiClient =
            new GeminiClient(
                GEMINI
            );

        return {

            embeddingProvider:

                new LLMEmbeddingProvider(
                    geminiClient
                ),

            chatProvider:

                new OpenRouterChatProvider(
                    openRouterClient
                ),

            reranker:

                new LLMContextReranker(
                    openRouterClient
                ),

            compressor:

                new LLMContextCompressor(
                    openRouterClient
                )

        };

    }

}