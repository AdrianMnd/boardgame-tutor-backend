import { IEmbeddingProvider }
    from "../../../domain/embeddings/IEmbeddingProvider";

import type { ILLMClient }
    from "./ILLMClient";

export class LLMEmbeddingProvider
    implements IEmbeddingProvider {

    constructor(

        private readonly client: ILLMClient

    ) {}

    async generate(

        text: string

    ): Promise<number[]> {

        if (

            !this.client.generateEmbedding

        ) {

            throw new Error(

                "El proveedor actual no soporta embeddings."

            );

        }

        return this.client.generateEmbedding(

            text

        );

    }

    async generateBatch(

        texts: string[]

    ): Promise<number[][]> {

        if (

            !this.client.generateEmbeddingBatch

        ) {

            // Sin soporte de lote a este nivel: se genera uno a
            // uno (el propio cliente/FallbackLLMClient decide
            // internamente cómo resolverlo).
            const results: number[][] = [];

            for (const text of texts) {

                results.push(

                    await this.generate(text)

                );

            }

            return results;

        }

        return this.client.generateEmbeddingBatch(

            texts

        );

    }

}