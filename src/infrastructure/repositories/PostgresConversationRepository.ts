import type { Pool } from "pg";

import type { IConversationRepository } from "../../domain/conversation/repositories/IConversationRepository";
import type { ConversationMessage } from "../../domain/conversation/types/ConversationMessage";

interface MessageRow {

    id: string;

    role: "user" | "assistant";

    content: string;

    sources: unknown;

    created_at: string;

}

function toMessage(

    row: MessageRow

): ConversationMessage {

    return {

        id: row.id,

        role: row.role,

        content: row.content,

        sources: row.sources ?? undefined,

        createdAt: row.created_at

    };

}

export class PostgresConversationRepository
    implements IConversationRepository {

    constructor(

        private readonly pool: Pool

    ) {}

    async listMessages(

        userId: string,

        gameId: string

    ): Promise<ConversationMessage[]> {

        const result =

            await this.pool.query<MessageRow>(

                `
                SELECT id, role, content, sources, created_at
                FROM conversation_messages
                WHERE user_id = $1 AND game_id = $2
                ORDER BY created_at ASC
                `,

                [userId, gameId]

            );

        return result.rows.map(toMessage);

    }

    async addMessage(

        userId: string,

        gameId: string,

        role: "user" | "assistant",

        content: string,

        sources?: unknown

    ): Promise<ConversationMessage> {

        const result =

            await this.pool.query<MessageRow>(

                `
                INSERT INTO conversation_messages
                    (user_id, game_id, role, content, sources)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, role, content, sources, created_at
                `,

                [

                    userId,

                    gameId,

                    role,

                    content,

                    sources === undefined
                        ? null
                        : JSON.stringify(sources)

                ]

            );

        return toMessage(result.rows[0]);

    }

    async clearConversation(

        userId: string,

        gameId: string

    ): Promise<void> {

        await this.pool.query(

            "DELETE FROM conversation_messages WHERE user_id = $1 AND game_id = $2",

            [userId, gameId]

        );

    }

}
