"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetGameManualUseCase = void 0;
class GetGameManualUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(gameId) {
        const game = await this.repository.findById(gameId);
        if (!game) {
            return null;
        }
        return game.paths.rulebook;
    }
}
exports.GetGameManualUseCase = GetGameManualUseCase;
