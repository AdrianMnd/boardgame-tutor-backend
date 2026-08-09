import type { ChatMessage } from "./ChatMessage";

export interface ILLMClient {

    /**
     * Indica explícitamente si este cliente soporta generación
     * de embeddings. No basta con comprobar si el método existe:
     * algunos clientes (ej. OpenRouter) lo implementan solo para
     * lanzar un error "no soportado", así que la detección por
     * tipo de función daría un falso positivo.
     */
    readonly supportsEmbeddings: boolean;

    generateText(

        prompt: string

    ): Promise<string>;

    generateChat(

        messages: ChatMessage[]

    ): Promise<string>;

    generateEmbedding?(

        text: string

    ): Promise<number[]>;

}