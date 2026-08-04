import { GoogleGenAI } from "@google/genai";

import type { GeminiConfiguration }
    from "./geminiConfiguration";

export class GeminiClient {

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

        return (

            response.text

            ?? ""

        );

    }

    async generateEmbedding(

        text: string

    ): Promise<number[]> {

        const response =

            await this.client.models.embedContent({

                model:

                    this.configuration.embeddingModel,

                contents: text

            });

        return (

            response.embeddings?.[0]?.values

            ?? []

        );

    }

}