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

}