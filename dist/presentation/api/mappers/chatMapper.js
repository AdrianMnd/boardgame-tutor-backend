"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMapper = void 0;
class ChatMapper {
    static toResponse(result) {
        return {
            answer: result.answer,
            sources: result.sources.map(source => ({
                id: source.id,
                gameId: source.gameId,
                page: source.page,
                text: source.text,
                score: Number(source.score.toFixed(3))
            }))
        };
    }
}
exports.ChatMapper = ChatMapper;
