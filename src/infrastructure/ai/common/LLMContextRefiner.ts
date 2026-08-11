import { IContextRefiner } from "../../../domain/knowledge/IContextRefiner";
import { RetrievedChunk } from "../../../domain/knowledge/RetrievedChunk";

import type { ILLMClient } from "./ILLMClient";

interface RefinedChunk {

    id: string;

    text: string;

}

export class LLMContextRefiner
    implements IContextRefiner {

    constructor(

        private readonly client: ILLMClient

    ) {}

    async refine(

        question: string,

        chunks: RetrievedChunk[]

    ): Promise<RetrievedChunk[]> {

        if (chunks.length === 0) {

            return [];

        }

        if (chunks.length === 1) {

            // Con un único fragmento no hay nada que reordenar,
            // y no merece la pena gastar una llamada de IA solo
            // para recortarlo.
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
Eres un sistema de recuperación de información para RAG.

Con los fragmentos recuperados para responder la pregunta, tienes que hacer DOS cosas a la vez:

1. Ordenarlos desde el MÁS útil hasta el MENOS útil para responder la pregunta (el orden del array indica el ranking).
2. Para cada fragmento, eliminar únicamente la información irrelevante para la pregunta. No inventes nada. No resumas en exceso. Conserva literalmente las frases importantes.

NO respondas la pregunta.
NO expliques nada.
Devuelve EXCLUSIVAMENTE un JSON válido con este formato:

{
  "chunks": [
    { "id": "chunk-id", "text": "texto recortado" }
  ]
}

Pregunta:

${question}

Fragmentos:

${chunks.map(

    chunk =>

        `ID: ${chunk.id}\n${chunk.text}`

).join("\n-----------------\n")}
`;

    }

    private parseResponse(

        response: string,

        original: RetrievedChunk[]

    ): RetrievedChunk[] {

        const cleaned =

            response

                .replace(/^```json/i, "")

                .replace(/^```/i, "")

                .replace(/```$/, "")

                .trim();

        try {

            const json =

                JSON.parse(cleaned);

            if (!Array.isArray(json.chunks)) {

                return original;

            }

            const originalById =

                new Map(

                    original.map(

                        chunk => [chunk.id, chunk]

                    )

                );

            const refined: RetrievedChunk[] = [];

            for (const item of json.chunks as RefinedChunk[]) {

                const base =

                    originalById.get(item?.id);

                if (base) {

                    refined.push({

                        ...base,

                        text:

                            typeof item.text === "string"

                                ? item.text

                                : base.text

                    });

                }

            }

            // Si el JSON viene vacío, malformado, o no coincide
            // ningún id, se devuelve el orden/contenido original
            // en vez de perder los fragmentos recuperados.
            return refined.length > 0
                ? refined
                : original;

        }
        catch {

            return original;

        }

    }

}
