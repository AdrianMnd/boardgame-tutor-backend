import type { GameMetadata } from "../game/types/GameMetadata";
import type { RetrievedChunk } from "../knowledge/RetrievedChunk";

export class PromptBuilder {

    build(

        metadata: GameMetadata,

        question: string,

        chunks: RetrievedChunk[]

    ): string {

        const context =
            chunks
                .map(

                    chunk =>

                        [
                            `Página ${chunk.page}`,

                            chunk.text

                        ].join("\n")

                )

                .join("\n\n--------------------\n\n");

        return `Eres un experto en el juego de mesa "${metadata.name}".

Debes responder utilizando únicamente la información proporcionada.

Si la respuesta no aparece en el contexto, responde exactamente:

"No he encontrado esa información en el reglamento."

No inventes reglas.

No hagas suposiciones.

Contexto:

${context}

Pregunta:

${question}

Respuesta:`;

    }

}