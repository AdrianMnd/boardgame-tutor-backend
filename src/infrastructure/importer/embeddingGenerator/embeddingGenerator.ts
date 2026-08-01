import { Chunk } from "../chunkGenerator/chunk";

import { EmbeddedChunk } from "../../../domain/importer/embeddedChunk";

import { IEmbeddingProvider } from "../../../domain/embeddings/IEmbeddingProvider";

import { RetryPolicy } from "./RetryPolicy";

import { EmbeddingBatchProcessor } from "./embeddingBatchProcessor";

import { ImportConfiguration } from "../../../config/import";

export class EmbeddingGenerator {

    constructor(

        private readonly provider: IEmbeddingProvider,

        private readonly configuration: ImportConfiguration

    ) {}

    async generate(

        chunks: Chunk[],

        onProgress?: (

            completed: number,

            total: number

        ) => void

    ): Promise<EmbeddedChunk[]> {

        const retryPolicy =

            new RetryPolicy(

                this.configuration.retryCount,

                this.configuration.retryDelay,

                (

                    attempt,

                    delay

                ) =>

                    console.log(

                        `   Reintentando (${attempt}) en ${delay} ms...`

                    )

            );

        const processor =

            new EmbeddingBatchProcessor(

                this.provider,

                retryPolicy,

                this.configuration.embeddingConcurrency,

                onProgress

            );

        return processor.process(

            chunks

        );

    }

}