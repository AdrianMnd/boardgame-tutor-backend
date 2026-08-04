import { IEmbeddingProvider } from "../../../../domain/embeddings/IEmbeddingProvider";
import { GeminiClient } from "./geminiClient";

export class GeminiEmbeddingProvider
    implements IEmbeddingProvider {

    constructor(

        private readonly client: GeminiClient

    ) {}

    async generate(
        text: string
    ): Promise<number[]> {

        return this.client.generateEmbedding(
            text
        );

    }

}