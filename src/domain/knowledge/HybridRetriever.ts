import type { ValidatedGame } from "../game/types/ValidatedGame";

import type { RetrievedChunk } from "./RetrievedChunk";

import type { IKnowledgeRetriever } from "./IknowledgeRetriever";

import { SemanticRetriever } from "./SemanticRetriever";
import { KeywordRetriever } from "./KeywordRetriever";

export class HybridRetriever
    implements IKnowledgeRetriever {

    constructor(

        private readonly semanticRetriever: SemanticRetriever,

        private readonly keywordRetriever: KeywordRetriever

    ) {}

    async retrieve(

        game: ValidatedGame,

        question: string,

        embedding: number[]

    ): Promise<RetrievedChunk[]> {

        const semanticResults =
            await this.semanticRetriever.retrieve(

                game,

                question,
                
                embedding

            );

        const keywordResults =
            await this.keywordRetriever.retrieve(

                game,

                question,

                embedding

            );

        const map =
            new Map<string, RetrievedChunk>();

        for (const chunk of semanticResults) {

            map.set(
                chunk.id,
                chunk
            );

        }

        for (const chunk of keywordResults) {

            const existing =
                map.get(chunk.id);

            if (!existing) {

                map.set(
                    chunk.id,
                    chunk
                );

                continue;

            }

            existing.score =
                Math.max(
                    existing.score,
                    chunk.score
                );

        }

        return [...map.values()]
            .sort(
                (a, b) =>
                    b.score - a.score
            )
            .slice(0, 5);

    }

}