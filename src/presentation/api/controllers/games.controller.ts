import type {
    Request,
    Response
} from "express";

import { ListGamesUseCase } from "../../../application/use-cases/list-games/list-games.use-case";

import { GetGameManualUseCase } from "../../../application/use-cases/get-game-manual/get-game-manual.use-case";

import { GameMapper } from "../mappers/gameMapper";

export class GamesController {

    constructor(

        private readonly useCase: ListGamesUseCase,

        private readonly getGameManualUseCase: GetGameManualUseCase

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

    getManual = async (

    request: Request,

    response: Response

): Promise<void> => {

    const id = request.params.id;

    if (typeof id !== "string") {

        response
            .status(400)
            .json({

                message:
                    "Identificador de juego inválido"

            });

        return;

    }

    const documentId =

        typeof request.query.document === "string"

            ? request.query.document

            : undefined;

    const manualPath =

        await this.getGameManualUseCase.execute(

            id,

            documentId

        );

    if (!manualPath) {

        response
            .status(404)
            .json({

                message:
                    "Juego o documento no encontrado"

            });

        return;

    }

    response.sendFile(

        manualPath,

        error => {

            if (error && !response.headersSent) {

                response
                    .status(404)
                    .json({

                        message:
                            "Reglamento no encontrado"

                    });

            }

        }

    );

};

}