import type {
    Request,
    Response
} from "express";

import { RateMessageUseCase } from "../../../application/use-cases/rating/rate-message.use-case";
import { BadRequestError } from "../errors/BadRequestError";

import type { AuthenticatedRequest } from "../middleware/requireAuth";

export class RatingController {

    constructor(

        private readonly useCase: RateMessageUseCase

    ) {}

    rate = async (

        request: Request,

        response: Response

    ): Promise<void> => {

        const { userId } = request as Partial<AuthenticatedRequest>;

        const body = request.body as {

            gameId?: unknown;

            question?: unknown;

            answer?: unknown;

            rating?: unknown;

        };

        if (

            typeof body.gameId !== "string" ||
            typeof body.question !== "string" ||
            typeof body.answer !== "string" ||
            typeof body.rating !== "string"

        ) {

            throw new BadRequestError(

                "Faltan campos obligatorios: gameId, question, answer, rating."

            );

        }

        await this.useCase.execute({

            gameId: body.gameId,

            userId,

            question: body.question,

            answer: body.answer,

            rating: body.rating as "up" | "down"

        });

        response.status(204).end();

    };

}
