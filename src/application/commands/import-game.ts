import "dotenv/config";

import { NodeFileSystem } from "../../infrastructure/filesystem/NodeFileSystem";
import { ChunkGenerator } from "../../infrastructure/importer/chunkGenerator/chunkGenerator";
import { EmbeddingGenerator } from "../../infrastructure/importer/embeddingGenerator/embeddingGenerator";
import { TextCleaner } from "../../infrastructure/importer/textCleaner/textCleaner";
import { ImportGameUseCase } from "../use-cases/import-game/import-game.use-case";
import { Pdf2JsonExtractor } from "../../infrastructure/importer/pdf/Pdf2JsonExtractor";
import { ConsoleImportLogger } from "../logger/ConsoleimportLogger";
import { LLMEmbeddingProvider } from "../../infrastructure/ai/common/LLMEmbeddingProvider";
import { AIProviderFactory } from "../../infrastructure/ai/factory/AIProviderFactory";
import { IMPORT_CONFIGURATION } from "../../config/import";
import { loadDatabaseConfiguration } from "../../config/database";
import { loadStorageConfiguration } from "../../config/storage";
import { createPool } from "../../infrastructure/database/pool";
import { PostgresKnowledgeWriter } from "../../infrastructure/database/PostgresKnowledgeWriter";
import { B2FileStorage } from "../../infrastructure/storage/B2FileStorage";

async function main() {

    const gameId = process.argv[2];

    if (!gameId) {

        console.error("");
        console.error("Uso:");
        console.error("");
        console.error("npm run import <gameId>");
        console.error("");

        process.exit(1);

    }

    const logger =
        new ConsoleImportLogger();

    logger.info(`Importando juego "${gameId}"...`);

    const fileSystem =
        new NodeFileSystem();

    const extractor =
        new Pdf2JsonExtractor();

    const cleaner =
        new TextCleaner();

    const chunkGenerator =
        new ChunkGenerator();

    const embeddingClient =
        AIProviderFactory.createEmbeddingClient();

    const embeddingProvider =
        new LLMEmbeddingProvider(embeddingClient);

    const embeddingGenerator =
        new EmbeddingGenerator(

            embeddingProvider,

            IMPORT_CONFIGURATION

        );

    const pool =
        createPool(loadDatabaseConfiguration());

    const storage =
        new B2FileStorage(loadStorageConfiguration());

    const writer =
        new PostgresKnowledgeWriter(pool);

    const importer =
        new ImportGameUseCase(

            logger,

            extractor,

            cleaner,

            chunkGenerator,

            embeddingGenerator,

            fileSystem,

            storage,

            writer

        );

    const dbGameId =
        await importer.execute(gameId);

    // Comprobación final, totalmente independiente de todo lo
    // anterior — una consulta nueva, directa, a la tabla games.
    // No se fía de que el resto del proceso no haya lanzado
    // ningún error: lee la fila tal cual ha quedado en la base
    // de datos y la muestra tal cual, para que no quede ninguna
    // duda de si el juego está realmente ahí.
    const verification =

        await pool.query(

            "SELECT id, name, min_players, max_players, year FROM games WHERE id = $1",

            [dbGameId]

        );

    if (verification.rowCount === 0) {

        await pool.end();

        console.error("");
        console.error(

            `ERROR: la importación ha terminado sin lanzar ningún error, ` +
            `pero al volver a consultar la base de datos, "${dbGameId}" ` +
            `NO aparece en la tabla "games". Algo no cuadra — copia este ` +
            `mensaje y compártelo tal cual.`

        );
        console.error("");

        process.exit(1);

    }

    console.log("");
    console.log("Confirmado en la base de datos:");
    console.log(verification.rows[0]);
    console.log("");

    await pool.end();

    logger.info("Importación finalizada con éxito.");

}

main().catch(error => {

    console.error("");
    console.error("Error durante la importación:");
    console.error("");
    console.error(error);
    console.error("");

    process.exit(1);

});
