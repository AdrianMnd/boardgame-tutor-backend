import type { ValidatedGame } from "../game/types/ValidatedGame";
import type { RetrievedChunk } from "./RetrievedChunk";

export interface IKnowledgeRetriever {

    retrieve(

        game: ValidatedGame,

        question: string,

        embedding: number[]

    ): Promise<RetrievedChunk[]>;

}