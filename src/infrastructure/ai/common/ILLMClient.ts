import type { ChatMessage } from "./ChatMessage";

export interface ILLMClient {

    generateText(

        prompt: string

    ): Promise<string>;

    generateChat(

        messages: ChatMessage[]

    ): Promise<string>;

    generateEmbedding?(

        text: string

    ): Promise<number[]>;

}