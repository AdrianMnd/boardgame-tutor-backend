import path from "node:path";

import { LocalDocumentDiscovery } from "../../../infrastructure/importer/LocalDocumentDiscovery";
import { ChunkGenerator } from "../../../infrastructure/importer/chunkGenerator/chunkGenerator";
import { EmbeddingGenerator } from "../../../infrastructure/importer/embeddingGenerator/embeddingGenerator";
import { EmbeddingCheckpoint } from "../../../infrastructure/importer/embeddingGenerator/EmbeddingCheckpoint";
import { TextCleaner } from "../../../infrastructure/importer/textCleaner/textCleaner";
import { PostgresKnowledgeWriter } from "../../../infrastructure/database/PostgresKnowledgeWriter";
import type { IPDFExtractor } from "../../../shared/contracts/IPDFExtractor";
import type { IFileSystem } from "../../../shared/contracts/IFileSystem";
import type { IFileStorage } from "../../../shared/contracts/IFileStorage";
import type { Chunk } from "../../../infrastructure/importer/chunkGenerator/chunk";
import type { GameMetadata } from "../../../domain/game/types/GameMetadata";
import { IImportLogger } from "../../logger/IImportLogger";

const CHECKPOINT_FILENAME = "embeddings-checkpoint.json";

export class ImportGameUseCase {

    private readonly localDiscovery: LocalDocumentDiscovery;

    constructor(

        private readonly logger: IImportLogger,

        private readonly extractor: IPDFExtractor,

        private readonly cleaner: TextCleaner,

        private readonly chunkGenerator: ChunkGenerator,

        private readonly embeddingGenerator: EmbeddingGenerator,

        private readonly fileSystem: IFileSystem,

        private readonly storage: IFileStorage,

        private readonly writer: PostgresKnowledgeWriter

    ) {

        this.localDiscovery =

            new LocalDocumentDiscovery(

                fileSystem

            );

    }

    async execute(

        gameId: string

    ): Promise<void> {

        const start =
            Date.now();

        this.logger.header(gameId);

        const root =
            path.resolve("games", gameId);

        const metadata =
            await this.readMetadata(root);

        const sourceDir =
            path.join(root, "source");

        this.logger.step("1.Detectando documentos locales...");

        const localDocuments =

            await this.localDiscovery.discover(

                sourceDir

            );

        if (localDocuments.length === 0) {

            throw new Error(

                `No se ha encontrado ningún PDF en ${sourceDir} — ` +

                "coloca al menos un archivo .pdf ahí antes de importar."

            );

        }

        this.logger.success(

            localDocuments.length === 1

                ? "1 documento detectado"

                : `${localDocuments.length} documentos detectados`

        );

        this.logger.step("2-4.Extrayendo, limpiando y dividiendo en chunks...");

        const chunks: Chunk[] = [];

        for (const document of localDocuments) {

            const documentPath =

                path.join(sourceDir, document.filename);

            const extracted =
                await this.extractor.extract(documentPath);

            const cleaned =
                this.cleaner.clean(extracted);

            const documentChunks =

                this.chunkGenerator.generate(

                    gameId,

                    document.id,

                    cleaned

                );

            chunks.push(...documentChunks);

            this.logger.info(

                `   ${document.name}: ${extracted.totalPages} páginas, ` +

                `${documentChunks.length} chunks`

            );

        }

        this.logger.success(`${chunks.length} chunks generados en total`);

        this.logger.step("5.Generando embeddings...");

        const checkpoint =

            new EmbeddingCheckpoint(

                this.fileSystem,

                path.join(root, "generated", CHECKPOINT_FILENAME)

            );

        const alreadyEmbedded =
            await checkpoint.load();

        if (alreadyEmbedded.size > 0) {

            this.logger.info(

                `   Reanudando desde un intento anterior: ` +
                `${alreadyEmbedded.size}/${chunks.length} chunks ya tenían embedding.`

            );

        }

        let embeddedChunks;

        try {

            embeddedChunks =

                await this.embeddingGenerator.generate(

                    chunks,

                    (completed, total) => {

                        process.stdout.write(`\r   ${completed}/${total}`);

                    },

                    alreadyEmbedded,

                    results => checkpoint.save(results)

                );

        }
        catch (error) {

            this.logger.info(

                "\n   Se ha guardado el progreso conseguido hasta el fallo. " +
                `Vuelve a ejecutar "npm run import ${gameId}" más tarde ` +
                "para continuar donde se ha quedado."

            );

            throw error;

        }

        process.stdout.write("\n");

        this.logger.success("✔ Embeddings generados");

        this.logger.step("6.Subiendo archivos al almacenamiento...");

        const documentsToWrite = [];

        for (const document of localDocuments) {

            const documentPath =
                path.join(sourceDir, document.filename);

            const content =
                await this.fileSystem.readBuffer(documentPath);

            const storagePath =
                `${gameId}/source/${document.filename}`;

            await this.storage.upload(

                storagePath,

                content,

                "application/pdf"

            );

            documentsToWrite.push({

                id: document.id,

                name: document.name,

                storagePath

            });

        }

        const coverPath =
            await this.uploadCoverIfPresent(gameId, root);

        this.logger.success("Archivos subidos");

        this.logger.step("7.Guardando en la base de datos...");

        await this.writer.upsertGame(metadata, coverPath);

        for (const document of documentsToWrite) {

            await this.writer.upsertDocument(gameId, document);

        }

        await this.writer.replaceChunks(gameId, embeddedChunks);

        await checkpoint.clear();

        this.logger.success("Guardado en la base de datos");

        this.logger.footer(Date.now() - start);

    }

    private async readMetadata(

        root: string

    ): Promise<GameMetadata> {

        const metadataPath =
            path.join(root, "metadata.json");

        if (!(await this.fileSystem.exists(metadataPath))) {

            throw new Error(

                `No se ha encontrado ${metadataPath} — crea la carpeta ` +
                `games/<id>/ con su metadata.json antes de importar.`

            );

        }

        return this.fileSystem.readJson<GameMetadata>(metadataPath);

    }

    private async uploadCoverIfPresent(

        gameId: string,

        root: string

    ): Promise<string | undefined> {

        const coverPath =
            path.join(root, "assets", "cover.png");

        if (!(await this.fileSystem.exists(coverPath))) {

            return undefined;

        }

        const content =
            await this.fileSystem.readBuffer(coverPath);

        const storagePath =
            `${gameId}/assets/cover.png`;

        await this.storage.upload(storagePath, content, "image/png");

        return storagePath;

    }

}
