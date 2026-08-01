export interface IEmbeddingProvider {

    generate(
        text: string
    ): Promise<number[]>;

}