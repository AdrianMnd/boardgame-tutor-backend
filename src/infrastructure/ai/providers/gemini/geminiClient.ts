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

    readonly supportsChat = true;

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

    async *generateTextStream(

        prompt: string

    ): AsyncIterable<string> {

        const stream =

            await retry(() =>

                this.client.models.generateContentStream({

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

        for await (const chunk of stream) {

            const text = chunk.text;

            if (text) {

                yield text;

            }

        }

    }

    async generateChat(

        messages: ChatMessage[]

    ): Promise<string> {

        return this.generateText(

            this.buildPromptFromMessages(messages)

        );

    }

    async *generateChatStream(

        messages: ChatMessage[]

    ): AsyncIterable<string> {

        yield* this.generateTextStream(

            this.buildPromptFromMessages(messages)

        );

    }

    private buildPromptFromMessages(

        messages: ChatMessage[]

    ): string {

        return messages

            .map(

                message =>

                    `${message.role.toUpperCase()}\n${message.content}`

            )

            .join("\n\n");

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

    async generateEmbeddingBatch(

        texts: string[]

    ): Promise<number[][]> {

        const response =

            await retry(() =>

                this.client.models.embedContent({

                    model:

                        this.configuration.embeddingModel,

                    contents:

                        texts

                }),

                {
                    shouldRetry:
                        error => !isRetryableProviderError(error)
                }

            );

        const embeddings =

            response.embeddings?.map(

                embedding => embedding.values ?? []

            )

            ?? [];

        // Algunos modelos de embeddings no soportan pedir varios
        // textos en una sola llamada — aceptan el array sin dar
        // error, pero solo devuelven 1 resultado. En vez de
        // fallar la importación entera por esto, se cae a pedir
        // los embeddings uno a uno con el método individual (que
        // sí funciona siempre), avisando una sola vez.
        if (embeddings.length !== texts.length) {

            console.warn(

                `[Gemini] El modelo "${this.configuration.embeddingModel}" ` +
                `no soportó pedir ${texts.length} embeddings en un solo ` +
                `lote (devolvió ${embeddings.length}). Generando uno a uno ` +
                `para este lote — más lento, pero funciona.`

            );

            const fallbackResults: number[][] = [];

            for (const text of texts) {

                fallbackResults.push(

                    await this.generateEmbedding(text)

                );

            }

            return fallbackResults;

        }

        return embeddings;

    }

}
