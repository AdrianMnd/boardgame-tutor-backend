import type {
    Request,
    Response
} from "express";

import { RequestPasswordResetUseCase } from "../../../application/use-cases/password-reset-request/request-password-reset.use-case";
import { BadRequestError } from "../errors/BadRequestError";

export class PasswordResetRequestController {

    constructor(

        private readonly useCase: RequestPasswordResetUseCase

    ) {}

    request = async (

        request: Request,

        response: Response

    ): Promise<void> => {

        const body = request.body as { email?: unknown };

        if (typeof body.email !== "string") {

            throw new BadRequestError(

                "Falta el campo obligatorio: email."

            );

        }

        await this.useCase.execute(body.email);

        response.status(204).end();

    };

}
