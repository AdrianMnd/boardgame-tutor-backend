import type { IEmbeddingProvider } from "../../src/infrastructure/ai/embeddings/iEmbeddingProvider";

export class FakeEmbeddingProvider
    implements IEmbeddingProvider {

    async generateEmbedding(
        text: string
    ): Promise<number[]> {

        return [

            text.length,

            text.split(" ").length,

            1

        ];

    }

}