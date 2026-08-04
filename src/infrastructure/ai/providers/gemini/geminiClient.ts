import { GoogleGenAI } from "@google/genai";

import type { GeminiConfiguration }
    from "./geminiConfiguration";

import type { ILLMClient }
    from "../../common/ILLMClient";

import type { ChatMessage }
    from "../../common/ChatMessage";

export class GeminiClient
implements ILLMClient {

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

            await this.client.models.generateContent({

                model:

                    this.configuration.chatModel,

                contents:

                    prompt

            });

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

            await this.client.models.embedContent({

                model:

                    this.configuration.embeddingModel,

                contents:

                    text

            });

        return (

            response.embeddings?.[0]?.values

            ?? []

        );

    }

}