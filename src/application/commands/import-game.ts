import { NodeFileSystem } from "../../infrastructure/filesystem/NodeFileSystem";
import { GameValidator } from "../../domain/game/services/game-validator.service";
import { ChunkGenerator } from "../../infrastructure/importer/chunkGenerator/chunkGenerator";
import { EmbeddingGenerator } from "../../infrastructure/importer/embeddingGenerator/embeddingGenerator";
import { KnowledgeWriter } from "../../infrastructure/importer/knowledgeWriter/knowledgeWriter";
import { TextCleaner } from "../../infrastructure/importer/textCleaner/textCleaner";
import { ImportGameUseCase } from "../use-cases/import-game/import-game.use-case";
import { FakeEmbeddingProvider } from "../../domain/embeddings/fakeEmbeddingProvider";
import { Pdf2JsonExtractor } from "../../infrastructure/importer/pdf/Pdf2JsonExtractor";

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

    console.log("");

    console.log(`Importando juego "${gameId}"...`);

    console.log("");

    const fileSystem =
        new NodeFileSystem();

    const validator =
        new GameValidator(fileSystem);

    const extractor =
        new Pdf2JsonExtractor();

    const cleaner =
        new TextCleaner();

    const chunkGenerator =
        new ChunkGenerator();

    const embeddingProvider =
        new FakeEmbeddingProvider();

    const embeddingGenerator =
        new EmbeddingGenerator(
            embeddingProvider
        );

    const writer =
        new KnowledgeWriter(
            fileSystem,

            process.env.EMBEDDING_MODEL || "unknown",
        );

    const importer =
        new ImportGameUseCase(

            validator,

            extractor,

            cleaner,

            chunkGenerator,

            embeddingGenerator,

            writer

        );

    await importer.execute(gameId);

    console.log("");

    console.log("Importación finalizada correctamente.");

    console.log("");

}

main().catch(error => {

    console.error("");

    console.error("Error durante la importación:");

    console.error("");

    console.error(error);

    console.error("");

    process.exit(1);

});