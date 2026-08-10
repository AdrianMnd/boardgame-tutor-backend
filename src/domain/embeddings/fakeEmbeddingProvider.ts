import { IEmbeddingProvider } from "./IEmbeddingProvider";

export class FakeEmbeddingProvider
    implements IEmbeddingProvider {

    async generate(
        text: string
    ): Promise<number[]> {

        return Array.from(

            { length: 768 },

            (_, index) =>

                (text.length + index) / 1000

        );

    }

    async generateBatch(
        texts: string[]
    ): Promise<number[][]> {

        return Promise.all(

            texts.map(

                text => this.generate(text)

            )

        );

    }

}