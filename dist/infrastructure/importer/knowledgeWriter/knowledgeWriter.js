"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeWriter = void 0;
class KnowledgeWriter {
    fileSystem;
    embeddingModel;
    constructor(fileSystem, embeddingModel) {
        this.fileSystem = fileSystem;
        this.embeddingModel = embeddingModel;
    }
    async write(game, chunks) {
        const knowledge = {
            gameId: game.metadata.id,
            createdAt: new Date().toISOString(),
            totalChunks: chunks.length,
            embeddingModel: this.embeddingModel,
            chunks
        };
        await this.fileSystem.writeJson(game.paths.knowledge, knowledge);
    }
}
exports.KnowledgeWriter = KnowledgeWriter;
