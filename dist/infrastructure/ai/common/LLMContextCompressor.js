"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMContextCompressor = void 0;
class LLMContextCompressor {
    client;
    constructor(client) {
        this.client = client;
    }
    async compress(question, chunks) {
        if (chunks.length === 0) {
            return [];
        }
        const prompt = this.buildPrompt(question, chunks);
        const response = await this.client.generateText(prompt);
        return this.parseResponse(response, chunks);
    }
    buildPrompt(question, chunks) {
        return `
        Eres un sistema de compresión de contexto para RAG.

        Para cada fragmento elimina únicamente la información irrelevante para responder la pregunta.

        NO inventes información.

        NO resumas demasiado.

        Conserva literalmente las frases importantes.

        Devuelve EXCLUSIVAMENTE un JSON válido.

        Formato:

        {
        "chunks": [
            {
            "id": "chunk-id",
            "text": "texto"
            }
        ]
        }

        Pregunta:

        ${question}

        Fragmentos:

        ${chunks.map(chunk => `ID: ${chunk.id}

        ${chunk.text}

        `).join("\n-----------------\n")}

        `;
    }
    parseResponse(response, chunks) {
        const cleaned = this.cleanResponse(response);
        try {
            const json = JSON.parse(cleaned);
            if (!Array.isArray(json.chunks)) {
                return chunks;
            }
            const compressed = new Map(json.chunks.map(item => [
                item.id,
                item.text
            ]));
            return chunks.map(chunk => ({
                ...chunk,
                text: compressed.get(chunk.id) ??
                    chunk.text
            }));
        }
        catch {
            return chunks;
        }
    }
    cleanResponse(response) {
        return response
            .replace(/^```json/i, "")
            .replace(/^```/i, "")
            .replace(/```$/, "")
            .trim();
    }
}
exports.LLMContextCompressor = LLMContextCompressor;
