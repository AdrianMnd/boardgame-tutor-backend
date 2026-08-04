import type { AIProviders } from "../../factory/AIProviders";
import type { IAIProvider } from "../IAIProvider";

import { OpenRouterClient } from "./OpenRouterClient";

import { OpenRouterChatProvider } from "./OpenRouterChatProvider";

import { GeminiClient } from "../gemini/geminiClient";
import { GeminiEmbeddingProvider } from "../gemini/geminiEmbeddingProvider";
import { GeminiContextReranker } from "../gemini/geminiContextReranker";
import { GeminiContextCompressor } from "../gemini/geminiContextCompressor";

import { GEMINI } from "../../../../config/gemini";

export class OpenRouterProvider
    implements IAIProvider {

    create(): AIProviders {

        const chatClient =

            new OpenRouterClient();

        const geminiClient =

            new GeminiClient(

                GEMINI

            );

        return {

            embeddingProvider:

                new GeminiEmbeddingProvider(

                    geminiClient

                ),

            chatProvider:

                new OpenRouterChatProvider(

                    chatClient

                ),

            reranker:

                new GeminiContextReranker(

                    geminiClient

                ),

            compressor:

                new GeminiContextCompressor(

                    geminiClient

                )

        };

    }

}