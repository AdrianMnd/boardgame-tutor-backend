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

}