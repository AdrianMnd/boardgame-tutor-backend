import { Chunk } from "../chunkGenerator/chunk";

import { EmbeddedChunk } from "../../../domain/importer/embeddedChunk";

import { IEmbeddingProvider } from "../../../domain/embeddings/IEmbeddingProvider";

import { RetryPolicy } from "./RetryPolicy";

export class EmbeddingBatchProcessor {

    constructor(

        private readonly provider: IEmbeddingProvider,

        private readonly retryPolicy: RetryPolicy,

        private readonly concurrency = 5,

        private readonly onProgress?: (

            completed: number,

            total: number

        ) => void

    ) {}

    async process(

        chunks: Chunk[]

    ): Promise<EmbeddedChunk[]> {

        const results: EmbeddedChunk[] =

            new Array(chunks.length);

        let nextIndex = 0;

        let completed = 0;

        const worker = async () => {

            while (true) {

                const current = nextIndex++;

                if (current >= chunks.length) {

                    return;

                }

                const chunk = chunks[current];

                const embedding =

                    await this.retryPolicy.execute(

                        () =>

                            this.provider.generate(

                                chunk.text

                            )

                    );

                results[current] = {

                    ...chunk,

                    embedding

                };

                completed++;

                this.onProgress?.(

                    completed,

                    chunks.length

                );

            }

        };

        const workers =

            Array.from(

                {

                    length: Math.min(

                        this.concurrency,

                        chunks.length

                    )

                },

                () => worker()

            );

        await Promise.all(

            workers

        );

        return results;

    }

}