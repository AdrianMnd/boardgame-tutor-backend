import type { OpenAICompatibleConfiguration }
    from "../../common/OpenAICompatibleConfiguration";

import { OpenAICompatibleClient }
    from "../../common/OpenAICompatibleClient";

/**
 * DeepInfra: API compatible con OpenAI para chat y embeddings.
 * https://deepinfra.com/docs
 */
export class DeepInfraClient
    extends OpenAICompatibleClient {

    override readonly supportsEmbeddings = true;

    constructor(

        configuration: OpenAICompatibleConfiguration

    ) {

        super(

            configuration

        );

    }

    override async generateEmbedding(

        text: string

    ): Promise<number[]> {

        return this.generateEmbeddingViaOpenAiApi(

            text

        );

    }

    async generateEmbeddingBatch(

        texts: string[]

    ): Promise<number[][]> {

        return this.generateEmbeddingBatchViaOpenAiApi(

            texts

        );

    }

}
