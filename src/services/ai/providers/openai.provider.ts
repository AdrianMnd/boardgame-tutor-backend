import OpenAI from "openai";

import type { AIProvider } from "./ai-provider";

export class OpenAIProvider implements AIProvider {

    private client: OpenAI;

    private readonly model: string;

    constructor() {

        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {

            throw new Error(
                "La variable OPENAI_API_KEY no está definida."
            );

        }

        this.client = new OpenAI({
            apiKey
        });

        this.model =
            process.env.OPENAI_MODEL ?? "gpt-5-mini";

    }

    async ask(
        question: string,
        context: string
    ): Promise<string> {

        const response =
            await this.client.responses.create({

                model: this.model,

                input: [

                    {
                        role: "system",

                        content: `
Eres un experto en reglas de juegos de mesa.

Responde ÚNICAMENTE utilizando el contexto proporcionado.

Si el contexto no contiene la respuesta, responde exactamente:

"No he encontrado esa información en el reglamento disponible."

Nunca inventes reglas.
`
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

            });

        return response.output_text;

    }

}