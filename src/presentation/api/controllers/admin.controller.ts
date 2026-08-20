import type {
    Request,
    Response
} from "express";

import { ListGameRequestsUseCase } from "../../../application/use-cases/game-request/list-game-requests.use-case";
import { MarkGameRequestReviewedUseCase } from "../../../application/use-cases/game-request/mark-game-request-reviewed.use-case";
import { AdminResetPasswordUseCase } from "../../../application/use-cases/admin/admin-reset-password.use-case";
import { getParam } from "../utils/getParam";
import { BadRequestError } from "../errors/BadRequestError";

export class AdminController {

    constructor(

        private readonly listGameRequestsUseCase: ListGameRequestsUseCase,

        private readonly markGameRequestReviewedUseCase: MarkGameRequestReviewedUseCase,

        private readonly adminResetPasswordUseCase: AdminResetPasswordUseCase

    ) {}

    listGameRequests = async (

        _request: Request,

        response: Response

    ): Promise<void> => {

        const items =
            await this.listGameRequestsUseCase.execute();

        response.json(items);

    };

    markGameRequestReviewed = async (

        request: Request,

        response: Response

    ): Promise<void> => {

        await this.markGameRequestReviewedUseCase.execute(

            getParam(request, "id")

        );

        response.status(204).end();

    };

    resetUserPassword = async (

        request: Request,

        response: Response

    ): Promise<void> => {

        const body = request.body as { email?: unknown };

        if (typeof body.email !== "string" || body.email.trim() === "") {

            throw new BadRequestError(

                "Falta el campo obligatorio: email."

            );

        }

        const temporaryPassword =

            await this.adminResetPasswordUseCase.execute(

                body.email

            );

        response.json({ temporaryPassword });

    };

}
