import type { IEmbeddingProvider } from "./IEmbeddingProvider";

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