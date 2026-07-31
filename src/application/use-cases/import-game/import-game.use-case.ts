import { GameValidator } from "../../../domain/game/services/game-validator.service";
import { ChunkGenerator } from "../../../infrastructure/importer/chunkGenerator/chunkGenerator";
import { EmbeddingGenerator } from "../../../infrastructure/importer/embeddingGenerator/embeddingGenerator";
import { KnowledgeWriter } from "../../../infrastructure/importer/knowledgeWriter/knowledgeWriter";
import { TextCleaner } from "../../../infrastructure/importer/textCleaner/textCleaner";
import type { IPDFExtractor } from "../../../shared/contracts/IPDFExtractor";

export class ImportGameUseCase {

    constructor(

        private readonly validator: GameValidator,

        private readonly extractor: IPDFExtractor,

        private readonly cleaner: TextCleaner,

        private readonly chunkGenerator: ChunkGenerator,

        private readonly embeddingGenerator: EmbeddingGenerator,

        private readonly knowledgeWriter: KnowledgeWriter

    ) {}

    async execute(
        gameId: string
    ): Promise<void> {

        console.log("");
        console.log("==================================");
        console.log(`Importando juego: ${gameId}`);
        console.log("==================================");

        console.log("1. Validando juego...");

        const game =
            await this.validator.validate(gameId);

        console.log("✔ Juego validado");

        console.log("2. Extrayendo PDF...");

        const document =
            await this.extractor.extract(
                game.paths.rulebook
            );

        console.log(
            `✔ ${document.totalPages} páginas extraídas`
        );

        console.log("3. Limpiando texto...");

        const cleaned =
            this.cleaner.clean(document);

        console.log("✔ Texto limpio");

        console.log("4. Generando chunks...");

        const chunks =
            this.chunkGenerator.generate(
                game.metadata.id,
                cleaned
            );

        console.log(
            `✔ ${chunks.length} chunks generados`
        );

        console.log("5. Generando embeddings...");

        const knowledge =
            await this.embeddingGenerator.generate(
                chunks
            );

        console.log("✔ Embeddings generados");

        console.log("6. Guardando conocimiento...");

        await this.knowledgeWriter.write(
            game.metadata.id,
            knowledge
        );

        console.log("✔ Importación finalizada");
    }

}