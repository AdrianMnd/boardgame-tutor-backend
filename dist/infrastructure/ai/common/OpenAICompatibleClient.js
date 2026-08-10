"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAICompatibleClient = void 0;
const retry_1 = require("./retry");
const isRetryableProviderError_1 = require("./isRetryableProviderError");
class OpenAICompatibleClient {
    configuration;
    /**
     * Por defecto, no se asume soporte de embeddings — las
     * subclases que sí lo soporten (ej. MistralClient) lo
     * sobreescriben a `true`.
     */
    supportsEmbeddings = false;
    supportsChat = true;
    constructor(configuration) {
        this.configuration = configuration;
    }
    async post(endpoint, body) {
        const response = await (0, retry_1.retry)(() => fetch(`${this.configuration.baseUrl}${endpoint}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.configuration.apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        }), {
            shouldRetry: error => !(0, isRetryableProviderError_1.isRetryableProviderError)(error)
        });
        if (!response.ok) {
            const errorBody = await response.text();
            const error = new Error(errorBody || response.statusText);
            error.status = response.status;
            throw error;
        }
        return response.json();
    }
    async generateText(prompt) {
        return this.generateChat([
            {
                role: "user",
                content: prompt
            }
        ]);
    }
    async generateChat(messages) {
        const response = await this.post("/chat/completions", {
            model: this.configuration.chatModel,
            messages
        });
        return (response.choices[0]?.message.content
            ??
                "");
    }
    async generateEmbedding(text) {
        throw new Error("Not implemented.");
    }
    /**
     * Implementación genérica del endpoint de embeddings
     * compatible con el formato de OpenAI (`POST /embeddings`).
     * Las subclases cuyo proveedor lo soporte pueden llamarla
     * directamente desde su propio `generateEmbedding`.
     */
    async generateEmbeddingViaOpenAiApi(text) {
        const response = await this.post("/embeddings", {
            model: this.configuration.embeddingModel,
            input: text
        });
        return response.data[0]?.embedding ?? [];
    }
    /**
     * Igual que generateEmbeddingViaOpenAiApi pero para varios
     * textos en una sola petición HTTP (el endpoint de OpenAI
     * y compatibles acepta un array en `input`). Reduce
     * drásticamente el número de peticiones — de una por chunk
     * a una por lote — que es lo que agota los límites de
     * peticiones-por-minuto de los planes gratuitos.
     */
    async generateEmbeddingBatchViaOpenAiApi(texts) {
        const response = await this.post("/embeddings", {
            model: this.configuration.embeddingModel,
            input: texts
        });
        // El array `data` no siempre viene en el mismo orden
        // que `texts` — se ordena explícitamente por `index`
        // para no desalinear los embeddings con sus chunks.
        return response.data
            .slice()
            .sort((a, b) => a.index - b.index)
            .map(item => item.embedding);
    }
}
exports.OpenAICompatibleClient = OpenAICompatibleClient;
