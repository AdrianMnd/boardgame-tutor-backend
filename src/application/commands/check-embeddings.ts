import "dotenv/config";

import path from "node:path";

import { NodeFileSystem } from "../../infrastructure/filesystem/NodeFileSystem";
import { createPool } from "../../infrastructure/database/pool";
import { loadDatabaseConfiguration } from "../../config/database";

/**
 * Diagnóstico del estado de los juegos en Postgres.
 *
 * Con la migración a base de datos, las dos comprobaciones que
 * hacía esta herramienta originalmente (embeddings ausentes,
 * dimensiones mezcladas) ya no pueden pasar en absoluto — la
 * columna `chunks.embedding` es `VECTOR(3072) NOT NULL`, así
 * que Postgres las rechaza directamente al insertar, no hace
 * falta comprobarlas después.
 *
 * Lo que sí sigue siendo útil comprobar:
 * - Juegos que existen en games/ local pero aún no se han
 *   migrado/importado a la base de datos (recordatorio).
 * - Juegos en la base de datos con 0 documentos o 0 chunks —
 *   un estado roto que sí puede pasar (ej. una migración
 *   interrumpida a mitad).
 *
 * Uso: npm run check:embeddings
 */
async function main() {

    const pool =
        createPool(loadDatabaseConfiguration());

    console.log("");
    console.log("Comprobando el estado de los juegos en la base de datos...");
    console.log("");

    const games =
        await pool.query<{

            id: string;

            document_count: string;

            chunk_count: string;

        }>(

            `
            SELECT
                g.id,
                COUNT(DISTINCT d.id) AS document_count,
                COUNT(c.id) AS chunk_count
            FROM games g
            LEFT JOIN documents d ON d.game_id = g.id
            LEFT JOIN chunks c ON c.game_id = g.id
            GROUP BY g.id
            ORDER BY g.id
            `

        );

    let anyProblem = false;

    for (const game of games.rows) {

        const documentCount = Number(game.document_count);

        const chunkCount = Number(game.chunk_count);

        if (documentCount === 0 || chunkCount === 0) {

            anyProblem = true;

            console.log(

                `  ${game.id}: ⚠ ${documentCount} documento(s), ` +
                `${chunkCount} chunk(s) — está en la base de datos pero ` +
                "sin contenido real. Reimpórtalo con " +
                `"npm run import ${game.id}" o migra sus datos con ` +
                `"npm run migrate-to-db -- --game=${game.id}".`

            );

        }
        else {

            console.log(

                `  ${game.id}: ✔ ${documentCount} documento(s), ${chunkCount} chunks`

            );

        }

    }

    // Juegos que existen en games/ local pero no en la base de
    // datos todavía — un recordatorio, no necesariamente un
    // error (puede que aún no hayas migrado/importado ese
    // juego).
    const fileSystem = new NodeFileSystem();

    const gamesRoot = path.resolve("games");

    if (await fileSystem.exists(gamesRoot)) {

        const localGameIds =
            await fileSystem.listDirectories(gamesRoot);

        const dbGameIds =
            new Set(games.rows.map(game => game.id));

        const pendingGameIds =
            localGameIds.filter(id => !dbGameIds.has(id));

        if (pendingGameIds.length > 0) {

            console.log("");

            console.log(

                "Juegos en games/ local que aún no están en la base " +
                "de datos:"

            );

            for (const gameId of pendingGameIds) {

                console.log(`  - ${gameId}`);

            }

        }

    }

    console.log("");

    await pool.end();

    if (anyProblem) {

        console.log(

            "Hay juegos con problemas — revisa los avisos de arriba."

        );

        process.exit(1);

    }
    else {

        console.log("Todos los juegos de la base de datos están correctos.");

    }

}

main().catch(error => {

    console.error(error);

    process.exit(1);

});
