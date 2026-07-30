import { GoogleGenAI } from "@google/genai";

import type { AIProvider } from "./ai-provider";

import { SYSTEM_PROMPT } from "../prompts/system.prompt";

export class GeminiProvider implements AIProvider {

    private client: GoogleGenAI;

    private readonly model: string;

    constructor() {

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {

            throw new Error(
                "La variable GEMINI_API_KEY no está definida."
            );

        }

        this.client = new GoogleGenAI({
            apiKey
        });

        this.model =
            process.env.GEMINI_MODEL ??
            "gemini-2.5-flash";

    }

    async ask(
        question: string,
        context: string
    ): Promise<string> {

        const prompt = `
${SYSTEM_PROMPT}

------------------------------------

CONTEXTO

${context}

------------------------------------

PREGUNTA

${question}
`;

        const response =
            await this.client.models.generateContent({

                model: this.model,

                contents: prompt

            });

        return response.text ?? "No se obtuvo respuesta.";

    }

}