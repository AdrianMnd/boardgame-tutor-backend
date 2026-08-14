import type { Pool } from "pg";

import type { ImportConfiguration } from "../../config/import";

import type { ValidatedGame } from "../../domain/game/types/ValidatedGame";

import type { RetrievedChunk } from "../../domain/knowledge/RetrievedChunk";
import { IKnowledgeRetriever } from "../../domain/knowledge/IknowledgeRetriever";

interface ChunkRow {

    id: string;

    game_id: string;

    document_id: string;

    document_name: string;

    page: number;

    text: string;

    score: number;

}

export class PgVectorRetriever
    implements IKnowledgeRetriever {

    constructor(

        private readonly pool: Pool,

        private readonly configuration: ImportConfiguration

    ) {}

    async retrieve(

        game: ValidatedGame,

        _question: string,

        embedding: number[]

    ): Promise<RetrievedChunk[]> {

        const vectorLiteral =

            `[${embedding.join(",")}]`;

        const result =

            await this.pool.query<ChunkRow>(

                `
                SELECT
                    c.id,
                    c.game_id,
                    c.document_id,
                    d.name AS document_name,
                    c.page,
                    c.text,
                    1 - (c.embedding <=> $2::vector) AS score
                FROM chunks c
                JOIN documents d
                    ON d.game_id = c.game_id
                    AND d.id = c.document_id
                WHERE c.game_id = $1
                ORDER BY c.embedding <=> $2::vector ASC
                LIMIT $3
                `,

                [

                    game.metadata.id,

                    vectorLiteral,

                    this.configuration.maxRetrievedChunks

                ]

            );

        return result.rows.map(

            row => ({

                id: row.id,

                gameId: row.game_id,

                documentId: row.document_id,

                documentName: row.document_name,

                page: row.page,

                text: row.text,

                score: row.score

            })

        );

    }

}
