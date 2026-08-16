import type {
    Request,
    Response
} from "express";

import { FavoritesUseCase } from "../../../application/use-cases/favorites/favorites.use-case";
import { getParam } from "../utils/getParam";

import type { AuthenticatedRequest } from "../middleware/requireAuth";

export class FavoritesController {

    constructor(

        private readonly useCase: FavoritesUseCase

    ) {}

    list = async (

        request: Request,

        response: Response

    ): Promise<void> => {

        const { userId } = request as AuthenticatedRequest;

        const gameIds =
            await this.useCase.list(userId);

        response.json({ gameIds });

    };

    add = async (

        request: Request,

        response: Response

    ): Promise<void> => {

        const { userId } = request as AuthenticatedRequest;

        await this.useCase.add(

            userId,

            getParam(request, "gameId")

        );

        response.status(204).end();

    };

    remove = async (

        request: Request,

        response: Response

    ): Promise<void> => {

        const { userId } = request as AuthenticatedRequest;

        await this.useCase.remove(

            userId,

            getParam(request, "gameId")

        );

        response.status(204).end();

    };

}
