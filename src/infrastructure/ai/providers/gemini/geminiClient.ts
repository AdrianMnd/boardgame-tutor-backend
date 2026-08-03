import { GoogleGenAI } from "@google/genai";

import type { GeminiConfiguration } from "./geminiConfiguration";

export class GeminiClient {

    private readonly client: GoogleGenAI;

    constructor(

        private readonly configuration: GeminiConfiguration

    ) {

        this.client = new GoogleGenAI({

            apiKey: configuration.apiKey

        });

    }

    async generateEmbedding(
    text: string
): Promise<number[]> {

    const response =
        await this.client.models.embedContent({

            model: this.configuration.embeddingModel,

            contents: text

        });

    const embedding =
        response.embeddings?.[0]?.values;

    if (!embedding) {

        throw new Error(
            "Gemini no devolvió ningún embedding."
        );

    }

    return embedding;

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

    async generateAnswer(

            question: string,

            context: string

        ): Promise<string> {

            const prompt = `
        Eres un experto en juegos de mesa.

        Contesta únicamente usando la información del reglamento.

        Si el reglamento no contiene la respuesta, responde:

        "No he encontrado esa información en el reglamento."

        Reglamento:

        ${context}

        Pregunta:

        ${question}
        `;

            const response =
                await this.client.models.generateContent({

                    model: this.configuration.chatModel,

                    contents: prompt

                });

            return response.text ?? "";

        }

        async generateStructuredContent(

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

}