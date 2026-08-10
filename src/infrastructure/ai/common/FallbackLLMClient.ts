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

}
