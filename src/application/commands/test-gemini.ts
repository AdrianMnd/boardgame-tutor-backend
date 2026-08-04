import "dotenv/config";

import { GEMINI } from "../../config/gemini";

import { GeminiClient } from "../../infrastructure/ai/providers/gemini/geminiClient";

async function main() {

    const client =

        new GeminiClient(

            GEMINI

        );

    const embedding =

        await client.generateEmbedding(

            "Hola mundo"

        );

    console.log(
    `Embedding generado: ${embedding.length} dimensiones`
);

}

main();