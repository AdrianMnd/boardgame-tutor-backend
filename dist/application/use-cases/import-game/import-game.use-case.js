"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportGameUseCase = void 0;
const node_path_1 = __importDefault(require("node:path"));
const EmbeddingCheckpoint_1 = require("../../../infrastructure/importer/embeddingGenerator/EmbeddingCheckpoint");
const CHECKPOINT_FILENAME = "embeddings-checkpoint.json";
class ImportGameUseCase {
    logger;
    validator;
    extractor;
    cleaner;
    chunkGenerator;
    embeddingGenerator;
    knowledgeWriter;
    fileSystem;
    constructor(logger, validator, extractor, cleaner, chunkGenerator, embeddingGenerator, knowledgeWriter, fileSystem) {
        this.logger = logger;
        this.validator = validator;
        this.extractor = extractor;
        this.cleaner = cleaner;
        this.chunkGenerator = chunkGenerator;
        this.embeddingGenerator = embeddingGenerator;
        this.knowledgeWriter = knowledgeWriter;
        this.fileSystem = fileSystem;
    }
    async execute(gameId) {
        const start = Date.now();
        this.logger.header(gameId);
        this.logger.step("1.Validando juego...");
        const game = await this.validator.validate(gameId);
        this.logger.success("Juego validado");
        this.logger.step("2.Extrayendo PDF...");
        const document = await this.extractor.extract(game.paths.rulebook);
        this.logger.success(`${document.totalPages} páginas extraídas`);
        this.logger.step("3.Limpiando texto...");
        const cleaned = this.cleaner.clean(document);
        this.logger.success("Texto limpio");
        this.logger.step("4.Generando chunks...");
        const chunks = this.chunkGenerator.generate(game.metadata.id, cleaned);
        this.logger.success(`${chunks.length} chunks generados`);
        this.logger.step("5.Generando embeddings...");
        const checkpoint = new EmbeddingCheckpoint_1.EmbeddingCheckpoint(this.fileSystem, node_path_1.default.join(game.paths.generated, CHECKPOINT_FILENAME));
        const alreadyEmbedded = await checkpoint.load();
        if (alreadyEmbedded.size > 0) {
            this.logger.info(`   Reanudando desde un intento anterior: ` +
                `${alreadyEmbedded.size}/${chunks.length} chunks ya tenían embedding.`);
        }
        let embeddedChunks;
        try {
            embeddedChunks =
                await this.embeddingGenerator.generate(chunks, (completed, total) => {
                    process.stdout.write(`\r   ${completed}/${total}`);
                }, alreadyEmbedded, results => checkpoint.save(results));
        }
        catch (error) {
            this.logger.info("\n   Se ha guardado el progreso conseguido hasta el fallo. " +
                `Vuelve a ejecutar "npm run import ${gameId}" ` +
                "más tarde para continuar donde se ha quedado.");
            throw error;
        }
        process.stdout.write("\n");
        this.logger.success("✔ Embeddings generados");
        await this.warnIfDimensionMismatch(game.paths.generated, embeddedChunks);
        this.logger.step("6.Guardando conocimiento...");
        await this.knowledgeWriter.write(game, embeddedChunks);
        // Importación completada con éxito: el checkpoint ya
        // no hace falta, todo está en knowledge.json.
        await checkpoint.clear();
        this.logger.success("Conocimiento guardado");
        this.logger.footer(Date.now() - start);
    }
    /**
     * Comprueba que la dimensión de los embeddings recién
     * generados coincide con la de otro juego ya importado.
     * Si no coincide, avisa de forma bien visible en vez de
     * dejar que el fallo aparezca más tarde como un 500 al
     * preguntar en producción (el proveedor de embeddings usado
     * al importar debe ser siempre el mismo que usa el servidor
     * para las preguntas en vivo).
     */
    async warnIfDimensionMismatch(generatedPath, embeddedChunks) {
        const currentDimension = embeddedChunks[0]?.embedding.length;
        if (!currentDimension) {
            return;
        }
        const gamesRoot = node_path_1.default.resolve(generatedPath, "..", "..");
        const currentGameId = node_path_1.default.basename(node_path_1.default.dirname(node_path_1.default.resolve(generatedPath)));
        let otherGameIds;
        try {
            otherGameIds =
                await this.fileSystem.listDirectories(gamesRoot);
        }
        catch {
            return;
        }
        for (const otherId of otherGameIds) {
            if (otherId === currentGameId) {
                continue;
            }
            const otherKnowledgePath = node_path_1.default.join(gamesRoot, otherId, "generated", "knowledge.json");
            if (!(await this.fileSystem.exists(otherKnowledgePath))) {
                continue;
            }
            try {
                const otherKnowledge = await this.fileSystem.readJson(otherKnowledgePath);
                const otherDimension = otherKnowledge.chunks[0]?.embedding.length;
                if (otherDimension &&
                    otherDimension !== currentDimension) {
                    this.logger.warning(`\n⚠ Este juego se ha importado con embeddings de ` +
                        `${currentDimension} dimensiones, pero "${otherId}" ` +
                        `tiene ${otherDimension}. Si tu servidor en producción ` +
                        `usa un proveedor distinto al que acabas de usar aquí, ` +
                        `las preguntas sobre este juego fallarán con un error ` +
                        `500. Revisa que AI_PROVIDER_ORDER / ` +
                        `LOCAL_EMBEDDING_ENABLED sean iguales en tu entorno ` +
                        `local y en el servidor desplegado.\n`);
                    return;
                }
            }
            catch {
                continue;
            }
        }
    }
}
exports.ImportGameUseCase = ImportGameUseCase;
