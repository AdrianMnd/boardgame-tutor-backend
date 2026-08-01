import { RetrievedChunk } from "./RetrievedChunk";

export interface IContextReranker {

    rerank(

        question: string,

        chunks: RetrievedChunk[]

    ): Promise<RetrievedChunk[]>;

}