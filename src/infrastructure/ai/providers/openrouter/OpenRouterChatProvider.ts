import { ChatProvider } from "../../../../domain/ai/chatProvider";

import { OpenRouterClient } from "./OpenRouterClient";

export class OpenRouterChatProvider
    implements ChatProvider {

    constructor(

        private readonly client: OpenRouterClient

    ) {}

    async answer(

        question: string,

        context: string

    ): Promise<string> {

        const response =

            await this.client.generateText([

                {

                    role: "system",

                    content:
`Eres un experto en juegos de mesa.

Responde únicamente utilizando la información del contexto proporcionado.

Si la respuesta no está en el contexto, indícalo claramente.

Contexto:

${context}`

                },

                {

                    role: "user",

                    content: question

                }

            ]);

        return response.trim();

    }

}