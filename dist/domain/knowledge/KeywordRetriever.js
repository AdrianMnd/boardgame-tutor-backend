"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeywordRetriever = void 0;
class KeywordRetriever {
    fileSystem;
    configuration;
    constructor(fileSystem, configuration) {
        this.fileSystem = fileSystem;
        this.configuration = configuration;
    }
    async retrieve(game, question, _embedding) {
        const knowledge = await this.fileSystem.readJson(game.paths.knowledge);
        const words = question
            .toLowerCase()
            .split(/\W+/)
            .filter(word => word.length > 2);
        const results = knowledge.chunks
            .map(chunk => {
            const text = chunk.text.toLowerCase();
            let score = 0;
            for (const word of words) {
                if (text.includes(word)) {
                    score++;
                }
            }
            return {
                id: chunk.id,
                gameId: chunk.gameId,
                page: chunk.page,
                text: chunk.text,
                score
            };
        })
            .filter(chunk => chunk.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, this.configuration.maxRetrievedChunks);
        return results;
    }
}
exports.KeywordRetriever = KeywordRetriever;
