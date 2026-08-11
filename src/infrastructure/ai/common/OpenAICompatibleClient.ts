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

        index: number;

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

    async *generateTextStream(

        prompt: string

    ): AsyncIterable<string> {

        yield* this.generateChatStream([

            {

                role: "user",

                content: prompt

            }

        ]);

    }

    /**
     * Streaming vía Server-Sent Events, tal como lo expone la
     * API de OpenAI y sus compatibles (`stream: true`). Cada
     * línea del cuerpo de la respuesta tiene el formato
     * `data: {...}\n\n`, terminando con `data: [DONE]\n\n`. No
     * hay SDK aquí (usamos fetch directo), así que el parseo se
     * hace a mano leyendo el stream de bytes según van llegando.
     */
    async *generateChatStream(

        messages: ChatMessage[]

    ): AsyncIterable<string> {

        const response =

            await retry(() =>

                fetch(

                    `${this.configuration.baseUrl}/chat/completions`,

                    {

                        method: "POST",

                        headers: {

                            Authorization:

                                `Bearer ${this.configuration.apiKey}`,

                            "Content-Type":

                                "application/json"

                        },

                        body:

                            JSON.stringify({

                                model:

                                    this.configuration.chatModel,

                                messages,

                                stream: true

                            })

                    }

                ),

                {
                    shouldRetry:
                        error => !isRetryableProviderError(error)
                }

            );

        if (!response.ok) {

            const errorBody = await response.text();

            const error: Error & { status?: number } =

                new Error(errorBody || response.statusText);

            error.status = response.status;

            throw error;

        }

        const body = response.body;

        if (!body) {

            return;

        }

        const reader = body.getReader();

        const decoder = new TextDecoder();

        let buffer = "";

        while (true) {

            const { done, value } = await reader.read();

            if (done) {

                break;

            }

            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split("\n");

            // La última línea puede estar incompleta todavía —
            // se guarda para completarla con el siguiente trozo.
            buffer = lines.pop() ?? "";

            for (const line of lines) {

                const trimmed = line.trim();

                if (!trimmed.startsWith("data:")) {

                    continue;

                }

                const payload = trimmed.slice(5).trim();

                if (payload === "[DONE]") {

                    return;

                }

                try {

                    const json = JSON.parse(payload);

                    const delta =

                        json.choices?.[0]?.delta?.content;

                    if (typeof delta === "string" && delta.length > 0) {

                        yield delta;

                    }

                }
                catch {

                    // Fragmento de JSON incompleto o línea de
                    // keep-alive — se ignora, no es un error.

                }

            }

        }

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

    /**
     * Igual que generateEmbeddingViaOpenAiApi pero para varios
     * textos en una sola petición HTTP (el endpoint de OpenAI
     * y compatibles acepta un array en `input`). Reduce
     * drásticamente el número de peticiones — de una por chunk
     * a una por lote — que es lo que agota los límites de
     * peticiones-por-minuto de los planes gratuitos.
     */
    protected async generateEmbeddingBatchViaOpenAiApi(

        texts: string[]

    ): Promise<number[][]> {

        const response =

            await this.post<EmbeddingResponse>(

                "/embeddings",

                {

                    model:

                        this.configuration.embeddingModel,

                    input:

                        texts

                }

            );

        // El array `data` no siempre viene en el mismo orden
        // que `texts` — se ordena explícitamente por `index`
        // para no desalinear los embeddings con sus chunks.
        return response.data

            .slice()

            .sort(

                (a, b) =>

                    a.index - b.index

            )

            .map(

                item => item.embedding

            );

    }

}
