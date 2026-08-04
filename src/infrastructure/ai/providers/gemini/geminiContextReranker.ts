import { IContextReranker } from "../../../../domain/knowledge/IContextReranker";
import { RetrievedChunk } from "../../../../domain/knowledge/RetrievedChunk";

import { GeminiClient } from "./geminiClient";

export class GeminiContextReranker
implements IContextReranker {

    constructor(

        private readonly client: GeminiClient

    ) {}

    async rerank(

        question: string,

        chunks: RetrievedChunk[]

    ): Promise<RetrievedChunk[]> {

        if (chunks.length <= 1) {

            return chunks;

        }

        const prompt = this.buildPrompt(

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

        Debes ordenar los fragmentos según su utilidad para responder la pregunta.

        Devuelve EXCLUSIVAMENTE un JSON válido con este formato:

        {
        "ids": [
            "chunk-id-1",
            "chunk-id-2",
            "chunk-id-3"
        ]
        }

        No escribas ninguna explicación.

        Pregunta:

        ${question}

        Fragmentos:

        ${chunks.map(

        chunk =>

        `ID: ${chunk.id}

        ${chunk.text}

        `

        ).join("\n----------------\n")}

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

    if (ids.length === 0) {

        return chunks;

    }

    const chunkMap =

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

                    chunkMap.get(id)

            )

            .filter(

                (

                    chunk

                ): chunk is RetrievedChunk =>

                    chunk !== undefined

            );

    if (ordered.length === 0) {

        return chunks;

    }

    return ordered;

}

    private extractIds(

            response: string

                ): string[] {

                    const json =

                        this.tryParseJson(

                            this.cleanResponse(

                                response    
                            
                            )

                        );

                    if (

                        json &&

                        Array.isArray(

                            json.ids

                        )

                    ) {

                        return json.ids;

                    }

                    return response

                        .split("\n")

                        .map(

                            line =>

                                line.trim()

                        )

                        .filter(

                            line =>

                                line.length > 0

                        );

                }

                private tryParseJson(

            text: string

        ): any {

            try {

                return JSON.parse(

                    text

                );

            }

            catch {

                return null;

            }

        }

        private cleanResponse(

    response: string

): string {

    return response

        .replace(

            /^```json/i,

            ""

        )

        .replace(

            /^```/i,

            ""

        )

        .replace(

            /```$/,

            ""

        )

        .trim();

}

}