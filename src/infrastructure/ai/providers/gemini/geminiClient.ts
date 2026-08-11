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

        // Defensa crítica: si la API devuelve menos embeddings
        // de los textos pedidos (puede pasar con lotes grandes,
        // sin que llegue a ser un error HTTP), asignar por
        // posición dejaría chunks con embedding "undefined" —
        // que luego se guardan silenciosamente sin ese campo en
        // knowledge.json (JSON.stringify elimina las claves
        // undefined) y rompen CUALQUIER pregunta sobre ese juego
        // más adelante, de forma muy difícil de diagnosticar.
        // Mejor fallar aquí, alto y claro.
        if (embeddings.length !== texts.length) {

            throw new Error(

                `Gemini devolvió ${embeddings.length} embeddings ` +
                `para ${texts.length} textos pedidos en el mismo lote. ` +
                `Prueba a reducir IMPORT_EMBEDDING_BATCH_SIZE en tu .env ` +
                `(por ejemplo, a la mitad del valor actual).`

            );

        }

        return embeddings;

    }

}