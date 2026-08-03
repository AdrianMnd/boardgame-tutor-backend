import { AI_CONFIGURATION } from "../../../config/ai";

import type { AIProviders } from "./AIProviders";

import { GeminiClient } from "../providers/gemini/geminiClient";

import { GeminiProvider } from "../providers/gemini/geminiProvider";
import { GEMINI } from "../../../config/gemini";

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

            default:

                throw new Error(

                    `Proveedor de IA no soportado: ${AI_CONFIGURATION.provider}`

                );

        }

    }

}