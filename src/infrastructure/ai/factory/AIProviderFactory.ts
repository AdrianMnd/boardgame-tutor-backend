import { AI_CONFIGURATION } from "../../../config/ai";

import type { AIProviders } from "./AIProviders";

import { GeminiProvider }
    from "../providers/gemini/geminiProvider";

import { OpenRouterProvider }
    from "../providers/openrouter/OpenRouterProvider";

export class AIProviderFactory {

    static create(): AIProviders {

        console.log(
            "Proveedor IA:",
            AI_CONFIGURATION.provider
        );

        switch (
            AI_CONFIGURATION.provider
        ) {

            case "gemini":

                return new GeminiProvider()
                    .create();

            case "openrouter":

                return new OpenRouterProvider()
                    .create();

            default:

                throw new Error(

                    `Proveedor IA no soportado: ${AI_CONFIGURATION.provider}`

                );

        }

    }

}