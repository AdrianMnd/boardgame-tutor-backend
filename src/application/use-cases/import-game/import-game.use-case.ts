import { GameValidator } from "../../../domain/game/services/game-validator.service";
import { ChunkGenerator } from "../../../infrastructure/importer/chunkGenerator/chunkGenerator";
import { EmbeddingGenerator } from "../../../infrastructure/importer/embeddingGenerator/embeddingGenerator";
import { KnowledgeWriter } from "../../../infrastructure/importer/knowledgeWriter/knowledgeWriter";
import { TextCleaner } from "../../../infrastructure/importer/textCleaner/textCleaner";
import type { IPDFExtractor } from "../../../shared/contracts/IPDFExtractor";
import { IImportLogger } from "../../logger/IImportLogger";

export class ImportGameUseCase {

    constructor(

    private readonly logger: IImportLogger,

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

        const start =
            Date.now();

        this.logger.header(gameId);

        this.logger.step(

            "1.Validando juego..."

        );

        const game =
            await this.validator.validate(gameId);

        this.logger.success(

            "Juego validado"

        );

        this.logger.step(

            "2.Extrayendo PDF..."

        );

        const document =
            await this.extractor.extract(
                game.paths.rulebook
            );

        this.logger.success(

            `${document.totalPages} páginas extraídas`

        );

        this.logger.step(

            "3.Limpiando texto..."

        );

        const cleaned =
            this.cleaner.clean(document);

        this.logger.success(

            "Texto limpio"

        );

        this.logger.step(

            "4.Generando chunks..."

        );

        const chunks =
            this.chunkGenerator.generate(
                game.metadata.id,
                cleaned
            );

        this.logger.success(

            `${chunks.length} chunks generados`

        );

        this.logger.step(

            "5.Generando embeddings..."

        );

        const embeddedChunks =

            await this.embeddingGenerator.generate(

                chunks,

                (

                    completed,

                    total

                ) => {

                    process.stdout.write(

                        `\r   ${completed}/${total}`

                    );

                }

            );

        process.stdout.write("\n");

        this.logger.success(

            "✔ Embeddings generados"

        );

        this.logger.step(

            "6.Guardando conocimiento..."

        );

        await this.knowledgeWriter.write(
            game,
            embeddedChunks
        );

        this.logger.success(

            "Conocimiento guardado"

        );

        this.logger.footer(

            Date.now() - start

        );
    }

}