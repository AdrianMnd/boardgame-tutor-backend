import OpenAI from "openai";

import type { AIProvider } from "./ai-provider";

import { BaseAIProvider } from "./base-ai.provider";

import { SYSTEM_PROMPT } from "../prompts/system.prompt";

import type { AIResponse } from "../../../types/AIResponse";

export class OpenAIProvider
    extends BaseAIProvider
    implements AIProvider {

    private client: OpenAI;

    private readonly model: string;

    constructor() {

        super();

        this.client = new OpenAI({

            apiKey: this.getEnv(
                "OPENAI_API_KEY"
            )

        });

        this.model = this.getOptionalEnv(

            "OPENAI_MODEL",

            "gpt-5-mini"

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

            this.client.responses.create({

                model: this.model,

                input: [

                    {

                        role: "system",

                        content: SYSTEM_PROMPT

                    },

                    {

                        role: "user",

                        content: `

Contexto:

${context}

Pregunta:

${question}

`

                    }

                ]

            })

        );

        return {

            answer:

                result.output_text,

            provider:

                "openai",

            model:

                this.model,

            durationMs,

            usage: {

                inputTokens:

                    result.usage?.input_tokens,

                outputTokens:

                    result.usage?.output_tokens,

                totalTokens:

                    result.usage?.total_tokens

            }

        };

    }

}