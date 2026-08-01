import { KnowledgeIndex } from "../../infrastructure/importer/knowledgeWriter/knowledgeIndex";
import type { IFileSystem } from "../../shared/contracts/IFileSystem";

import type { ValidatedGame } from "../game/types/ValidatedGame";

import type { KnowledgeChunk } from "./KnowledgeChunk";
import type { RetrievedChunk } from "./RetrievedChunk";

import { SimilarityCalculator } from "./SimilarityCalculator";

export class KnowledgeRetriever {

    private readonly similarity =
        new SimilarityCalculator();

    constructor(

        private readonly fileSystem: IFileSystem

    ) {}

    async retrieve(

        game: ValidatedGame,

        questionEmbedding: number[],

        limit = 5

    ): Promise<RetrievedChunk[]> {

        const knowledge =
    await this.fileSystem.readJson<KnowledgeIndex>(
        game.paths.knowledge
    );

        const chunks =
            knowledge.chunks;
            

        const results =
            chunks.map(

                chunk => ({

                    id: chunk.id,

                    gameId: chunk.gameId,

                    page: chunk.page,

                    text: chunk.text,

                    score:

                        this.similarity.calculate(

                            questionEmbedding,

                            chunk.embedding

                        )

                })

            );

        results.sort(

            (

                a,

                b

            ) =>

                b.score - a.score

        );
        
        return results.slice(

            0,

            limit

        );

    }

}