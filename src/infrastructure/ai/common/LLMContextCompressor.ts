import { RetrievedChunk } from "../../../domain/knowledge/RetrievedChunk";
import { IContextCompressor } from "../../../domain/knowledge/IContextCompressor";

import type { ILLMClient }
    from "./ILLMClient";

export class LLMContextCompressor
implements IContextCompressor {

    constructor(

        private readonly client: ILLMClient

    ) {}

    async compress(

        question: string,

        chunks: RetrievedChunk[]

    ): Promise<RetrievedChunk[]> {

        if (chunks.length === 0) {

            return [];

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
        Eres un sistema de compresión de contexto para RAG.

        Para cada fragmento elimina únicamente la información irrelevante para responder la pregunta.

        NO inventes información.

        NO resumas demasiado.

        Conserva literalmente las frases importantes.

        Devuelve EXCLUSIVAMENTE un JSON válido.

        Formato:

        {
        "chunks": [
            {
            "id": "chunk-id",
            "text": "texto"
            }
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

        const cleaned =

            this.cleanResponse(

                response

            );

        try {

            const json =

                JSON.parse(

                    cleaned

                );

            if (

                !Array.isArray(

                    json.chunks

                )

            ) {

                return chunks;

            }

            type CompressedChunk = {

    id: string;

    text: string;

};

const compressed =

    new Map<string, string>(

        (json.chunks as CompressedChunk[]).map(

            item => [

                item.id,

                item.text

            ]

        )

    );

            return chunks.map(

                chunk => ({

                    ...chunk,

                    text:

                        compressed.get(

                            chunk.id

                        ) ??

                        chunk.text

                })

            );

        }

        catch {

            return chunks;

        }

    }

    private cleanResponse(

        response: string

    ): string {

        return response

            .replace(/^```json/i, "")

            .replace(/^```/i, "")

            .replace(/```$/, "")

            .trim();

    }

}