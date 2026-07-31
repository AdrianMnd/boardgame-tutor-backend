import { EmbeddedChunk } from "../../../domain/importer/embeddedChunk";
import { IEmbeddingProvider } from "../../ai/embeddings/iEmbeddingProvider";
import { Chunk } from "../chunkGenerator/chunk";


export class EmbeddingGenerator {

    constructor(

        private readonly provider:
            IEmbeddingProvider

    ) { }

    async generate(
        chunks: Chunk[]
    ): Promise<EmbeddedChunk[]> {

        const embeddedChunks: EmbeddedChunk[] = [];

        for (const chunk of chunks) {

            const embedding =
                await this.provider.generateEmbedding(
                    chunk.text
                );

            embeddedChunks.push({

                ...chunk,

                embedding

            });

        }

        return embeddedChunks;

    }

}