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

        console.log(
            "Usando OpenRouter"
        );

        const response =

            await this.client.generateChat([

                {

                    role: "system",

                    content: `
Eres un experto en juegos de mesa.

Tu única fuente de información es el contexto proporcionado.

Normas:

- Responde únicamente utilizando la información del contexto.
- No inventes reglas.
- No utilices conocimientos propios.
- Si la respuesta no aparece claramente en el contexto, responde exactamente:

"No he encontrado esa información en el reglamento."

Contexto:

${context}
`

                },

                {

                    role: "user",

                    content: question

                }

            ]);

        return response.trim();

    }

}