import { ChatProvider } from "../../../../domain/ai/chatProvider";

import { GeminiClient } from "./geminiClient";

export class GeminiChatProvider
    implements ChatProvider {

    constructor(

        private readonly client: GeminiClient

    ) {}

    async answer(

        question: string,

        context: string

    ): Promise<string> {

        console.log(
            "Usando Gemini"
        );

        const prompt = `
Responde utilizando EXCLUSIVAMENTE la información del contexto.

Si la respuesta no aparece en el contexto indica claramente que no está en el reglamento.

Contexto:

${context}

Pregunta:

${question}
`;

        return this.client.generateText(

            prompt

        );

    }

}