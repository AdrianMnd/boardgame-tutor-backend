import { RetrievedChunk } from "./RetrievedChunk";

export interface IContextCompressor {

    compress(

        question: string,

        chunks: RetrievedChunk[]

    ): Promise<RetrievedChunk[]>;

}