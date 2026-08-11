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

        ) => void,

        alreadyEmbedded?: Map<string, EmbeddedChunk>,

        onBatchFinished?: (

            results: EmbeddedChunk[]

        ) => Promise<void> | void

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

                onProgress,

                this.configuration.embeddingRequestDelay,

                onBatchFinished,

                this.configuration.embeddingBatchSize

            );

        return processor.process(

            chunks,

            alreadyEmbedded

        );

    }

    /**
     * Genera un único embedding de prueba para saber qué
     * dimensión produce el proveedor que resulte activo HOY
     * (puede no ser el mismo que ayer, si aquel se quedó sin
     * cuota). Se usa para detectar, antes de generar nada más,
     * si un checkpoint de un día anterior es compatible con el
     * proveedor de hoy.
     */
    async probeDimension(): Promise<number> {

        const embedding =

            await this.provider.generate(

                "Texto de prueba para detectar la dimensión " +
                "del proveedor de embeddings activo."

            );

        return embedding.length;

    }

}
