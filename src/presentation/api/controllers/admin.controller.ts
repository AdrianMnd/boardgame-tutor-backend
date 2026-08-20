import type {
    Request,
    Response
} from "express";

import { ListGameRequestsUseCase } from "../../../application/use-cases/game-request/list-game-requests.use-case";
import { MarkGameRequestReviewedUseCase } from "../../../application/use-cases/game-request/mark-game-request-reviewed.use-case";
import { getParam } from "../utils/getParam";

export class AdminController {

    constructor(

        private readonly listGameRequestsUseCase: ListGameRequestsUseCase,

        private readonly markGameRequestReviewedUseCase: MarkGameRequestReviewedUseCase

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

}
