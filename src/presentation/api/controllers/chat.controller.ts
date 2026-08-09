import type {

    Request,

    Response

} from "express";

import { AskQuestionUseCase } from "../../../application/use-cases/ask-question/ask-question.use-case";

import type {

    AskQuestionRequest

} from "../dto/askQuestionRequest";

import { ChatMapper } from "../mappers/chatMapper";

export class ChatController {

    constructor(

        private readonly useCase: AskQuestionUseCase

    ) {}

    ask = async (

        request: Request,

        response: Response

    ): Promise<void> => {

        const body =

            request.body as AskQuestionRequest;

        const result =

            await this.useCase.execute(

                body.gameId,

                body.question

            );

        response.json(

            ChatMapper.toResponse(

                result

            )

        );

    };

}