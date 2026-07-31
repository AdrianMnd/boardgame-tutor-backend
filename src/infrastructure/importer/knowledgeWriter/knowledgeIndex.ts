import { EmbeddedChunk } from "../../../domain/importer/embeddedChunk";

export interface KnowledgeIndex {

    gameId: string;

    createdAt: string;

    totalChunks: number;

    embeddingModel: string;

    chunks: EmbeddedChunk[];

}