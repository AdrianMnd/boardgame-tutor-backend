"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingBatchProcessor = void 0;
function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}
class EmbeddingBatchProcessor {
    provider;
    retryPolicy;
    concurrency;
    onProgress;
    requestDelayMs;
    onBatchFinished;
    constructor(provider, retryPolicy, concurrency = 5, onProgress, 
    /**
     * Espera mínima (ms) antes de cada petición de embedding,
     * por worker concurrente. Ayuda a no disparar los límites
     * de peticiones-por-minuto de los proveedores gratuitos
     * cuando hay varios workers en paralelo.
     */
    requestDelayMs = 0, 
    /**
     * Se invoca cada vez que el lote termina (haya tenido
     * éxito o haya fallado a mitad) con todos los chunks
     * conseguidos hasta ese momento, para poder persistirlos
     * como checkpoint y no perder el progreso.
     */
    onBatchFinished) {
        this.provider = provider;
        this.retryPolicy = retryPolicy;
        this.concurrency = concurrency;
        this.onProgress = onProgress;
        this.requestDelayMs = requestDelayMs;
        this.onBatchFinished = onBatchFinished;
    }
    async process(chunks, alreadyEmbedded = new Map()) {
        const results = new Array(chunks.length);
        let completed = 0;
        // Los chunks que ya vienen de un checkpoint anterior
        // cuentan como completados desde el principio, sin
        // gastar ninguna petición nueva.
        for (let i = 0; i < chunks.length; i++) {
            const cached = alreadyEmbedded.get(chunks[i].id);
            if (cached) {
                results[i] = cached;
                completed++;
            }
        }
        if (completed > 0) {
            this.onProgress?.(completed, chunks.length);
        }
        const worker = async () => {
            while (true) {
                const batchIndex = nextBatchIndex++;
                if (batchIndex >= pendingIndexBatches.length) {
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
                const embedding = await this.retryPolicy.execute(() => this.provider.generateBatch(texts));
                indices.forEach((chunkIndex, position) => {
                    results[chunkIndex] = {
                        ...chunks[chunkIndex],
                        embedding: embeddings[position]
                    };
                });
                completed += indices.length;
                this.onProgress?.(completed, chunks.length);
            }
        };
        const workers = Array.from({
            length: Math.min(this.concurrency, pendingIndexBatches.length)
        }, () => worker());
        try {
            await Promise.all(workers);
        }
        finally {
            // Se guarda el progreso tanto si el lote terminó
            // bien como si falló a mitad de camino (ej. cuota
            // agotada en todos los proveedores configurados).
            if (this.onBatchFinished) {
                const finished = results.filter((chunk) => chunk !== undefined);
                await this.onBatchFinished(finished);
            }
        }
        return results;
    }
}
exports.EmbeddingBatchProcessor = EmbeddingBatchProcessor;
