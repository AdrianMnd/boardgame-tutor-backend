import { GameValidator } from "../../../domain/game/services/game-validator.service";
import { ChunkGenerator } from "../../../infrastructure/importer/chunkGenerator/chunkGenerator";
import { EmbeddingGenerator } from "../../../infrastructure/importer/embeddingGenerator/embeddingGenerator";
import { KnowledgeWriter } from "../../../infrastructure/importer/knowledgeWriter/knowledgeWriter";
import { PdfJsExtractor } from "../../../infrastructure/importer/pdfjs/pdfjs-extractor";
import { TextCleaner } from "../../../infrastructure/importer/textCleaner/textCleaner";


export class ImportGameUseCase {

    constructor(

        private readonly validator: GameValidator,

        private readonly extractor: PdfJsExtractor,

        private readonly cleaner: TextCleaner,

        private readonly chunkGenerator: ChunkGenerator,

        private readonly embeddingGenerator: EmbeddingGenerator,

        private readonly knowledgeWriter: KnowledgeWriter

    ) { }

    async execute(
        gameId: string
    ): Promise<void> {

        // 1. Validar el juego
        const game =
            await this.validator.validate(gameId);

        // 2. Extraer el PDF
        const extractedDocument =
            await this.extractor.extract(
                game.paths.rulebook
            );

        // 3. Limpiar el texto
        const cleanedDocument =
            this.cleaner.clean(
                extractedDocument
            );

        // 4. Generar chunks
        const chunks =
            this.chunkGenerator.generate(
                game.metadata.id,
                cleanedDocument
            );

        // 5. Generar embeddings
        const embeddedChunks =
            await this.embeddingGenerator.generate(
                chunks
            );

        // 6. Guardar el índice
        await this.knowledgeWriter.write(
            game.metadata.id,
            embeddedChunks
        );

    }

}