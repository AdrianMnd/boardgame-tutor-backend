import { IGameRepository } from "../../../domain/game/repositories/IGameRepository";

export class GetGameManualUseCase {

    constructor(
        private readonly repository: IGameRepository
    ) {}

    async execute(
        gameId: string
    ): Promise<string | null> {

        const game =
            await this.repository.findById(
                gameId
            );

        if (!game) {

            return null;

        }

        return game.paths.rulebook;

    }

}