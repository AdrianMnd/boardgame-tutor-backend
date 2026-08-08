import { GoogleGenAI } from "@google/genai";

import type { GeminiConfiguration }
    from "./geminiConfiguration";

import type { ILLMClient }
    from "../../common/ILLMClient";

import type { ChatMessage }
    from "../../common/ChatMessage";

import { retry } from "../../common/retry";
import { isRetryableProviderError } from "../../common/isRetryableProviderError";

export class GeminiClient
implements ILLMClient {

    readonly supportsEmbeddings = true;

    private readonly client: GoogleGenAI;

    constructor(

        private readonly configuration: GeminiConfiguration

    ) {

        this.client =

            new GoogleGenAI({

                apiKey:

                    configuration.apiKey

            });

    }

    async generateText(

    prompt: string

): Promise<string> {

    const response =

        await retry(() =>

            this.client.models.generateContent({

                model:

                    this.configuration.chatModel,

                contents:

                    prompt

            }),

            {
                shouldRetry:
                    error => !isRetryableProviderError(error)
            }

        );

    return response.text ?? "";

}

    async generateChat(

        messages: ChatMessage[]

    ): Promise<string> {

        const prompt =

            messages

                .map(

                    message =>

`${message.role.toUpperCase()}

${message.content}`

                )

                .join("\n\n");

        return this.generateText(

            prompt

        );

    }

    async generateEmbedding(

    text: string

): Promise<number[]> {

    const response =

        await retry(() =>

            this.client.models.embedContent({

                model:

                    this.configuration.embeddingModel,

                contents:

                    text

            }),

            {
                shouldRetry:
                    error => !isRetryableProviderError(error)
            }

        );

    return (

        response.embeddings?.[0]?.values

        ?? []

    );

}

}