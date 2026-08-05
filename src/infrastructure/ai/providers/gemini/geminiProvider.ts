import type { IAIProvider } from "../IAIProvider";
import type { AIProviders } from "../../factory/AIProviders";

import { GEMINI } from "../../../../config/gemini";

import { GeminiClient } from "./geminiClient";

import { LLMEmbeddingProvider } from "../../common/LLMEmbeddingProvider";
import { GeminiChatProvider } from "./geminiChatProvider";
import { LLMContextReranker } from "../../common/LLMContextReranker";
import { LLMContextCompressor } from "../../common/LLMContextCompressor";

export class GeminiProvider
implements IAIProvider {

    create(): AIProviders {

        const client =

            new GeminiClient(

                GEMINI

            );

        return {

            embeddingProvider:

                new LLMEmbeddingProvider(

                    client

                ),

            chatProvider:

                new GeminiChatProvider(

                    client

                ),

            reranker:

                new LLMContextReranker(

                    client

                ),

            compressor:

                new LLMContextCompressor(

                    client

                )

        };

    }

}