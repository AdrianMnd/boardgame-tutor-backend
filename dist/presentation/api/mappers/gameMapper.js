"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameMapper = void 0;
const BASE_URL = process.env.API_PUBLIC_URL
    ?? process.env.RENDER_EXTERNAL_URL
    ?? `http://localhost:${process.env.PORT ?? 3000}`;
class GameMapper {
    static toResponse(game) {
        return {
            id: game.metadata.id,
            name: game.metadata.name,
            language: game.metadata.language,
            version: game.metadata.version,
            minPlayers: game.metadata.minPlayers,
            maxPlayers: game.metadata.maxPlayers,
            year: game.metadata.year,
            coverUrl: `${BASE_URL}/games/${game.metadata.id}/assets/cover.png`
        };
    }
    static toResponses(games) {
        return games.map(GameMapper.toResponse);
    }
}
exports.GameMapper = GameMapper;
