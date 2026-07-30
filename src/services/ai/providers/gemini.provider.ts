import { GoogleGenAI } from "@google/genai";

import type { AIProvider } from "./ai-provider";

import { BaseAIProvider } from "./base-ai.provider";

import { SYSTEM_PROMPT } from "../prompts/system.prompt";

import type { AIResponse } from "../../../types/AIResponse";

export class GeminiProvider
    extends BaseAIProvider
    implements AIProvider {

    private client: GoogleGenAI;

    private readonly model: string;

    constructor() {

        super();

        this.client = new GoogleGenAI({

            apiKey: this.getEnv(
                "GEMINI_API_KEY"
            )

        });

        this.model = this.getOptionalEnv(

            "GEMINI_MODEL",

            "gemini-2.5-flash"

        );

    }

    async ask(
        question: string,
        context: string
    ): Promise<AIResponse> {

        const {

            result,

            durationMs

        } = await this.measure(async () =>

            this.client.models.generateContent({

                model: this.model,

                config: {

                    systemInstruction:

                        SYSTEM_PROMPT

                },

                contents: `

Contexto:

${context}

Pregunta:

${question}

`

            })

        );

        return {

            answer:

                result.text ?? "",

            provider:

                "gemini",

            model:

                this.model,

            durationMs

        };

    }

}