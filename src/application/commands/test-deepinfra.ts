import "dotenv/config";

import { DEEPINFRA } from "../../config/deepinfra";

import { DeepInfraClient } from "../../infrastructure/ai/providers/deepinfra/DeepInfraClient";

async function main() {

    console.log("");
    console.log("────────────────────────────────────");
    console.log(" DeepInfra Test");
    console.log("────────────────────────────────────");
    console.log("");

    if (!DEEPINFRA.apiKey) {

        console.error(
            "No se ha configurado DEEPINFRA_API_KEY en tu .env."
        );

        process.exit(1);

    }

    const client = new DeepInfraClient(DEEPINFRA);

    console.log("Modelo de chat:");
    console.log(DEEPINFRA.chatModel);
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
    console.log(DEEPINFRA.embeddingModel);
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
