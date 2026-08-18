import type { ConversationMessage } from "../types/ConversationMessage";

export interface IConversationRepository {

    listMessages(

        userId: string,

        gameId: string

    ): Promise<ConversationMessage[]>;

    addMessage(

        userId: string,

        gameId: string,

        role: "user" | "assistant",

        content: string,

        sources?: unknown

    ): Promise<ConversationMessage>;

    clearConversation(

        userId: string,

        gameId: string

    ): Promise<void>;

}
