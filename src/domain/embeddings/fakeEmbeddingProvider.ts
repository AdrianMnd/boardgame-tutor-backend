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

}