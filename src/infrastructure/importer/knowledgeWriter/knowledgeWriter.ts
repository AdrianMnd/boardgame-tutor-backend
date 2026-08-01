import type { IFileSystem } from "../../../shared/contracts/IFileSystem";

import type { EmbeddedChunk } from "../../../domain/importer/embeddedChunk";
import type { ValidatedGame } from "../../../domain/game/types/ValidatedGame";

import type { KnowledgeIndex } from "./knowledgeIndex";

export class KnowledgeWriter {

    constructor(

        private readonly fileSystem: IFileSystem,

        private readonly embeddingModel: string

    ) {}

    async write(

        game: ValidatedGame,

        chunks: EmbeddedChunk[]

    ): Promise<void> {

        const knowledge: KnowledgeIndex = {

            gameId: game.metadata.id,

            createdAt: new Date().toISOString(),

            totalChunks: chunks.length,

            embeddingModel: this.embeddingModel,

            chunks

        };

        await this.fileSystem.writeJson(

            game.paths.knowledge,

            knowledge

        );

    }

}