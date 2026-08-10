"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const deepinfra_1 = require("../../config/deepinfra");
const DeepInfraClient_1 = require("../../infrastructure/ai/providers/deepinfra/DeepInfraClient");
async function main() {
    console.log("");
    console.log("────────────────────────────────────");
    console.log(" DeepInfra Test");
    console.log("────────────────────────────────────");
    console.log("");
    if (!deepinfra_1.DEEPINFRA.apiKey) {
        console.error("No se ha configurado DEEPINFRA_API_KEY en tu .env.");
        process.exit(1);
    }
    const client = new DeepInfraClient_1.DeepInfraClient(deepinfra_1.DEEPINFRA);
    console.log("Modelo de chat:");
    console.log(deepinfra_1.DEEPINFRA.chatModel);
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
    console.log(deepinfra_1.DEEPINFRA.embeddingModel);
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
