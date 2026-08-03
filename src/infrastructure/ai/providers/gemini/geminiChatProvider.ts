import { ChatProvider } from "../../../../domain/ai/chatProvider";
import { GeminiClient } from "./geminiClient";

export class GeminiChatProvider
    implements ChatProvider {

    constructor(

        private readonly client: GeminiClient

    ) {}

    answer(
        question: string,
        context: string
    ): Promise<string> {

        return this.client.generateAnswer(

            question,

            context

        );

    }

}