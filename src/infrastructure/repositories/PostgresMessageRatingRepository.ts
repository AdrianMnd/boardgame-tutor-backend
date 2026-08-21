import type { Pool } from "pg";

import type {
    IMessageRatingRepository,
    MessageRatingInput,
    RatingSummaryByGame,
    RecentNegativeRating
} from "../../domain/rating/IMessageRatingRepository";

export class PostgresMessageRatingRepository
    implements IMessageRatingRepository {

    constructor(

        private readonly pool: Pool

    ) {}

    async create(

        input: MessageRatingInput

    ): Promise<void> {

        await this.pool.query(

            `
            INSERT INTO message_ratings
                (game_id, user_id, question, answer, rating)
            VALUES ($1, $2, $3, $4, $5)
            `,

            [

                input.gameId,

                input.userId ?? null,

                input.question,

                input.answer,

                input.rating

            ]

        );

    }

    async summaryByGame(): Promise<RatingSummaryByGame[]> {

        const result =

            await this.pool.query<{

                game_id: string;

                game_name: string;

                up: string;

                down: string;

            }>(

                `
                SELECT
                    g.id AS game_id,
                    g.name AS game_name,
                    COUNT(*) FILTER (WHERE r.rating = 'up') AS up,
                    COUNT(*) FILTER (WHERE r.rating = 'down') AS down
                FROM message_ratings r
                JOIN games g ON g.id = r.game_id
                GROUP BY g.id, g.name
                ORDER BY COUNT(*) FILTER (WHERE r.rating = 'down') DESC,
                         COUNT(*) DESC
                `

            );

        return result.rows.map(row => ({

            gameId: row.game_id,

            gameName: row.game_name,

            // COUNT(...) llega como string desde pg (los bigint
            // de Postgres no caben siempre en un number de JS de
            // forma segura) — aquí los valores nunca serán tan
            // grandes como para que eso sea un problema real.
            up: Number(row.up),

            down: Number(row.down)

        }));

    }

    async recentNegative(

        limit: number

    ): Promise<RecentNegativeRating[]> {

        const result =

            await this.pool.query<{

                game_id: string;

                game_name: string;

                question: string;

                answer: string;

                created_at: string;

            }>(

                `
                SELECT g.id AS game_id, g.name AS game_name,
                       r.question, r.answer, r.created_at
                FROM message_ratings r
                JOIN games g ON g.id = r.game_id
                WHERE r.rating = 'down'
                ORDER BY r.created_at DESC
                LIMIT $1
                `,

                [limit]

            );

        return result.rows.map(row => ({

            gameId: row.game_id,

            gameName: row.game_name,

            question: row.question,

            answer: row.answer,

            createdAt: row.created_at

        }));

    }

    async deleteAll(): Promise<void> {

        await this.pool.query("DELETE FROM message_ratings");

    }

}
