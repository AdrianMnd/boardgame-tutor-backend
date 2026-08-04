import { IContextReranker } from "../../../domain/knowledge/IContextReranker";
import { RetrievedChunk } from "../../../domain/knowledge/RetrievedChunk";

import { ILLMClient } from "./ILLMClient";

export class LLMContextReranker
    implements IContextReranker {

    constructor(

        private readonly client: ILLMClient

    ) {}

    async rerank(

        question: string,

        chunks: RetrievedChunk[]

    ): Promise<RetrievedChunk[]> {

        if (chunks.length <= 1) {

            return chunks;

        }

        const prompt =

            this.buildPrompt(

                question,

                chunks

            );

        const response =

            await this.client.generateText(

                prompt

            );

        return this.parseResponse(

            response,

            chunks

        );

    }

    private buildPrompt(

        question: string,

        chunks: RetrievedChunk[]

    ): string {

        return `
Eres un sistema de recuperación de información.

Ordena los siguientes fragmentos según su utilidad para responder la pregunta.

Devuelve EXCLUSIVAMENTE un JSON válido.

Formato:

{
    "ids":[
        "chunk-id-1",
        "chunk-id-2"
    ]
}

Pregunta:

${question}

Fragmentos:

${chunks.map(

chunk =>

`ID: ${chunk.id}

${chunk.text}

`

).join("\n-----------------\n")}
`;

    }

    private parseResponse(

        response: string,

        chunks: RetrievedChunk[]

    ): RetrievedChunk[] {

        const ids =

            this.extractIds(

                response

            );

        if (

            ids.length === 0

        ) {

            return chunks;

        }

        const map =

            new Map(

                chunks.map(

                    chunk => [

                        chunk.id,

                        chunk

                    ]

                )

            );

        const ordered =

            ids

                .map(

                    id =>

                        map.get(id)

                )

                .filter(

                    (

                        chunk

                    ): chunk is RetrievedChunk =>

                        chunk !== undefined

                );

        return ordered.length > 0

            ? ordered

            : chunks;

    }

    private extractIds(

        response: string

    ): string[] {

        try {

            const json =

                JSON.parse(

                    this.clean(

                        response

                    )

                );

            if (

                !Array.isArray(

                    json.ids

                )

            ) {

                return [];

            }

            return json.ids.filter(

                (id: unknown): id is string =>

                    typeof id === "string"

            );

        }

        catch {

            return [];

        }

    }

    private clean(

        response: string

    ): string {

        return response

            .replace(/^```json/i, "")

            .replace(/^```/i, "")

            .replace(/```$/, "")

            .trim();

    }

}