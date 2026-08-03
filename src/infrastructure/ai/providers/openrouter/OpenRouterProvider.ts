import type { AIProviders } from "../../factory/AIProviders";

import type { IAIProvider } from "../IAIProvider";

import { OpenRouterClient }
    from "../../../ai/providers/openrouter/OpenRouterClient";

import { OpenRouterChatProvider }
    from "../../../ai/providers/openrouter/OpenRouterChatProvider";

import { GeminiEmbeddingProvider }
    from "../gemini/geminiEmbeddingProvider";

import { GeminiContextReranker }
    from "../gemini/geminiContextReranker";

import { GeminiContextCompressor }
    from "../gemini/geminiContextCompressor";

import { GeminiClient }
    from "../gemini/geminiClient";

import { GEMINI }
    from "../../../../config/gemini";

export class OpenRouterProvider
    implements IAIProvider {

    private readonly geminiClient =
        new GeminiClient(
            GEMINI
        );

    constructor(

        private readonly client:
            OpenRouterClient

    ) {}

    create(): AIProviders {

        return {

            embeddingProvider:

                new GeminiEmbeddingProvider(

                    this.geminiClient

                ),

            chatProvider:

                new OpenRouterChatProvider(

                    this.client

                ),

            reranker:

                new GeminiContextReranker(

                    this.geminiClient

                ),

            compressor:

                new GeminiContextCompressor(

                    this.geminiClient

                )

        };

    }

}