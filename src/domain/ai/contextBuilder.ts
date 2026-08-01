import type { RetrievedChunk } from "../knowledge/RetrievedChunk";

export class ContextBuilder {

    build(

    chunks: RetrievedChunk[]

): string {

    return chunks

        .map(

            (

                chunk,

                index

            ) => [

                `### Fragmento ${index + 1}`,

                `Página ${chunk.page}`,

                `Similitud: ${chunk.score.toFixed(3)}`,

                "",

                chunk.text

            ].join("\n")

        )

        .join("\n\n====================\n\n");

}

}