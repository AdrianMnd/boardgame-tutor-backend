import { GameMetadata } from "./GameMetadata"
import { DocumentDescriptor } from "./DocumentDescriptor"

export interface ValidatedGame {

    metadata: GameMetadata;

    documents: DocumentDescriptor[];

    coverPath?: string;

}