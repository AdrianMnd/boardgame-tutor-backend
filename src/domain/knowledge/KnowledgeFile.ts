import { KnowledgeChunk } from "./KnowledgeChunk"

export interface KnowledgeFile {

    gameId: string;

    version: string;

    generatedAt: string;

    chunks: KnowledgeChunk[];

}