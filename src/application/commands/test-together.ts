import "dotenv/config";

import { TOGETHER } from "../../config/together";

import { TogetherClient } from "../../infrastructure/ai/providers/together/TogetherClient";

async function main() {

    console.log("");
    console.log("────────────────────────────────────");
    console.log(" Together AI Test");
    console.log("────────────────────────────────────");
    console.log("");

    if (!TOGETHER.apiKey) {

        console.error(
            "No se ha configurado TOGETHER_API_KEY en tu .env."
        );

        process.exit(1);

    }

    const client = new TogetherClient(TOGETHER);

    console.log("Modelo de chat:");
    console.log(TOGETHER.chatModel);
    console.log("");
    console.log("Enviando petición de chat...");
    console.log("");

    const response =
        await client.generateChat([
            { role: "user", content: "Responde únicamente con la palabra OK." }
        ]);

    console.log("Respuesta:");
    console.log(response);
    console.log("");

    console.log("Modelo de embeddings:");
    console.log(TOGETHER.embeddingModel);
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
