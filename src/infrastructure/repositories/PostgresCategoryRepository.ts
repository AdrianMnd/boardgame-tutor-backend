import type { Pool } from "pg";

import type { ICategoryRepository } from "../../domain/user/repositories/ICategoryRepository";
import type { UserCategory } from "../../domain/user/types/UserCategory";

interface CategoryRow {

    id: string;

    name: string;

}

interface CategoryGameRow {

    category_id: string;

    game_id: string;

}

export class PostgresCategoryRepository
    implements ICategoryRepository {

    constructor(

        private readonly pool: Pool

    ) {}

    async list(

        userId: string

    ): Promise<UserCategory[]> {

        const categories =

            await this.pool.query<CategoryRow>(

                "SELECT id, name FROM user_categories WHERE user_id = $1 ORDER BY created_at ASC",

                [userId]

            );

        const games =

            await this.pool.query<CategoryGameRow>(

                `
                SELECT ucg.category_id, ucg.game_id
                FROM user_category_games ucg
                JOIN user_categories uc ON uc.id = ucg.category_id
                WHERE uc.user_id = $1
                `,

                [userId]

            );

        const gamesByCategory = new Map<string, string[]>();

        for (const row of games.rows) {

            const list = gamesByCategory.get(row.category_id) ?? [];

            list.push(row.game_id);

            gamesByCategory.set(row.category_id, list);

        }

        return categories.rows.map(

            row => ({

                id: row.id,

                name: row.name,

                gameIds: gamesByCategory.get(row.id) ?? []

            })

        );

    }

    async create(

        userId: string,

        name: string

    ): Promise<UserCategory> {

        const result =

            await this.pool.query<CategoryRow>(

                "INSERT INTO user_categories (user_id, name) VALUES ($1, $2) RETURNING id, name",

                [userId, name]

            );

        return {

            id: result.rows[0].id,

            name: result.rows[0].name,

            gameIds: []

        };

    }

    async rename(

        userId: string,

        categoryId: string,

        name: string

    ): Promise<boolean> {

        const result =

            await this.pool.query(

                "UPDATE user_categories SET name = $1 WHERE id = $2 AND user_id = $3",

                [name, categoryId, userId]

            );

        return (result.rowCount ?? 0) > 0;

    }

    async delete(

        userId: string,

        categoryId: string

    ): Promise<boolean> {

        const result =

            await this.pool.query(

                "DELETE FROM user_categories WHERE id = $1 AND user_id = $2",

                [categoryId, userId]

            );

        return (result.rowCount ?? 0) > 0;

    }

    async addGame(

        userId: string,

        categoryId: string,

        gameId: string

    ): Promise<boolean> {

        const owned =
            await this.verifyOwnership(userId, categoryId);

        if (!owned) {

            return false;

        }

        await this.pool.query(

            `
            INSERT INTO user_category_games (category_id, game_id)
            VALUES ($1, $2)
            ON CONFLICT (category_id, game_id) DO NOTHING
            `,

            [categoryId, gameId]

        );

        return true;

    }

    async removeGame(

        userId: string,

        categoryId: string,

        gameId: string

    ): Promise<boolean> {

        const owned =
            await this.verifyOwnership(userId, categoryId);

        if (!owned) {

            return false;

        }

        await this.pool.query(

            "DELETE FROM user_category_games WHERE category_id = $1 AND game_id = $2",

            [categoryId, gameId]

        );

        return true;

    }

    private async verifyOwnership(

        userId: string,

        categoryId: string

    ): Promise<boolean> {

        const result =

            await this.pool.query(

                "SELECT 1 FROM user_categories WHERE id = $1 AND user_id = $2",

                [categoryId, userId]

            );

        return result.rows.length > 0;

    }

}
