import { ChatProvider } from "../../../domain/ai/chatProvider";

import type { ILLMClient } from "./ILLMClient";

/**
 * ChatProvider genérico: funciona con cualquier ILLMClient,
 * incluyendo FallbackLLMClient (que internamente prueba varios
 * proveedores en orden ante errores de cuota).
 */
export class LLMChatProvider
    implements ChatProvider {

    constructor(

        private readonly client: ILLMClient

    ) {}

    async answer(

        question: string,

        context: string

    ): Promise<string> {

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
