import type { ChatMessage } from "./ChatMessage";
import type { OpenAICompatibleConfiguration } from "./OpenAICompatibleConfiguration";
import type { ILLMClient } from "./ILLMClient";
import { retry } from "./retry";

interface ChatCompletionResponse {

    choices: {

        message: {

            content: string;

        };

    }[];

}

export class OpenAICompatibleClient
    implements ILLMClient {

    constructor(

        protected readonly configuration:
            OpenAICompatibleConfiguration

    ) {}

    protected async post<T>(

    endpoint: string,

    body: unknown

): Promise<T> {

    const response =

        await retry(() =>

            fetch(

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

            )

        );

    if (!response.ok) {

        throw new Error(

            await response.text()

        );

    }

    return response.json();

}

    async generateText(

    prompt: string

): Promise<string> {

    return this.generateChat([

        {

            role: "user",

            content: prompt

        }

    ]);

}

async generateChat(

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

    /* async generateChat(

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

    } */

    async generateEmbedding(

        text: string

    ): Promise<number[]> {

        throw new Error(

            "Not implemented."

        );

    }

}