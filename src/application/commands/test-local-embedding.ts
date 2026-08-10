import "dotenv/config";

import { LOCAL_EMBEDDING } from "../../config/localEmbedding";

import { LocalEmbeddingClient } from "../../infrastructure/ai/providers/local/LocalEmbeddingClient";

async function main() {

    console.log("");
    console.log("────────────────────────────────────");
    console.log(" Local Embedding Test");
    console.log("────────────────────────────────────");
    console.log("");

    if (!LOCAL_EMBEDDING.enabled) {

        console.error(

            "LOCAL_EMBEDDING_ENABLED no está en \"true\" en tu .env."

        );

        process.exit(1);

    }

    console.log("Modelo:");
    console.log(LOCAL_EMBEDDING.model);
    console.log("");
    console.log(

        "Descargando/cargando el modelo (la primera vez puede " +
        "tardar un poco, se descargan unos ~90MB)..."

    );
    console.log("");

    const client = new LocalEmbeddingClient(LOCAL_EMBEDDING);

    const start = Date.now();

    const embedding =
        await client.generateEmbedding(

            "Los jugadores colocan sus poblados en las intersecciones del tablero."

        );

    const elapsed = Date.now() - start;

    console.log(`Embedding generado: ${embedding.length} dimensiones`);
    console.log(`Tiempo: ${elapsed} ms`);
    console.log("");

    const start2 = Date.now();

    await client.generateEmbedding("Segunda prueba, para medir el tiempo sin recarga del modelo.");

    console.log(`Segunda llamada (modelo ya cargado): ${Date.now() - start2} ms`);
    console.log("");

}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
