import "dotenv/config";
import { NodeFileSystem } from "../../infrastructure/filesystem/NodeFileSystem";
import { GameValidator } from "../../domain/game/services/game-validator.service";
import { ChunkGenerator } from "../../infrastructure/importer/chunkGenerator/chunkGenerator";
import { EmbeddingGenerator } from "../../infrastructure/importer/embeddingGenerator/embeddingGenerator";
import { KnowledgeWriter } from "../../infrastructure/importer/knowledgeWriter/knowledgeWriter";
import { TextCleaner } from "../../infrastructure/importer/textCleaner/textCleaner";
import { ImportGameUseCase } from "../use-cases/import-game/import-game.use-case";
import { Pdf2JsonExtractor } from "../../infrastructure/importer/pdf/Pdf2JsonExtractor";
import { ConsoleImportLogger } from "../logger/ConsoleimportLogger";
import { GeminiEmbeddingProvider } from "../../infrastructure/ai/gemini/geminiEmbeddingProvider";
import { GEMINI } from "../../config/gemini";
import { GeminiClient } from "../../infrastructure/ai/gemini/geminiClient";
import { IMPORT_CONFIGURATION } from "../../config/import";
import { FileGameRepository } from "../../infrastructure/repositories/FileGameRepository";

async function main() {

        console.log("CWD:", process.cwd());


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

    logger.info(

            `Importando juego "${gameId}"...`

        );


    const fileSystem =
    new NodeFileSystem();

const repository =
    new FileGameRepository(
        fileSystem
    );

const validator =
    new GameValidator(
        repository
    );

    const extractor =
        new Pdf2JsonExtractor();

    const cleaner =
        new TextCleaner();

    const chunkGenerator =
        new ChunkGenerator();

    const geminiClient =
            new GeminiClient(
                GEMINI
);

    const embeddingProvider =
     new GeminiEmbeddingProvider(
        geminiClient
    ); 

    const embeddingGenerator =
        new EmbeddingGenerator(
            embeddingProvider,
            IMPORT_CONFIGURATION
        );

    const writer =
        new KnowledgeWriter(
            fileSystem,

            process.env.EMBEDDING_MODEL || "unknown",
        );

    const importer =
        new ImportGameUseCase(

            logger,

            validator,

            extractor,

            cleaner,

            chunkGenerator,

            embeddingGenerator,

            writer

        );

    await importer.execute(gameId);

    logger.info(

            "Importación finalizada con éxito."

        );

}

main().catch(error => {

    console.error("");

    console.error("Error durante la importación:");

    console.error("");

    console.error(error);

    console.error("");

    process.exit(1);

});