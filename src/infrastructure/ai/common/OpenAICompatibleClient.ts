import type { ChatMessage } from "./ChatMessage";
import type { OpenAICompatibleConfiguration } from "./OpenAICompatibleConfiguration";
import type { ILLMClient } from "./ILLMClient";
import { retry } from "./retry";
import { isRetryableProviderError } from "./isRetryableProviderError";

interface ChatCompletionResponse {

    choices: {

        message: {

            content: string;

        };

    }[];

}

interface EmbeddingResponse {

    data: {

        embedding: number[];

    }[];

}

export class OpenAICompatibleClient
    implements ILLMClient {

    /**
     * Por defecto, no se asume soporte de embeddings — las
     * subclases que sí lo soporten (ej. MistralClient) lo
     * sobreescriben a `true`.
     */
    readonly supportsEmbeddings: boolean = false;

    readonly supportsChat: boolean = true;

    constructor(

        protected readonly configuration:
            OpenAICompatibleConfiguration

    ) {}

    protected async post<T>(

        endpoint: string,

        body: unknown

    ): Promise<T> {

        const response =

            await retry(() =>

                fetch(

                    `${this.configuration.baseUrl}${endpoint}`,

                    {

                        method: "POST",

                        headers: {

                            Authorization:

                                `Bearer ${this.configuration.apiKey}`,

                            "Content-Type":

                                "application/json"

                        },

                        body:

                            JSON.stringify(body)

                    }

                ),

                {
                    shouldRetry:
                        error => !isRetryableProviderError(error)
                }

            );

        if (!response.ok) {

            const errorBody =
                await response.text();

            const error: Error & { status?: number } =

                new Error(
                    errorBody || response.statusText
                );

            error.status = response.status;

            throw error;

        }

        return response.json();

    }

    async generateText(

        prompt: string

    ): Promise<string> {

        return this.generateChat([

            {

                role: "user",

                content: prompt

            }

        ]);

    }

    async generateChat(

        messages: ChatMessage[]

    ): Promise<string> {

        const response =

            await this.post<ChatCompletionResponse>(

                "/chat/completions",

                {

                    model:

                        this.configuration.chatModel,

                    messages

                }

            );

        return (

            response.choices[0]?.message.content

            ??

            ""

        );

    }

    async generateEmbedding(

        text: string

    ): Promise<number[]> {

        throw new Error(

            "Not implemented."

        );

    }

    /**
     * Implementación genérica del endpoint de embeddings
     * compatible con el formato de OpenAI (`POST /embeddings`).
     * Las subclases cuyo proveedor lo soporte pueden llamarla
     * directamente desde su propio `generateEmbedding`.
     */
    protected async generateEmbeddingViaOpenAiApi(

        text: string

    ): Promise<number[]> {

        const response =

            await this.post<EmbeddingResponse>(

                "/embeddings",

                {

                    model:

                        this.configuration.embeddingModel,

                    input:

                        text

                }

            );

        return response.data[0]?.embedding ?? [];

    }

}
