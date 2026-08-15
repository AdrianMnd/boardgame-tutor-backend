import type { Pool } from "pg";

import type { IUserRepository } from "../../domain/user/repositories/IUserRepository";
import type { User } from "../../domain/user/types/User";
import type { UserRecord } from "../../domain/user/types/UserRecord";

interface UserRow {

    id: string;

    email: string;

    password_hash: string;

    display_name: string;

    created_at: string;

}

function toUser(

    row: UserRow

): User {

    return {

        id: row.id,

        email: row.email,

        displayName: row.display_name,

        createdAt: row.created_at

    };

}

export class PostgresUserRepository
    implements IUserRepository {

    constructor(

        private readonly pool: Pool

    ) {}

    async findByEmailWithPassword(

        email: string

    ): Promise<UserRecord | null> {

        const result =

            await this.pool.query<UserRow>(

                "SELECT * FROM users WHERE email = $1",

                // El email se guarda siempre en minúsculas (ver
                // create()) — se normaliza también aquí, para
                // que el login no dependa de mayúsculas/minúsculas.
                [email.toLowerCase().trim()]

            );

        const row = result.rows[0];

        if (!row) {

            return null;

        }

        return {

            ...toUser(row),

            passwordHash: row.password_hash

        };

    }

    async findById(

        id: string

    ): Promise<User | null> {

        const result =

            await this.pool.query<UserRow>(

                "SELECT * FROM users WHERE id = $1",

                [id]

            );

        const row = result.rows[0];

        return row ? toUser(row) : null;

    }

    async create(

        email: string,

        passwordHash: string,

        displayName: string

    ): Promise<User | null> {

        try {

            const result =

                await this.pool.query<UserRow>(

                    `
                    INSERT INTO users (email, password_hash, display_name)
                    VALUES ($1, $2, $3)
                    RETURNING *
                    `,

                    [

                        email.toLowerCase().trim(),

                        passwordHash,

                        displayName.trim()

                    ]

                );

            return toUser(result.rows[0]);

        }
        catch (error) {

            // Código 23505 de Postgres = violación de restricción
            // UNIQUE — el email ya existe. Se traduce a "null"
            // en vez de dejar que el error crudo de Postgres se
            // propague hasta el caso de uso.
            if (

                typeof error === "object" &&
                error !== null &&
                "code" in error &&
                error.code === "23505"

            ) {

                return null;

            }

            throw error;

        }

    }

}
