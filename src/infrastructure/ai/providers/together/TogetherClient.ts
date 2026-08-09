import type { OpenAICompatibleConfiguration }
    from "../../common/OpenAICompatibleConfiguration";

import { OpenAICompatibleClient }
    from "../../common/OpenAICompatibleClient";

/**
 * Together AI: API compatible con OpenAI para chat y embeddings.
 * https://docs.together.ai
 */
export class TogetherClient
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

}
