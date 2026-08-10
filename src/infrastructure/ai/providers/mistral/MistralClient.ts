import type { OpenAICompatibleConfiguration }
    from "../../common/OpenAICompatibleConfiguration";

import { OpenAICompatibleClient }
    from "../../common/OpenAICompatibleClient";

/**
 * La Plataforme (Mistral AI) expone una API compatible con el
 * formato de OpenAI tanto para chat/completions como para
 * embeddings, incluye un nivel gratuito con límites de uso
 * razonables. https://docs.mistral.ai
 */
export class MistralClient
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
