import type {
    Request,
    Response
} from "express";

import { CategoriesUseCase } from "../../../application/use-cases/categories/categories.use-case";
import { BadRequestError } from "../errors/BadRequestError";
import { getParam } from "../utils/getParam";

import type { AuthenticatedRequest } from "../middleware/requireAuth";

export class CategoriesController {

    constructor(

        private readonly useCase: CategoriesUseCase

    ) {}

    list = async (

        request: Request,

        response: Response

    ): Promise<void> => {

        const { userId } = request as AuthenticatedRequest;

        const categories =
            await this.useCase.list(userId);

        response.json(categories);

    };

    create = async (

        request: Request,

        response: Response

    ): Promise<void> => {

        const { userId } = request as AuthenticatedRequest;

        const body = request.body as { name?: unknown };

        if (typeof body.name !== "string") {

            throw new BadRequestError(

                "Falta el campo obligatorio: name."

            );

        }

        const category =

            await this.useCase.create(

                userId,

                body.name

            );

        response.status(201).json(category);

    };

    rename = async (

        request: Request,

        response: Response

    ): Promise<void> => {

        const { userId } = request as AuthenticatedRequest;

        const body = request.body as { name?: unknown };

        if (typeof body.name !== "string") {

            throw new BadRequestError(

                "Falta el campo obligatorio: name."

            );

        }

        await this.useCase.rename(

            userId,

            getParam(request, "categoryId"),

            body.name

        );

        response.status(204).end();

    };

    delete = async (

        request: Request,

        response: Response

    ): Promise<void> => {

        const { userId } = request as AuthenticatedRequest;

        await this.useCase.delete(

            userId,

            getParam(request, "categoryId")

        );

        response.status(204).end();

    };

    addGame = async (

        request: Request,

        response: Response

    ): Promise<void> => {

        const { userId } = request as AuthenticatedRequest;

        await this.useCase.addGame(

            userId,

            getParam(request, "categoryId"),

            getParam(request, "gameId")

        );

        response.status(204).end();

    };

    removeGame = async (

        request: Request,

        response: Response

    ): Promise<void> => {

        const { userId } = request as AuthenticatedRequest;

        await this.useCase.removeGame(

            userId,

            getParam(request, "categoryId"),

            getParam(request, "gameId")

        );

        response.status(204).end();

    };

}
