"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextBuilder = void 0;
class ContextBuilder {
    build(chunks) {
        return chunks
            .map((chunk, index) => [
            `### Fragmento ${index + 1}`,
            `Página ${chunk.page}`,
            `Similitud: ${chunk.score.toFixed(3)}`,
            "",
            chunk.text
        ].join("\n"))
            .join("\n\n====================\n\n");
    }
}
exports.ContextBuilder = ContextBuilder;
