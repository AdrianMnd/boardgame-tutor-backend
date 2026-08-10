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
        const processor = new embeddingBatchProcessor_1.EmbeddingBatchProcessor(this.provider, retryPolicy, this.configuration.embeddingConcurrency, onProgress, this.configuration.embeddingRequestDelay, onBatchFinished);
        return processor.process(chunks, alreadyEmbedded);
    }
}
exports.EmbeddingGenerator = EmbeddingGenerator;
