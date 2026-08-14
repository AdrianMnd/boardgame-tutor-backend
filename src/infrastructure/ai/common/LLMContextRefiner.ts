import { IContextRefiner } from "../../../domain/knowledge/IContextRefiner";
import { RetrievedChunk } from "../../../domain/knowledge/RetrievedChunk";

import type { ILLMClient } from "./ILLMClient";

export class LLMContextRefiner
    implements IContextRefiner {

    constructor(

        private readonly client: ILLMClient

    ) {}

    /**
     * Reordena los fragmentos recuperados de más a menos
     * relevantes para la pregunta — pero NUNCA modifica su
     * texto.
     *
     * Antes, este mismo paso también le pedía a la IA que
     * "recortara la información irrelevante" de cada fragmento.
     * Con reglamentos densos y muy técnicos (numerología de
     * reglas, palabras clave específicas de una facción...) ese
     * recorte podía eliminar justo el dato concreto que se
     * preguntaba, dejando el resto del fragmento con aspecto
     * relevante — el usuario veía la página correcta en las
     * fuentes, pero la respuesta final decía "no encontrado"
     * porque el dato ya no estaba en el contexto que recibía.
     * En una app de reglas, la precisión importa más que ahorrar
     * unos pocos tokens de contexto.
     */
    async refine(

        question: string,

        chunks: RetrievedChunk[]

    ): Promise<RetrievedChunk[]> {

        if (chunks.length <= 1) {

            // Con 0 o 1 fragmento no hay nada que reordenar, y
            // no merece la pena gastar una llamada de IA.
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

Ordena estos fragmentos recuperados desde el MÁS útil hasta el
MENOS útil para responder la pregunta. No modifiques ni resumas
el contenido de ningún fragmento — solo indica el orden.

NO respondas la pregunta.
NO expliques nada.
Devuelve EXCLUSIVAMENTE un JSON válido con este formato, listando
TODOS los IDs recibidos, del más al menos relevante:

{
  "order": ["chunk-id-mas-relevante", "chunk-id-siguiente", "..."]
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

            if (!Array.isArray(json.order)) {

                return original;

            }

            const originalById =

                new Map(

                    original.map(

                        chunk => [chunk.id, chunk]

                    )

                );

            const ordered: RetrievedChunk[] = [];

            const seen = new Set<string>();

            for (const id of json.order) {

                const chunk =

                    typeof id === "string"

                        ? originalById.get(id)

                        : undefined;

                if (chunk && !seen.has(chunk.id)) {

                    ordered.push(chunk);

                    seen.add(chunk.id);

                }

            }

            // Cualquier fragmento que la IA no haya mencionado
            // (o un JSON parcial/malformado) se añade al final
            // en vez de perderse — nunca se descarta un
            // fragmento recuperado solo porque la IA lo omitiera
            // del orden.
            for (const chunk of original) {

                if (!seen.has(chunk.id)) {

                    ordered.push(chunk);

                }

            }

            return ordered;

        }
        catch {

            return original;

        }

    }

}
