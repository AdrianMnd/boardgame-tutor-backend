import type { AIProviders } from "../../factory/AIProviders";

import type { IAIProvider } from "../IAIProvider";

import { GeminiClient } from "../../providers/gemini/geminiClient";

import { GeminiEmbeddingProvider } from "../../providers/gemini/geminiEmbeddingProvider";
import { GeminiChatProvider } from "../../providers/gemini/geminiChatProvider";
import { GeminiContextReranker } from "../../providers/gemini/geminiContextReranker";
import { GeminiContextCompressor } from "../../providers/gemini/geminiContextCompressor";

export class GeminiProvider
    implements IAIProvider {

    constructor(

        private readonly client: GeminiClient

    ) {}

    create(): AIProviders {

        return {

            embeddingProvider:

                new GeminiEmbeddingProvider(

                    this.client

                ),

            chatProvider:

                new GeminiChatProvider(

                    this.client

                ),

            reranker:

                new GeminiContextReranker(

                    this.client

                ),

            compressor:

                new GeminiContextCompressor(

                    this.client

                )

        };

    }

}