import { BadRequestError } from "../../../presentation/api/errors/BadRequestError";

import type {
    IMessageRatingRepository,
    MessageRatingInput
} from "../../../domain/rating/IMessageRatingRepository";

const MAX_TEXT_LENGTH = 4000;

export class RateMessageUseCase {

    constructor(

        private readonly repository: IMessageRatingRepository

    ) {}

    async execute(

        input: MessageRatingInput

    ): Promise<void> {

        if (!input.gameId.trim()) {

            throw new BadRequestError(

                "Falta el campo obligatorio: gameId."

            );

        }

        if (!input.question.trim() || !input.answer.trim()) {

            throw new BadRequestError(

                "Faltan la pregunta o la respuesta a valorar."

            );

        }

        if (input.rating !== "up" && input.rating !== "down") {

            throw new BadRequestError(

                "El valor de rating debe ser \"up\" o \"down\"."

            );

        }

        await this.repository.create({

            gameId: input.gameId,

            userId: input.userId,

            question: input.question.slice(0, MAX_TEXT_LENGTH),

            answer: input.answer.slice(0, MAX_TEXT_LENGTH),

            rating: input.rating

        });

    }

}
