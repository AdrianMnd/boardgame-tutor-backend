import type { IGameRepository } from "../../../domain/game/repositories/IGameRepository";
import type { ValidatedGame } from "../../../domain/game/types/ValidatedGame";

export class ListGamesUseCase {

    constructor(

        private readonly repository: IGameRepository

    ) {}

    async execute(): Promise<ValidatedGame[]> {

        return this.repository.list();

    }

}