import { ExtractedDocument } from "../../../domain/importer/extractedDocument";
import type { Chunk } from "./chunk";

export class ChunkGenerator {

    constructor(

        private readonly chunkSize = 600,

        private readonly overlap = 100

    ) { }

    generate(

        gameId: string,

        documentId: string,

        document: ExtractedDocument

    ): Chunk[] {

        const chunks: Chunk[] = [];

        for (const page of document.pages) {

            let start = 0;

            let index = 1;

            while (start < page.text.length) {

                const end =
                    Math.min(
                        start + this.chunkSize,
                        page.text.length
                    );

                const text =
                    page.text
                        .slice(start, end)
                        .trim();

                if (text.length > 0) {

                    chunks.push({

                        id: `${gameId}-${documentId}-p${page.page}-c${index}`,

                        gameId,

                        documentId,

                        page: page.page,

                        index,

                        text

                    });

                }

                if (end >= page.text.length) {

                    break;

                }

                start =
                    end - this.overlap;

                index++;

            }

        }

        return chunks;

    }

}