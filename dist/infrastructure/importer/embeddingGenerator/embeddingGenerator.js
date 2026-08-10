"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingGenerator = void 0;
const RetryPolicy_1 = require("./RetryPolicy");
const embeddingBatchProcessor_1 = require("./embeddingBatchProcessor");
class EmbeddingGenerator {
    provider;
    configuration;
    constructor(provider, configuration) {
        this.provider = provider;
        this.configuration = configuration;
    }
    async generate(chunks, onProgress, alreadyEmbedded, onBatchFinished) {
        const retryPolicy = new RetryPolicy_1.RetryPolicy(this.configuration.retryCount, this.configuration.retryDelay, (attempt, delay) => console.log(`   Reintentando (${attempt}) en ${delay} ms...`));
        const processor = new embeddingBatchProcessor_1.EmbeddingBatchProcessor(this.provider, retryPolicy, this.configuration.embeddingConcurrency, onProgress, this.configuration.embeddingRequestDelay, onBatchFinished, this.configuration.embeddingBatchSize);
        return processor.process(chunks, alreadyEmbedded);
    }
    /**
     * Genera un único embedding de prueba para saber qué
     * dimensión produce el proveedor que resulte activo HOY
     * (puede no ser el mismo que ayer, si aquel se quedó sin
     * cuota). Se usa para detectar, antes de generar nada más,
     * si un checkpoint de un día anterior es compatible con el
     * proveedor de hoy.
     */
    async probeDimension() {
        const embedding = await this.provider.generate("Texto de prueba para detectar la dimensión " +
            "del proveedor de embeddings activo.");
        return embedding.length;
    }
}
exports.EmbeddingGenerator = EmbeddingGenerator;
