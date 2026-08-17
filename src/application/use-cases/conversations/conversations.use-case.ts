import { BadRequestError } from "../../../presentation/api/errors/BadRequestError";

import type { IConversationRepository } from "../../../domain/conversation/repositories/IConversationRepository";
import type { ConversationMessage } from "../../../domain/conversation/types/ConversationMessage";

export class ConversationsUseCase {

    constructor(

        private readonly repository: IConversationRepository

    ) {}

    listMessages(

        userId: string,

        gameId: string

    ): Promise<ConversationMessage[]> {

        return this.repository.listMessages(userId, gameId);

    }

    async addMessage(

        userId: string,

        gameId: string,

        role: "user" | "assistant",

        content: string,

        sources?: unknown

    ): Promise<ConversationMessage> {

        if (content.trim().length === 0) {

            throw new BadRequestError(

                "El contenido del mensaje no puede estar vacío."

            );

        }

        return this.repository.addMessage(

            userId,

            gameId,

            role,

            content,

            sources

        );

    }

    clearConversation(

        userId: string,

        gameId: string

    ): Promise<void> {

        return this.repository.clearConversation(userId, gameId);

    }

}
