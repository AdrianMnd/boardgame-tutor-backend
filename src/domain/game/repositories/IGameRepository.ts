import { ValidatedGame } from "../types/ValidatedGame";

export interface IGameRepository {

    list(): Promise<ValidatedGame[]>;

    findById(

        gameId: string

    ): Promise<ValidatedGame | null>;

}