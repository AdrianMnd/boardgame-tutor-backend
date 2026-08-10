import { Chunk } from "../chunkGenerator/chunk";

import { EmbeddedChunk } from "../../../domain/importer/embeddedChunk";

import { IEmbeddingProvider } from "../../../domain/embeddings/IEmbeddingProvider";

import { RetryPolicy } from "./RetryPolicy";

function sleep(milliseconds: number): Promise<void> {

    return new Promise(

        resolve => setTimeout(resolve, milliseconds)

    );

}

export class EmbeddingBatchProcessor {

    constructor(

        private readonly provider: IEmbeddingProvider,

        private readonly retryPolicy: RetryPolicy,

        private readonly concurrency = 5,

        private readonly onProgress?: (

            completed: number,

            total: number

        ) => void,

        /**
         * Espera mínima (ms) antes de cada petición de embedding,
         * por worker concurrente. Ayuda a no disparar los límites
         * de peticiones-por-minuto de los proveedores gratuitos
         * cuando hay varios workers en paralelo.
         */
        private readonly requestDelayMs = 0,

        /**
         * Se invoca cada vez que el lote termina (haya tenido
         * éxito o haya fallado a mitad) con todos los chunks
         * conseguidos hasta ese momento, para poder persistirlos
         * como checkpoint y no perder el progreso.
         */
        private readonly onBatchFinished?: (

            results: EmbeddedChunk[]

        ) => Promise<void> | void

    ) {}

    async process(

        chunks: Chunk[],

        alreadyEmbedded: Map<string, EmbeddedChunk> = new Map()

    ): Promise<EmbeddedChunk[]> {

        const results: EmbeddedChunk[] =

            new Array(chunks.length);

        let nextIndex = 0;

        let completed = 0;

        // Los chunks que ya vienen de un checkpoint anterior
        // cuentan como completados desde el principio, sin
        // gastar ninguna petición nueva.
        for (let i = 0; i < chunks.length; i++) {

            const cached =
                alreadyEmbedded.get(chunks[i].id);

            if (cached) {

                results[i] = cached;

                completed++;

            }

        }

        if (completed > 0) {

            this.onProgress?.(

                completed,

                chunks.length

            );

        }

        const worker = async () => {

            while (true) {

                const current = nextIndex++;

                if (current >= chunks.length) {

                    return;

                }

                if (results[current]) {

                    // Ya venía del checkpoint, nada que hacer.
                    continue;

                }

                const chunk = chunks[current];

                if (this.requestDelayMs > 0) {

                    await sleep(this.requestDelayMs);

                }

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

        try {

            await Promise.all(

                workers

            );

        }
        finally {

            // Se guarda el progreso tanto si el lote terminó
            // bien como si falló a mitad de camino (ej. cuota
            // agotada en todos los proveedores configurados).
            if (this.onBatchFinished) {

                const finished =

                    results.filter(

                        (chunk): chunk is EmbeddedChunk =>

                            chunk !== undefined

                    );

                await this.onBatchFinished(

                    finished

                );

            }

        }

        return results;

    }

}
