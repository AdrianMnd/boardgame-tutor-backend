export interface IEmbeddingProvider {

    generate(
        text: string
    ): Promise<number[]>;

    /**
     * Genera varios embeddings en una sola petición cuando el
     * proveedor lo soporta, reduciendo drásticamente el número
     * de peticiones necesarias para importar un juego entero.
     */
    generateBatch(
        texts: string[]
    ): Promise<number[][]>;

}