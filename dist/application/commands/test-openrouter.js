"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const OpenRouterClient_1 = require("../../infrastructure/ai/providers/openrouter/OpenRouterClient");
async function main() {
    console.log("");
    console.log("────────────────────────────────────");
    console.log(" OpenRouter Test");
    console.log("────────────────────────────────────");
    console.log("");
    const client = new OpenRouterClient_1.OpenRouterClient();
    console.log("Modelo:");
    console.log(client["configuration"].chatModel);
    console.log("");
    console.log("Enviando petición...");
    console.log("");
    const response = await client.generateChat([
        {
            role: "user",
            content: "Responde únicamente con la palabra OK."
        }
    ]);
    console.log("Respuesta:");
    console.log("");
    console.log(response);
    console.log("");
}
main().catch(error => {
    console.error(error);
    process.exit(1);
});
