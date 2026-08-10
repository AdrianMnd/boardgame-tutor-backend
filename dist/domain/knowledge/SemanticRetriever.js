"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemanticRetriever = void 0;
const SimilarityCalculator_1 = require("./SimilarityCalculator");
class SemanticRetriever {
    fileSystem;
    configuration;
    similarity = new SimilarityCalculator_1.SimilarityCalculator();
    constructor(fileSystem, configuration) {
        this.fileSystem = fileSystem;
        this.configuration = configuration;
    }
    async retrieve(game, _question, embedding) {
        const knowledge = await this.fileSystem.readJson(game.paths.knowledge);
        const results = knowledge.chunks.map(chunk => ({
            id: chunk.id,
            gameId: chunk.gameId,
            page: chunk.page,
            text: chunk.text,
            score: this.similarity.calculate(embedding, chunk.embedding)
        }));
        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, this.configuration.maxRetrievedChunks);
    }
}
exports.SemanticRetriever = SemanticRetriever;
