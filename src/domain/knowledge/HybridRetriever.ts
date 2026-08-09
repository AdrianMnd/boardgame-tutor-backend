import { ValidatedGame } from "../game/types/ValidatedGame";

import { IKnowledgeRetriever } from "./IknowledgeRetriever";

import { RetrievedChunk } from "./RetrievedChunk";

import { ReciprocalRankFusion } from "./ReciprocalRankFusion";

export class HybridRetriever
implements IKnowledgeRetriever {

    private readonly fusion =

        new ReciprocalRankFusion();

    constructor(

        private readonly semanticRetriever: IKnowledgeRetriever,

        private readonly keywordRetriever: IKnowledgeRetriever

    ) {}

    async retrieve(

        game: ValidatedGame,

        question: string,

        embedding: number[]

    ): Promise<RetrievedChunk[]> {

        const semantic =

            await this.semanticRetriever.retrieve(

                game,

                question,

                embedding

            );

        const keyword =

            await this.keywordRetriever.retrieve(

                game,

                question,

                embedding

            );

        return this.fusion.fuse(

            semantic,

            keyword

        );

    }

}