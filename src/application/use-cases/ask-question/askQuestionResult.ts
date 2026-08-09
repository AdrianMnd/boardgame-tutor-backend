import type { RetrievedChunk } from "../../../domain/knowledge/RetrievedChunk";

export interface AskQuestionResult {

    answer: string;

    sources: RetrievedChunk[];

}