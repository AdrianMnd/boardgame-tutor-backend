"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const gemini_1 = require("../../config/gemini");
const geminiClient_1 = require("../../infrastructure/ai/providers/gemini/geminiClient");
async function main() {
    const client = new geminiClient_1.GeminiClient(gemini_1.GEMINI);
    const embedding = await client.generateEmbedding("Hola mundo");
    console.log(`Embedding generado: ${embedding.length} dimensiones`);
}
main();
