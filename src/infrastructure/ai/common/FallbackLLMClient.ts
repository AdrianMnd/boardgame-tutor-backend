import type { ILLMClient } from "./ILLMClient";
import type { ChatMessage } from "./ChatMessage";

import { isRetryableProviderError } from "./isRetryableProviderError";

export interface NamedLLMClient {

    name: string;

    client: ILLMClient;

}

/**
 * Envuelve varios clientes de IA y los prueba en orden.
 *
 * Si un proveedor falla por cuota agotada / rate limit /
 * no disponible temporalmente, se pasa automáticamente al
 * siguiente de la lista. Cualquier otro tipo de error
 * (parámetros inválidos, bug real, etc.) se propaga
 * inmediatamente sin intentar los demás proveedores, para no
 * ocultar fallos que no tienen que ver con la cuota.
 *
 * Antes de intentar una operación, se filtran los clientes que
 * no la soportan (ej. un modelo local solo-embeddings no se
 * intenta nunca para generateChat, y OpenRouter no se intenta
 * nunca para embeddings) — la capacidad se declara explícitamente
 * vía supportsChat/supportsEmbeddings, no se infiere de si el
 * método existe.
 */
export class FallbackLLMClient
    implements ILLMClient {

    readonly supportsEmbeddings: boolean;

    readonly supportsChat: boolean;

    constructor(

        private readonly clients: NamedLLMClient[]

    ) {

        if (clients.length === 0) {

            throw new Error(

                "FallbackLLMClient necesita al menos un proveedor de IA configurado."

            );

        }

        this.supportsEmbeddings =

            clients.some(

                entry => entry.client.supportsEmbeddings

            );

        this.supportsChat =

            clients.some(

                entry => entry.client.supportsChat

            );

    }

    async generateText(

        prompt: string

    ): Promise<string> {

        return this.run(

            "generateText",

            client => client.supportsChat,

            client => client.generateText(prompt)

        );

    }

    async *generateTextStream(

        prompt: string

    ): AsyncIterable<string> {

        yield* this.runStream(

            "generateTextStream",

            client => client.supportsChat,

            client =>

                client.generateTextStream

                    ? client.generateTextStream(prompt)

                    : this.singleChunkStream(

                        () => client.generateText(prompt)

                    )

        );

    }

    async generateChat(

        messages: ChatMessage[]

    ): Promise<string> {

        return this.run(

            "generateChat",

            client => client.supportsChat,

            client => client.generateChat(messages)

        );

    }

    async generateEmbedding(

        text: string

    ): Promise<number[]> {

        return this.run(

            "embeddings",

            client => client.supportsEmbeddings,

            client => client.generateEmbedding!(text)

        );

    }

    /**
     * Igual que generateEmbedding pero para varios textos de
     * una vez. Si el proveedor activo soporta lotes, se manda
     * todo en una sola petición HTTP. Si no, se generan uno a
     * uno pero SIEMPRE con el mismo proveedor dentro del mismo
     * lote — nunca se reparte un lote entre distintos
     * proveedores, para no acabar con embeddings de
     * dimensiones distintas mezclados en el mismo resultado.
     */
    async generateEmbeddingBatch(

        texts: string[]

    ): Promise<number[][]> {

        return this.run(

            "embeddings en lote",

            client => client.supportsEmbeddings,

            async client => {

                if (client.generateEmbeddingBatch) {

                    return client.generateEmbeddingBatch(

                        texts

                    );

                }

                const results: number[][] = [];

                for (const text of texts) {

                    results.push(

                        await client.generateEmbedding!(

                            text

                        )

                    );

                }

                return results;

            }

        );

    }

    private async *singleChunkStream(

        operation: () => Promise<string>

    ): AsyncIterable<string> {

        const text = await operation();

        if (text) {

            yield text;

        }

    }

    private async run<T>(

        operationName: string,

        supports: (client: ILLMClient) => boolean,

        operation: (client: ILLMClient) => Promise<T>

    ): Promise<T> {

        const capableClients =

            this.clients.filter(

                entry => supports(entry.client)

            );

        if (capableClients.length === 0) {

            throw new Error(

                `Ningún proveedor de IA configurado soporta "${operationName}". ` +

                "Proveedores disponibles: " +
                this.clients.map(entry => entry.name).join(", ") +
                "."

            );

        }

        let lastError: unknown;

        for (const { name, client } of capableClients) {

            try {

                return await operation(client);

            }
            catch (error) {

                lastError = error;

                if (!isRetryableProviderError(error)) {

                    throw error;

                }

                console.warn(

                    `[IA] ${name} no disponible para ${operationName} (cuota/rate-limit). Probando siguiente proveedor...`

                );

            }

        }

        throw lastError;

    }

    /**
     * Versión en streaming de `run`. La diferencia clave: si un
     * proveedor falla DESPUÉS de haber emitido ya algún
     * fragmento, no tiene sentido "cambiar de proveedor" — el
     * usuario ya está viendo una respuesta a medias — así que
     * el error se propaga tal cual en vez de reintentar con
     * otro proveedor desde cero.
     */
    private async *runStream(

        operationName: string,

        supports: (client: ILLMClient) => boolean,

        getStream: (client: ILLMClient) => AsyncIterable<string>

    ): AsyncIterable<string> {

        const capableClients =

            this.clients.filter(

                entry => supports(entry.client)

            );

        if (capableClients.length === 0) {

            throw new Error(

                `Ningún proveedor de IA configurado soporta "${operationName}". ` +

                "Proveedores disponibles: " +
                this.clients.map(entry => entry.name).join(", ") +
                "."

            );

        }

        let lastError: unknown;

        for (const { name, client } of capableClients) {

            let yieldedAny = false;

            try {

                for await (const chunk of getStream(client)) {

                    yieldedAny = true;

                    yield chunk;

                }

                return;

            }
            catch (error) {

                lastError = error;

                if (yieldedAny || !isRetryableProviderError(error)) {

                    throw error;

                }

                console.warn(

                    `[IA] ${name} no disponible para ${operationName} (cuota/rate-limit). Probando siguiente proveedor...`

                );

            }

        }

        throw lastError;

    }

}
