import { IGameRepository } from "../repositories/IGameRepository";
import { ValidatedGame } from "../types/ValidatedGame";

export class GameValidator {

    constructor(

        private readonly repository: IGameRepository

    ) {}

    async validate(

        gameId: string

    ): Promise<ValidatedGame> {

        const game =
            await this.repository.findById(
                gameId
            );

        if (!game) {

            throw new Error(

                `El juego "${gameId}" no existe.`

            );

        }

        return game;

    }

}