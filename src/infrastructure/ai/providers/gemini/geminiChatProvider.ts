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
Eres un experto en juegos de mesa.

Tu única fuente de información es el contexto proporcionado.

Normas:

- Responde únicamente utilizando la información del contexto.
- No inventes reglas.
- No utilices conocimientos propios.
- Si la respuesta no aparece claramente en el contexto, responde exactamente:

"No he encontrado esa información en el reglamento."

Contexto:

${context}

Pregunta:

${question}

Respuesta:
`;

        return this.client.generateText(

            prompt

        );

    }

}