"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMChatProvider = void 0;
/**
 * ChatProvider genérico: funciona con cualquier ILLMClient,
 * incluyendo FallbackLLMClient (que internamente prueba varios
 * proveedores en orden ante errores de cuota).
 */
class LLMChatProvider {
    client;
    constructor(client) {
        this.client = client;
    }
    async answer(question, context) {
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
        return this.client.generateText(prompt);
    }
}
exports.LLMChatProvider = LLMChatProvider;
