import type {
    Request,
    Response
} from "express";

import { ListGameRequestsUseCase } from "../../../application/use-cases/game-request/list-game-requests.use-case";
import { MarkGameRequestReviewedUseCase } from "../../../application/use-cases/game-request/mark-game-request-reviewed.use-case";
import { ClearGameRequestsUseCase } from "../../../application/use-cases/game-request/clear-game-requests.use-case";
import { AdminResetPasswordUseCase } from "../../../application/use-cases/admin/admin-reset-password.use-case";
import { GetRatingsSummaryUseCase } from "../../../application/use-cases/rating/get-ratings-summary.use-case";
import { ClearRatingsUseCase } from "../../../application/use-cases/rating/clear-ratings.use-case";
import { ListPasswordResetRequestsUseCase } from "../../../application/use-cases/password-reset-request/list-password-reset-requests.use-case";
import { MarkPasswordResetRequestResolvedUseCase } from "../../../application/use-cases/password-reset-request/mark-password-reset-request-resolved.use-case";
import { getParam } from "../utils/getParam";
import { BadRequestError } from "../errors/BadRequestError";

export class AdminController {

    constructor(

        private readonly listGameRequestsUseCase: ListGameRequestsUseCase,

        private readonly markGameRequestReviewedUseCase: MarkGameRequestReviewedUseCase,

        private readonly clearGameRequestsUseCase: ClearGameRequestsUseCase,

        private readonly adminResetPasswordUseCase: AdminResetPasswordUseCase,

        private readonly getRatingsSummaryUseCase: GetRatingsSummaryUseCase,

        private readonly clearRatingsUseCase: ClearRatingsUseCase,

        private readonly listPasswordResetRequestsUseCase: ListPasswordResetRequestsUseCase,

        private readonly markPasswordResetRequestResolvedUseCase: MarkPasswordResetRequestResolvedUseCase

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

    clearGameRequests = async (

        _request: Request,

        response: Response

    ): Promise<void> => {

        await this.clearGameRequestsUseCase.execute();

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

    getRatingsSummary = async (

        _request: Request,

        response: Response

    ): Promise<void> => {

        const summary =
            await this.getRatingsSummaryUseCase.execute();

        response.json(summary);

    };

    clearRatings = async (

        _request: Request,

        response: Response

    ): Promise<void> => {

        await this.clearRatingsUseCase.execute();

        response.status(204).end();

    };

    listPasswordResetRequests = async (

        _request: Request,

        response: Response

    ): Promise<void> => {

        const items =
            await this.listPasswordResetRequestsUseCase.execute();

        response.json(items);

    };

    markPasswordResetRequestResolved = async (

        request: Request,

        response: Response

    ): Promise<void> => {

        await this.markPasswordResetRequestResolvedUseCase.execute(

            getParam(request, "id")

        );

        response.status(204).end();

    };

}
