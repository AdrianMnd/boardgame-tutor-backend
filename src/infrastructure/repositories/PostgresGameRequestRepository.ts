import type { Pool } from "pg";

import type { IGameRequestRepository } from "../../domain/gameRequest/IGameRequestRepository";
import type { GameRequestRecord } from "../../domain/gameRequest/GameRequestRecord";

interface GameRequestRow {

    id: string;

    requester_name: string;

    requester_email: string;

    game_name: string;

    bgg_url: string | null;

    pdf_keys: string[];

    reviewed: boolean;

    created_at: string;

}

function toRecord(

    row: GameRequestRow

): GameRequestRecord {

    return {

        id: row.id,

        requesterName: row.requester_name,

        requesterEmail: row.requester_email,

        gameName: row.game_name,

        bggUrl: row.bgg_url ?? undefined,

        pdfKeys: row.pdf_keys,

        reviewed: row.reviewed,

        createdAt: row.created_at

    };

}

export class PostgresGameRequestRepository
    implements IGameRequestRepository {

    constructor(

        private readonly pool: Pool

    ) {}

    async create(

        input: Omit<GameRequestRecord, "id" | "reviewed" | "createdAt">

    ): Promise<GameRequestRecord> {

        const result =

            await this.pool.query<GameRequestRow>(

                `
                INSERT INTO game_requests
                    (requester_name, requester_email, game_name, bgg_url, pdf_keys)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, requester_name, requester_email, game_name,
                          bgg_url, pdf_keys, reviewed, created_at
                `,

                [

                    input.requesterName,

                    input.requesterEmail,

                    input.gameName,

                    input.bggUrl ?? null,

                    input.pdfKeys

                ]

            );

        return toRecord(result.rows[0]);

    }

    async list(): Promise<GameRequestRecord[]> {

        const result =

            await this.pool.query<GameRequestRow>(

                `
                SELECT id, requester_name, requester_email, game_name,
                       bgg_url, pdf_keys, reviewed, created_at
                FROM game_requests
                ORDER BY reviewed ASC, created_at DESC
                `

            );

        return result.rows.map(toRecord);

    }

    async markReviewed(

        id: string

    ): Promise<void> {

        await this.pool.query(

            "UPDATE game_requests SET reviewed = true WHERE id = $1",

            [id]

        );

    }

}
