import { ImportConfiguration } from "../../config/import";
import { KnowledgeIndex } from "../../infrastructure/importer/knowledgeWriter/knowledgeIndex";
import type { IFileSystem } from "../../shared/contracts/IFileSystem";

import type { ValidatedGame } from "../game/types/ValidatedGame";

import type { RetrievedChunk } from "./RetrievedChunk";
import { IKnowledgeRetriever } from "./IknowledgeRetriever";

import { SimilarityCalculator } from "./SimilarityCalculator";

export class SemanticRetriever
    implements IKnowledgeRetriever {

    private readonly similarity =
        new SimilarityCalculator();

    constructor(

        private readonly fileSystem: IFileSystem,

        private readonly configuration: ImportConfiguration

    ) {}

    async retrieve(

        game: ValidatedGame,

        _question: string,

        embedding: number[]

    ): Promise<RetrievedChunk[]> {

        const knowledge =
            await this.fileSystem.readJson<KnowledgeIndex>(
                game.paths.knowledge
            );

        const results =
            knowledge.chunks.map(chunk => ({

                id: chunk.id,

                gameId: chunk.gameId,

                page: chunk.page,

                text: chunk.text,

                score:
                    this.similarity.calculate(

                        embedding,

                        chunk.embedding

                    )

            }));

        return results

            .sort(

                (a, b) =>

                    b.score - a.score

            )

            .slice(

                0,

                this.configuration.maxRetrievedChunks

            );

    }

}