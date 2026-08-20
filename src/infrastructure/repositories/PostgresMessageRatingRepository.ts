import type { Pool } from "pg";

import type {
    IMessageRatingRepository,
    MessageRatingInput
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

}
