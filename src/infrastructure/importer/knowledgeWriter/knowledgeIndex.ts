import { EmbeddedChunk } from "../../../domain/importer/embeddedChunk";
import { DocumentDescriptor } from "../../../domain/game/types/DocumentDescriptor";

export interface KnowledgeIndex {

    gameId: string;

    createdAt: string;

    totalChunks: number;

    embeddingModel: string;

    documents: DocumentDescriptor[];

    chunks: EmbeddedChunk[];

}