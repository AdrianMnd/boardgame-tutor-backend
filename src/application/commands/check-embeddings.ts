import "dotenv/config";
import path from "node:path";
import { NodeFileSystem } from "../../infrastructure/filesystem/NodeFileSystem";

/**
 * Recorre todos los juegos importados y comprueba que cada
 * chunk tiene un embedding válido (no ausente, no vacío).
 * Útil para detectar juegos afectados por fallos silenciosos
 * del proveedor de IA durante el import (ej. lotes demasiado
 * grandes devolviendo menos resultados de los pedidos).
 *
 * Uso: npm run check:embeddings
 */
async function main() {

    const fileSystem = new NodeFileSystem();
    const gamesRoot = path.resolve("games");

    const gameIds = await fileSystem.listDirectories(gamesRoot);

    console.log("");
    console.log("Comprobando embeddings de todos los juegos importados...");
    console.log("");

    let anyProblem = false;

    for (const gameId of gameIds) {

        const knowledgePath =
            path.join(gamesRoot, gameId, "generated", "knowledge.json");

        if (!(await fileSystem.exists(knowledgePath))) {
            console.log(`  ${gameId}: no importado (sin knowledge.json)`);
            continue;
        }

        try {

            const knowledge =
                await fileSystem.readJson<{
                    chunks: { id: string; embedding?: number[] }[];
                }>(knowledgePath);

            const broken =
                knowledge.chunks.filter(
                    chunk =>
                        !Array.isArray(chunk.embedding) ||
                        chunk.embedding.length === 0
                );

            const dimensions =
                new Set(
                    knowledge.chunks
                        .filter(c => Array.isArray(c.embedding))
                        .map(c => c.embedding!.length)
                );

            if (broken.length > 0) {

                anyProblem = true;

                console.log(

                    `  ${gameId}: ⚠ ${broken.length}/${knowledge.chunks.length} ` +
                    `chunks SIN embedding — hay que reimportarlo`

                );

            }
            else if (dimensions.size > 1) {

                anyProblem = true;

                console.log(

                    `  ${gameId}: ⚠ dimensiones mezcladas (${[...dimensions].join(", ")}) ` +
                    `— hay que reimportarlo`

                );

            }
            else {

                console.log(

                    `  ${gameId}: ✔ ${knowledge.chunks.length} chunks, ` +
                    `${[...dimensions][0] ?? "?"} dimensiones, todo correcto`

                );

            }

        }
        catch (error) {

            anyProblem = true;

            console.log(`  ${gameId}: ⚠ error leyendo knowledge.json (${error})`);

        }

    }

    console.log("");

    if (anyProblem) {

        console.log("Hay juegos con problemas — reimpórtalos con: npm run import <gameId>");
        process.exit(1);

    }
    else {

        console.log("Todos los juegos están correctos.");

    }

}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
