import type { OpenAICompatibleConfiguration }
    from "../../common/OpenAICompatibleConfiguration";

import { OpenAICompatibleClient }
    from "../../common/OpenAICompatibleClient";

/**
 * Cliente para la API oficial de OpenAI. Soporta chat y
 * embeddings de forma nativa (es literalmente el formato en el
 * que se basa OpenAICompatibleClient).
 */
export class OpenAIClient
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
