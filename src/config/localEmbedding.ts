export interface LocalEmbeddingConfiguration {

    enabled: boolean;

    /**
     * Modelo de sentence-embeddings convertido a ONNX
     * (formato que usa @huggingface/transformers). Se elige uno
     * multilingüe por defecto porque los reglamentos que
     * importa esta app están en español.
     */
    model: string;

}

export const LOCAL_EMBEDDING: LocalEmbeddingConfiguration = {

    enabled:

        (process.env.LOCAL_EMBEDDING_ENABLED ?? "")
            .trim()
            .toLowerCase() === "true",

    model:

        process.env.LOCAL_EMBEDDING_MODEL
            ?? "Xenova/paraphrase-multilingual-MiniLM-L12-v2"

};
