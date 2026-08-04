import { AI_CONFIGURATION } from "../../../config/ai";

import type { AIProviders } from "./AIProviders";

import { GeminiClient } from "../providers/gemini/geminiClient";
import { GeminiProvider } from "../providers/gemini/geminiProvider";

import { GEMINI } from "../../../config/gemini";

import { OpenRouterClient } from "../providers/openrouter/OpenRouterClient";
import { OpenRouterProvider } from "../providers/openrouter/OpenRouterProvider";

export class AIProviderFactory {

    static create(): AIProviders {

        switch (AI_CONFIGURATION.provider) {

            case "gemini": {

                const client =

                    new GeminiClient(

                        GEMINI

                    );

                return new GeminiProvider(

                    client

                ).create();

            }

            case "openrouter": {

                const client =

                    new OpenRouterClient();

                return new OpenRouterProvider(

                    client

                ).create();

            }

            default:

                throw new Error(

                    `Proveedor de IA no soportado: ${AI_CONFIGURATION.provider}`

                );

        }

    }

}