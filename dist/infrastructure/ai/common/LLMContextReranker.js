"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMContextReranker = void 0;
class LLMContextReranker {
    client;
    constructor(client) {
        this.client = client;
    }
    async rerank(question, chunks) {
        if (chunks.length <= 1) {
            return chunks;
        }
        const prompt = this.buildPrompt(question, chunks);
        const response = await this.client.generateText(prompt);
        return this.parseResponse(response, chunks);
    }
    buildPrompt(question, chunks) {
        return `
        Eres un sistema de recuperación de información.

        Debes ordenar los fragmentos desde el MÁS útil hasta el MENOS útil para responder la pregunta.

        NO respondas la pregunta.

        NO expliques nada.

        Devuelve EXCLUSIVAMENTE un JSON válido.

        Formato:

        {
        "ids": [
            "chunk-id-1",
            "chunk-id-2"
        ]
        }

        Si todos los fragmentos son relevantes, devuélvelos todos ordenados.

        Pregunta:

        ${question}

        Fragmentos:

        ${chunks.map(chunk => `ID: ${chunk.id}

        ${chunk.text}

        `).join("\n-----------------\n")}

        `;
    }
    parseResponse(response, chunks) {
        const ids = this.extractIds(response);
        if (ids.length === 0) {
            return chunks;
        }
        const map = new Map(chunks.map(chunk => [
            chunk.id,
            chunk
        ]));
        const ordered = ids
            .map(id => map.get(id))
            .filter((chunk) => chunk !== undefined);
        return ordered.length > 0
            ? ordered
            : chunks;
    }
    extractIds(response) {
        try {
            const json = JSON.parse(this.clean(response));
            if (!Array.isArray(json.ids)) {
                return [];
            }
            return json.ids.filter((id) => typeof id === "string");
        }
        catch {
            return [];
        }
    }
    clean(response) {
        return response
            .replace(/^```json/i, "")
            .replace(/^```/i, "")
            .replace(/```$/, "")
            .trim();
    }
}
exports.LLMContextReranker = LLMContextReranker;
