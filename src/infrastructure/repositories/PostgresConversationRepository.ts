import type { Pool } from "pg";

import type { IConversationRepository } from "../../domain/conversation/repositories/IConversationRepository";
import type { ConversationMessage } from "../../domain/conversation/types/ConversationMessage";

// Tope de mensajes que se guardan por conversación (usuario +
// juego) — evita que una conversación muy larga crezca sin
// límite. Se recorta por CANTIDAD, no por antigüedad: así nadie
// pierde su historial solo por no volver a preguntar durante un
// tiempo, que era justo el riesgo de un borrado por fecha.
const MAX_MESSAGES_PER_CONVERSATION = 30;

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

        // No se hace en la misma transacción que el INSERT a
        // propósito — si esto llegara a fallar, la conversación
        // simplemente tendría un mensaje de más hasta el
        // siguiente envío, que la recortaría igualmente. No
        // merece la pena arriesgar el mensaje que el usuario
        // acaba de mandar por un fallo en la propia limpieza.
        await this.trimOldMessages(userId, gameId);

        return toMessage(result.rows[0]);

    }

    private async trimOldMessages(

        userId: string,

        gameId: string

    ): Promise<void> {

        await this.pool.query(

            `
            DELETE FROM conversation_messages
            WHERE id IN (
                SELECT id
                FROM conversation_messages
                WHERE user_id = $1 AND game_id = $2
                ORDER BY created_at DESC
                OFFSET $3
            )
            `,

            [userId, gameId, MAX_MESSAGES_PER_CONVERSATION]

        );

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
