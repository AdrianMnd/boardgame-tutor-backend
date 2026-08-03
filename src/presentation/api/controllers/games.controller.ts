import type {

    Request,

    Response

} from "express";

import { ListGamesUseCase } from "../../../application/use-cases/list-games/list-games.use-case";

import { GameMapper } from "../mappers/gameMapper";

export class GamesController {

    constructor(

        private readonly useCase: ListGamesUseCase

    ) {}

    getGames = async (

        _request: Request,

        response: Response

    ): Promise<void> => {

        const games =

            await this.useCase.execute();

        response.json(

            GameMapper.toResponses(

                games

            )

        );

    };

}