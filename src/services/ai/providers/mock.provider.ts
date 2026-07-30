import type { AIProvider } from "./ai-provider";

export class MockProvider
    implements AIProvider {

    async ask(
        question: string,
        context: string
    ): Promise<string> {

        return `
=== RESPUESTA MOCK ===

Pregunta:

${question}

-------------------------

Contexto encontrado:

${context}

-------------------------

Aquí respondería la IA real.
`;

    }

}