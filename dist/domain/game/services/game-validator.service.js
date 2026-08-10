"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameValidator = void 0;
class GameValidator {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async validate(gameId) {
        const game = await this.repository.findById(gameId);
        if (!game) {
            throw new Error(`El juego "${gameId}" no existe.`);
        }
        return game;
    }
}
exports.GameValidator = GameValidator;
