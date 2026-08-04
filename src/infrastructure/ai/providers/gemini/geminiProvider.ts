import type { IAIProvider } from "../IAIProvider";
import type { AIProviders } from "../../factory/AIProviders";

import { GEMINI } from "../../../../config/gemini";

import { GeminiClient } from "./geminiClient";

import { GeminiEmbeddingProvider } from "./geminiEmbeddingProvider";
import { GeminiChatProvider } from "./geminiChatProvider";
import { GeminiContextReranker } from "./geminiContextReranker";
import { GeminiContextCompressor } from "./geminiContextCompressor";

export class GeminiProvider
implements IAIProvider {

    create(): AIProviders {

        const client =

            new GeminiClient(

                GEMINI

            );

        return {

            embeddingProvider:

                new GeminiEmbeddingProvider(

                    client

                ),

            chatProvider:

                new GeminiChatProvider(

                    client

                ),

            reranker:

                new GeminiContextReranker(

                    client

                ),

            compressor:

                new GeminiContextCompressor(

                    client

                )

        };

    }

}