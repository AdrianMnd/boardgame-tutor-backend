"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mistral_1 = require("../../config/mistral");
const MistralClient_1 = require("../../infrastructure/ai/providers/mistral/MistralClient");
async function main() {
    console.log("");
    console.log("────────────────────────────────────");
    console.log(" Mistral Test");
    console.log("────────────────────────────────────");
    console.log("");
    if (!mistral_1.MISTRAL.apiKey) {
        console.error("No se ha configurado MISTRAL_API_KEY en tu .env.");
        process.exit(1);
    }
    const client = new MistralClient_1.MistralClient(mistral_1.MISTRAL);
    console.log("Modelo de chat:");
    console.log(mistral_1.MISTRAL.chatModel);
    console.log("");
    console.log("Enviando petición de chat...");
    console.log("");
    const response = await client.generateChat([
        {
            role: "user",
            content: "Responde únicamente con la palabra OK."
        }
    ]);
    console.log("Respuesta:");
    console.log(response);
    console.log("");
    console.log("Modelo de embeddings:");
    console.log(mistral_1.MISTRAL.embeddingModel);
    console.log("");
    console.log("Generando embedding de prueba...");
    console.log("");
    const embedding = await client.generateEmbedding("Hola mundo");
    console.log(`Embedding generado: ${embedding.length} dimensiones`);
    console.log("");
}
main().catch(error => {
    console.error(error);
    process.exit(1);
});
