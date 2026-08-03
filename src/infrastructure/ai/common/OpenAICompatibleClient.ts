import type { ChatMessage } from "./ChatMessage";
import type { OpenAICompatibleConfiguration } from "./OpenAICompatibleConfiguration";

interface ChatCompletionResponse {

    choices: {

        message: {

            content: string;

        };

    }[];

}

export class OpenAICompatibleClient {

    constructor(

        protected readonly configuration:
            OpenAICompatibleConfiguration

    ) {}

    protected async post<T>(

        endpoint: string,

        body: unknown

    ): Promise<T> {

        const response =

            await fetch(

                `${this.configuration.baseUrl}${endpoint}`,

                {

                    method: "POST",

                    headers: {

                        Authorization:

                            `Bearer ${this.configuration.apiKey}`,

                        "Content-Type":

                            "application/json"

                    },

                    body:

                        JSON.stringify(body)

                }

            );

        if (!response.ok) {

            throw new Error(

                await response.text()

            );

        }

        return response.json();

    }

    async generateText(

        messages: ChatMessage[]

    ): Promise<string> {

        const response =

            await this.post<ChatCompletionResponse>(

                "/chat/completions",

                {

                    model:

                        this.configuration.chatModel,

                    messages

                }

            );

        return (

            response.choices[0]?.message.content

            ??

            ""

        );

    }

    async generateEmbedding(

        text: string

    ): Promise<number[]> {

        throw new Error(

            "Not implemented."

        );

    }

}