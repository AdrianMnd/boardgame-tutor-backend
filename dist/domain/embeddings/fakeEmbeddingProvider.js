"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeEmbeddingProvider = void 0;
class FakeEmbeddingProvider {
    async generate(text) {
        return Array.from({ length: 768 }, (_, index) => (text.length + index) / 1000);
    }
    async generateBatch(texts) {
        return Promise.all(texts.map(text => this.generate(text)));
    }
}
exports.FakeEmbeddingProvider = FakeEmbeddingProvider;
