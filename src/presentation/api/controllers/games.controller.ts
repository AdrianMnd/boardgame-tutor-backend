import type {
    Request,
    Response
} from "express";

import { ListGamesUseCase } from "../../../application/use-cases/list-games/list-games.use-case";

import { GetGameManualUseCase } from "../../../application/use-cases/get-game-manual/get-game-manual.use-case";

import type { IGameRepository } from "../../../domain/game/repositories/IGameRepository";
import type { IFileStorage } from "../../../shared/contracts/IFileStorage";

import { GameMapper } from "../mappers/gameMapper";

export class GamesController {

    constructor(

        private readonly useCase: ListGamesUseCase,

        private readonly getGameManualUseCase: GetGameManualUseCase,

        private readonly repository: IGameRepository,

        private readonly storage: IFileStorage

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

        const manual =

            await this.getGameManualUseCase.execute(

                id,

                documentId

            );

        if (!manual) {

            response
                .status(404)
                .json({

                    message:
                        "Juego o documento no encontrado"

                });

            return;

        }

        response

            .setHeader(

                "Content-Type",

                manual.contentType

            )

            .send(

                manual.content

            );

    };

    getCover = async (

        request: Request,

        response: Response

    ): Promise<void> => {

        const id = request.params.id;

        if (typeof id !== "string") {

            response
                .status(400)
                .end();

            return;

        }

        const game =

            await this.repository.findById(

                id

            );

        if (!game?.coverPath) {

            response
                .status(404)
                .end();

            return;

        }

        try {

            const cover =

                await this.storage.download(

                    game.coverPath

                );

            response

                .setHeader(

                    "Content-Type",

                    cover.contentType

                )

                .setHeader(

                    "Cache-Control",

                    "public, max-age=86400"

                )

                .send(

                    cover.content

                );

        }
        catch {

            response
                .status(404)
                .end();

        }

    };

}
