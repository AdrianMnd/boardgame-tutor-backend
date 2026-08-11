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

        return this.client.generateText(

            this.buildPrompt(question, context)

        );

    }

    async *answerStream(

        question: string,

        context: string

    ): AsyncIterable<string> {

        const prompt =

            this.buildPrompt(question, context);

        if (this.client.generateTextStream) {

            yield* this.client.generateTextStream(prompt);

            return;

        }

        // El cliente activo no soporta streaming: se entrega la
        // respuesta completa como un único fragmento, para que
        // quien consuma el stream no tenga que distinguir casos.
        const text = await this.client.generateText(prompt);

        if (text) {

            yield text;

        }

    }

    private buildPrompt(

        question: string,

        context: string

    ): string {

        return `
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

    }

}
