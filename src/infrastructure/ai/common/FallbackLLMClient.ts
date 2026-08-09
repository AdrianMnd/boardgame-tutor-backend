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
 */
export class FallbackLLMClient
    implements ILLMClient {

    readonly supportsEmbeddings: boolean;

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

    }

    async generateText(

        prompt: string

    ): Promise<string> {

        return this.run(

            "generateText",

            client => client.generateText(prompt)

        );

    }

    async generateChat(

        messages: ChatMessage[]

    ): Promise<string> {

        return this.run(

            "generateChat",

            client => client.generateChat(messages)

        );

    }

    async generateEmbedding(

        text: string

    ): Promise<number[]> {

        const capableClients =

            this.clients.filter(

                entry => entry.client.supportsEmbeddings

            );

        if (capableClients.length === 0) {

            throw new Error(

                "Ningún proveedor de IA configurado soporta generación de embeddings. " +

                "Proveedores disponibles: " +
                this.clients.map(entry => entry.name).join(", ") +
                ". Configura GEMINI_API_KEY o MISTRAL_API_KEY (OpenRouter no soporta embeddings)."

            );

        }

        let lastError: unknown;

        for (const { name, client } of capableClients) {

            try {

                return await client.generateEmbedding!(text);

            }
            catch (error) {

                lastError = error;

                if (!isRetryableProviderError(error)) {

                    throw error;

                }

                console.warn(

                    `[IA] ${name} no disponible para embeddings (cuota/rate-limit). Probando siguiente proveedor...`

                );

            }

        }

        throw lastError;

    }

    private async run<T>(

        operationName: string,

        operation: (client: ILLMClient) => Promise<T>

    ): Promise<T> {

        let lastError: unknown;

        for (const { name, client } of this.clients) {

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
