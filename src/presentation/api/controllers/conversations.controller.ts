import type {
    Request,
    Response
} from "express";

import { ConversationsUseCase } from "../../../application/use-cases/conversations/conversations.use-case";
import { BadRequestError } from "../errors/BadRequestError";
import { getParam } from "../utils/getParam";

import type { AuthenticatedRequest } from "../middleware/requireAuth";

export class ConversationsController {

    constructor(

        private readonly useCase: ConversationsUseCase

    ) {}

    list = async (

        request: Request,

        response: Response

    ): Promise<void> => {

        const { userId } = request as AuthenticatedRequest;

        const messages =

            await this.useCase.listMessages(

                userId,

                getParam(request, "gameId")

            );

        response.json(messages);

    };

    addMessage = async (

        request: Request,

        response: Response

    ): Promise<void> => {

        const { userId } = request as AuthenticatedRequest;

        const body = request.body as {

            role?: unknown;

            content?: unknown;

            sources?: unknown;

        };

        if (

            (body.role !== "user" && body.role !== "assistant") ||
            typeof body.content !== "string"

        ) {

            throw new BadRequestError(

                "Faltan campos obligatorios: role (\"user\"|\"assistant\"), content."

            );

        }

        const message =

            await this.useCase.addMessage(

                userId,

                getParam(request, "gameId"),

                body.role,

                body.content,

                body.sources

            );

        response.status(201).json(message);

    };

    clear = async (

        request: Request,

        response: Response

    ): Promise<void> => {

        const { userId } = request as AuthenticatedRequest;

        await this.useCase.clearConversation(

            userId,

            getParam(request, "gameId")

        );

        response.status(204).end();

    };

}
