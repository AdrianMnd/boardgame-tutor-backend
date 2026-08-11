"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FallbackLLMClient = void 0;
const isRetryableProviderError_1 = require("./isRetryableProviderError");
/**
 * Envuelve varios clientes de IA y los prueba en orden.
 *
 * Si un proveedor falla por cuota agotada / rate limit /
 * no disponible temporalmente, se pasa automáticamente al
 * siguiente de la lista. Cualquier otro tipo de error
 * (parámetros inválidos, bug real, etc.) se propaga
 * inmediatamente sin intentar los demás proveedores, para no
 * ocultar fallos que no tienen que ver con la cuota.
 *
 * Antes de intentar una operación, se filtran los clientes que
 * no la soportan (ej. un modelo local solo-embeddings no se
 * intenta nunca para generateChat, y OpenRouter no se intenta
 * nunca para embeddings) — la capacidad se declara explícitamente
 * vía supportsChat/supportsEmbeddings, no se infiere de si el
 * método existe.
 */
class FallbackLLMClient {
    clients;
    supportsEmbeddings;
    supportsChat;
    constructor(clients) {
        this.clients = clients;
        if (clients.length === 0) {
            throw new Error("FallbackLLMClient necesita al menos un proveedor de IA configurado.");
        }
        this.supportsEmbeddings =
            clients.some(entry => entry.client.supportsEmbeddings);
        this.supportsChat =
            clients.some(entry => entry.client.supportsChat);
    }
    async generateText(prompt) {
        return this.run("generateText", client => client.supportsChat, client => client.generateText(prompt));
    }
    async generateChat(messages) {
        return this.run("generateChat", client => client.supportsChat, client => client.generateChat(messages));
    }
    async generateEmbedding(text) {
        return this.run("embeddings", client => client.supportsEmbeddings, client => client.generateEmbedding(text));
    }
    /**
     * Igual que generateEmbedding pero para varios textos de
     * una vez. Si el proveedor activo soporta lotes, se manda
     * todo en una sola petición HTTP. Si no, se generan uno a
     * uno pero SIEMPRE con el mismo proveedor dentro del mismo
     * lote — nunca se reparte un lote entre distintos
     * proveedores, para no acabar con embeddings de
     * dimensiones distintas mezclados en el mismo resultado.
     */
    async generateEmbeddingBatch(texts) {
        return this.run("embeddings en lote", client => client.supportsEmbeddings, async (client) => {
            if (client.generateEmbeddingBatch) {
                return client.generateEmbeddingBatch(texts);
            }
            const results = [];
            for (const text of texts) {
                results.push(await client.generateEmbedding(text));
            }
            return results;
        });
    }
    async run(operationName, supports, operation) {
        const capableClients = this.clients.filter(entry => supports(entry.client));
        if (capableClients.length === 0) {
            throw new Error(`Ningún proveedor de IA configurado soporta "${operationName}". ` +
                "Proveedores disponibles: " +
                this.clients.map(entry => entry.name).join(", ") +
                ".");
        }
        let lastError;
        for (const { name, client } of capableClients) {
            try {
                return await operation(client);
            }
            catch (error) {
                lastError = error;
                if (!(0, isRetryableProviderError_1.isRetryableProviderError)(error)) {
                    throw error;
                }
                console.warn(`[IA] ${name} no disponible para ${operationName} (cuota/rate-limit). Probando siguiente proveedor...`);
            }
        }
        throw lastError;
    }
}
exports.FallbackLLMClient = FallbackLLMClient;
