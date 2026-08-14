import { GameMetadata } from "./GameMetadata"
import { GamePaths } from "./GamePaths"
import { DocumentDescriptor } from "./DocumentDescriptor"

export interface ValidatedGame {

    metadata: GameMetadata;

    paths: GamePaths;

    /**
     * Documentos PDF detectados en source/ — siempre al menos
     * uno si el juego se ha importado correctamente.
     * documents[0] es el documento "por defecto" (rulebook.pdf
     * si existe).
     */
    documents: DocumentDescriptor[];

}