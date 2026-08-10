"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChunkGenerator = void 0;
class ChunkGenerator {
    chunkSize;
    overlap;
    constructor(chunkSize = 600, overlap = 100) {
        this.chunkSize = chunkSize;
        this.overlap = overlap;
    }
    generate(gameId, document) {
        const chunks = [];
        for (const page of document.pages) {
            let start = 0;
            let index = 1;
            while (start < page.text.length) {
                const end = Math.min(start + this.chunkSize, page.text.length);
                const text = page.text
                    .slice(start, end)
                    .trim();
                if (text.length > 0) {
                    chunks.push({
                        id: `${gameId}-p${page.page}-c${index}`,
                        gameId,
                        page: page.page,
                        index,
                        text
                    });
                }
                if (end >= page.text.length) {
                    break;
                }
                start =
                    end - this.overlap;
                index++;
            }
        }
        return chunks;
    }
}
exports.ChunkGenerator = ChunkGenerator;
