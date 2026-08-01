import type { Chunk } from "../chunkGenerator/chunk";
import type { KnowledgeChunk } from "../../../domain/knowledge/KnowledgeChunk";
import type { IEmbeddingProvider } from "../../../domain/embeddings/IEmbeddingProvider";

export class EmbeddingGenerator {

    constructor(

        private readonly provider: IEmbeddingProvider

    ) {}

    async generate(
        chunks: Chunk[]
    ): Promise<KnowledgeChunk[]> {

        const result: KnowledgeChunk[] = [];

        for (const chunk of chunks) {

            const embedding =
                await this.provider.generate(
                    chunk.text
                );

            result.push({

                id: chunk.id,

                gameId: chunk.gameId,

                page: chunk.page,

                index: chunk.index,

                text: chunk.text,

                embedding

            });

        }

        return result;

    }

}