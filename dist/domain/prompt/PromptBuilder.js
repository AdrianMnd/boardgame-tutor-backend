"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptBuilder = void 0;
class PromptBuilder {
    build(metadata, question, chunks) {
        const context = chunks
            .map(chunk => [
            `Página ${chunk.page}`,
            chunk.text
        ].join("\n"))
            .join("\n\n--------------------\n\n");
        return `Eres un experto en el juego de mesa "${metadata.name}".

Debes responder utilizando únicamente la información proporcionada.

Si la respuesta no aparece en el contexto, responde exactamente:

"No he encontrado esa información en el reglamento."

No inventes reglas.

No hagas suposiciones.

Contexto:

${context}

Pregunta:

${question}

Respuesta:`;
    }
}
exports.PromptBuilder = PromptBuilder;
