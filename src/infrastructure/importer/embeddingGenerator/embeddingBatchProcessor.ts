import { Chunk } from "../chunkGenerator/chunk";

import { EmbeddedChunk } from "../../../domain/importer/embeddedChunk";

import { IEmbeddingProvider } from "../../../domain/embeddings/IEmbeddingProvider";

import { RetryPolicy } from "./RetryPolicy";

function sleep(milliseconds: number): Promise<void> {

    return new Promise(

        resolve => setTimeout(resolve, milliseconds)

    );

}

/**
 * Agrupa los chunks pendientes en lotes de tamaño `batchSize`
 * y los envía en una sola petición HTTP por lote (en vez de una
 * petición por chunk). Con 20 chunks por lote, importar un
 * juego de 350 chunks pasa de necesitar ~350 peticiones a
 * necesitar ~18 — que es lo que realmente permite acercarse a
 * los límites de "peticiones por minuto" de los planes
 * gratuitos sin agotarlos en segundos.
 */
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
         * Espera mínima (ms) antes de cada petición, por worker
         * concurrente. Ahora que cada petición cubre un lote
         * entero de chunks, hace mucha menos falta que antes,
         * pero se mantiene como red de seguridad adicional.
         */
        private readonly requestDelayMs = 0,

        /**
         * Se invoca cada vez que un lote termina (haya tenido
         * éxito o haya fallado a mitad) con todos los chunks
         * conseguidos hasta ese momento, para poder persistirlos
         * como checkpoint y no perder el progreso.
         */
        private readonly onBatchFinished?: (

            results: EmbeddedChunk[]

        ) => Promise<void> | void,

        private readonly batchSize = 20

    ) {}

    async process(

        chunks: Chunk[],

        alreadyEmbedded: Map<string, EmbeddedChunk> = new Map()

    ): Promise<EmbeddedChunk[]> {

        const results: EmbeddedChunk[] =

            new Array(chunks.length);

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

        // Se agrupan los índices PENDIENTES (no los ya
        // resueltos por el checkpoint) en lotes contiguos de
        // como mucho `batchSize` elementos.
        const pendingIndexBatches: number[][] = [];

        let currentBatch: number[] = [];

        for (let i = 0; i < chunks.length; i++) {

            if (results[i]) {

                continue;

            }

            currentBatch.push(i);

            if (currentBatch.length >= this.batchSize) {

                pendingIndexBatches.push(currentBatch);

                currentBatch = [];

            }

        }

        if (currentBatch.length > 0) {

            pendingIndexBatches.push(currentBatch);

        }

        let nextBatchIndex = 0;

        const worker = async () => {

            while (true) {

                const batchIndex = nextBatchIndex++;

                if (batchIndex >= pendingIndexBatches.length) {

                    return;

                }

                const indices = pendingIndexBatches[batchIndex];

                const texts =

                    indices.map(

                        i => chunks[i].text

                    );

                if (this.requestDelayMs > 0) {

                    await sleep(this.requestDelayMs);

                }

                const embeddings =

                    await this.retryPolicy.execute(

                        () =>

                            this.provider.generateBatch(

                                texts

                            )

                    );

                indices.forEach((chunkIndex, position) => {

                    results[chunkIndex] = {

                        ...chunks[chunkIndex],

                        embedding: embeddings[position]

                    };

                });

                completed += indices.length;

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

                        pendingIndexBatches.length

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

            // Se guarda el progreso tanto si terminó bien como
            // si falló a mitad de camino (ej. cuota agotada en
            // todos los proveedores configurados).
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
