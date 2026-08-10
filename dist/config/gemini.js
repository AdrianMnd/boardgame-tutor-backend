"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GEMINI = void 0;
exports.GEMINI = {
    apiKey: process.env.GEMINI_API_KEY ?? "",
    embeddingModel: process.env.GEMINI_EMBEDDING_MODEL
        ?? "text-embedding-004",
    chatModel: process.env.GEMINI_CHAT_MODEL
        ?? "gemini-2.5-flash",
    apiVersion: process.env.GEMINI_API_VERSION
        ?? "v1beta"
};
// Nota: ya no se lanza un error si falta la API key.
// Con el sistema de fallback entre proveedores, un proveedor
// sin configurar simplemente se omite de la cadena — solo
// falla si NINGÚN proveedor tiene credenciales válidas
// (ver AIProviderFactory).
