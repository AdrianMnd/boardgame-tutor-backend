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

    /**
     * Indica explícitamente si este cliente soporta generación
     * de texto/chat. Necesario por el mismo motivo que
     * supportsEmbeddings: un cliente dedicado solo a embeddings
     * (ej. un modelo local) puede implementar generateText/
     * generateChat únicamente para lanzar "no soportado", y eso
     * no debe tratarse como un fallo de cuota.
     */
    readonly supportsChat: boolean;

    generateText(

        prompt: string

    ): Promise<string>;

    generateChat(

        messages: ChatMessage[]

    ): Promise<string>;

    generateEmbedding?(

        text: string

    ): Promise<number[]>;

    /**
     * Genera varios embeddings en una sola petición HTTP en
     * vez de una por texto. Es opcional porque no todos los
     * proveedores lo soportan (si falta, FallbackLLMClient cae
     * a generar uno a uno con el mismo proveedor).
     */
    generateEmbeddingBatch?(

        texts: string[]

    ): Promise<number[][]>;

}