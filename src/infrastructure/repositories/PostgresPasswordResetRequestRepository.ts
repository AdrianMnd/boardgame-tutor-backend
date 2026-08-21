import type { Pool } from "pg";

import type {
    IPasswordResetRequestRepository,
    PasswordResetRequestRecord
} from "../../domain/passwordResetRequest/IPasswordResetRequestRepository";

interface Row {

    id: string;

    email: string;

    resolved: boolean;

    created_at: string;

}

function toRecord(

    row: Row

): PasswordResetRequestRecord {

    return {

        id: row.id,

        email: row.email,

        resolved: row.resolved,

        createdAt: row.created_at

    };

}

export class PostgresPasswordResetRequestRepository
    implements IPasswordResetRequestRepository {

    constructor(

        private readonly pool: Pool

    ) {}

    async create(

        email: string

    ): Promise<void> {

        await this.pool.query(

            "INSERT INTO password_reset_requests (email) VALUES ($1)",

            [email]

        );

    }

    async list(): Promise<PasswordResetRequestRecord[]> {

        const result =

            await this.pool.query<Row>(

                `
                SELECT id, email, resolved, created_at
                FROM password_reset_requests
                ORDER BY resolved ASC, created_at DESC
                `

            );

        return result.rows.map(toRecord);

    }

    async markResolved(

        id: string

    ): Promise<void> {

        await this.pool.query(

            "UPDATE password_reset_requests SET resolved = true WHERE id = $1",

            [id]

        );

    }

}
