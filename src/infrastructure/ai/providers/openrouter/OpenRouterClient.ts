import { OPENROUTER }
    from "../../../../config/openrouter";

import { OpenAICompatibleClient }
    from "../../common/OpenAICompatibleClient";

export class OpenRouterClient
    extends OpenAICompatibleClient {

    constructor() {

        super(

            OPENROUTER

        );

    }

    async generateEmbedding(

        text: string

    ): Promise<number[]> {

        throw new Error(

            "OpenRouter no implementa embeddings."

        );

    }

}