import { ImportConfiguration } from "../../config/import";
import { KnowledgeIndex } from "../../infrastructure/importer/knowledgeWriter/knowledgeIndex";
import type { IFileSystem } from "../../shared/contracts/IFileSystem";

import type { ValidatedGame } from "../game/types/ValidatedGame";

import type { RetrievedChunk } from "./RetrievedChunk";
import { IKnowledgeRetriever } from "./IknowledgeRetriever";

import { SimilarityCalculator } from "./SimilarityCalculator";

export class SemanticRetriever
    implements IKnowledgeRetriever {

    private readonly similarity =
        new SimilarityCalculator();

    constructor(

        private readonly fileSystem: IFileSystem,

        private readonly configuration: ImportConfiguration

    ) {}

    async retrieve(

        game: ValidatedGame,

        _question: string,

        embedding: number[]

    ): Promise<RetrievedChunk[]> {

        const knowledge =
            await this.fileSystem.readJson<KnowledgeIndex>(
                game.paths.knowledge
            );

        const documentNames =

            new Map(

                (knowledge.documents ?? []).map(

                    document => [document.id, document.name]

                )

            );

        const results: RetrievedChunk[] = [];

        for (const chunk of knowledge.chunks) {

            // Defensa: si este chunk se guardó sin embedding
            // (ej. por un fallo del proveedor durante el import),
            // se ignora en vez de tumbar la pregunta entera con
            // un error 500 — simplemente no participa en la
            // búsqueda.
            if (

                !Array.isArray(chunk.embedding) ||
                chunk.embedding.length === 0

            ) {

                console.warn(

                    `[SemanticRetriever] Chunk "${chunk.id}" del juego ` +
                    `"${game.metadata.id}" no tiene embedding válido — se ` +
                    `omite de la búsqueda. Vuelve a importar este juego ` +
                    `para arreglarlo.`

                );

                continue;

            }

            results.push({

                id: chunk.id,

                gameId: chunk.gameId,

                documentId: chunk.documentId,

                documentName:

                    documentNames.get(chunk.documentId)

                    ?? chunk.documentId,

                page: chunk.page,

                text: chunk.text,

                score:

                    this.similarity.calculate(

                        embedding,

                        chunk.embedding

                    )

            });

        }

        return results

            .sort(

                (a, b) =>

                    b.score - a.score

            )

            .slice(

                0,

                this.configuration.maxRetrievedChunks

            );

    }

}
