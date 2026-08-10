"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListGamesUseCase = void 0;
class ListGamesUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute() {
        return this.repository.list();
    }
}
exports.ListGamesUseCase = ListGamesUseCase;
