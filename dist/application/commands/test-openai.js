"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const openai_1 = require("../../config/openai");
const OpenAIClient_1 = require("../../infrastructure/ai/providers/openai/OpenAIClient");
async function main() {
    console.log("");
    console.log("────────────────────────────────────");
    console.log(" OpenAI Test");
    console.log("────────────────────────────────────");
    console.log("");
    if (!openai_1.OPENAI.apiKey) {
        console.error("No se ha configurado OPENAI_API_KEY en tu .env.");
        process.exit(1);
    }
    const client = new OpenAIClient_1.OpenAIClient(openai_1.OPENAI);
    console.log("Modelo de chat:");
    console.log(openai_1.OPENAI.chatModel);
    console.log("");
    console.log("Enviando petición de chat...");
    console.log("");
    const response = await client.generateChat([
        { role: "user", content: "Responde únicamente con la palabra OK." }
    ]);
    console.log("Respuesta:");
    console.log(response);
    console.log("");
    console.log("Modelo de embeddings:");
    console.log(openai_1.OPENAI.embeddingModel);
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
