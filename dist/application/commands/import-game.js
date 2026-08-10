"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const NodeFileSystem_1 = require("../../infrastructure/filesystem/NodeFileSystem");
const game_validator_service_1 = require("../../domain/game/services/game-validator.service");
const chunkGenerator_1 = require("../../infrastructure/importer/chunkGenerator/chunkGenerator");
const embeddingGenerator_1 = require("../../infrastructure/importer/embeddingGenerator/embeddingGenerator");
const knowledgeWriter_1 = require("../../infrastructure/importer/knowledgeWriter/knowledgeWriter");
const textCleaner_1 = require("../../infrastructure/importer/textCleaner/textCleaner");
const import_game_use_case_1 = require("../use-cases/import-game/import-game.use-case");
const Pdf2JsonExtractor_1 = require("../../infrastructure/importer/pdf/Pdf2JsonExtractor");
const ConsoleimportLogger_1 = require("../logger/ConsoleimportLogger");
const LLMEmbeddingProvider_1 = require("../../infrastructure/ai/common/LLMEmbeddingProvider");
const AIProviderFactory_1 = require("../../infrastructure/ai/factory/AIProviderFactory");
const import_1 = require("../../config/import");
const FileGameRepository_1 = require("../../infrastructure/repositories/FileGameRepository");
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
    const logger = new ConsoleimportLogger_1.ConsoleImportLogger();
    logger.info(`Importando juego "${gameId}"...`);
    const fileSystem = new NodeFileSystem_1.NodeFileSystem();
    const repository = new FileGameRepository_1.FileGameRepository(fileSystem);
    const validator = new game_validator_service_1.GameValidator(repository);
    const extractor = new Pdf2JsonExtractor_1.Pdf2JsonExtractor();
    const cleaner = new textCleaner_1.TextCleaner();
    const chunkGenerator = new chunkGenerator_1.ChunkGenerator();
    const fallbackClient = AIProviderFactory_1.AIProviderFactory.createFallbackClient();
    const embeddingProvider = new LLMEmbeddingProvider_1.LLMEmbeddingProvider(fallbackClient);
    const embeddingGenerator = new embeddingGenerator_1.EmbeddingGenerator(embeddingProvider, import_1.IMPORT_CONFIGURATION);
    const writer = new knowledgeWriter_1.KnowledgeWriter(fileSystem, process.env.EMBEDDING_MODEL || "unknown");
    const importer = new import_game_use_case_1.ImportGameUseCase(logger, validator, extractor, cleaner, chunkGenerator, embeddingGenerator, writer, fileSystem);
    await importer.execute(gameId);
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
