import type { Pool } from "pg";

import type { IFavoritesRepository } from "../../domain/user/repositories/IFavoritesRepository";

export class PostgresFavoritesRepository
    implements IFavoritesRepository {

    constructor(

        private readonly pool: Pool

    ) {}

    async list(

        userId: string

    ): Promise<string[]> {

        const result =

            await this.pool.query<{ game_id: string }>(

                "SELECT game_id FROM user_favorites WHERE user_id = $1",

                [userId]

            );

        return result.rows.map(row => row.game_id);

    }

    async add(

        userId: string,

        gameId: string

    ): Promise<void> {

        await this.pool.query(

            `
            INSERT INTO user_favorites (user_id, game_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, game_id) DO NOTHING
            `,

            [userId, gameId]

        );

    }

    async remove(

        userId: string,

        gameId: string

    ): Promise<void> {

        await this.pool.query(

            "DELETE FROM user_favorites WHERE user_id = $1 AND game_id = $2",

            [userId, gameId]

        );

    }

}
