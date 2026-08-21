import type {
    Request,
    Response
} from "express";

import { GameRequestUseCase } from "../../../application/use-cases/game-request/game-request.use-case";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";

import type { IUserRepository } from "../../../domain/user/repositories/IUserRepository";
import type { AuthenticatedRequest } from "../middleware/requireAuth";

interface RequestWithFiles extends Request {

    files?: {

        pdfs?: Express.Multer.File[];

        cover?: Express.Multer.File[];

    };

}

export class GameRequestController {

    constructor(

        private readonly useCase: GameRequestUseCase,

        private readonly userRepository: IUserRepository

    ) {}

    submit = async (

        request: Request,

        response: Response

    ): Promise<void> => {

        const { userId } = request as AuthenticatedRequest;

        const user =
            await this.userRepository.findById(userId);

        if (!user) {

            throw new NotFoundError(

                "El usuario de este token ya no existe."

            );

        }

        const body = request.body as {

            gameName?: unknown;

            bggUrl?: unknown;

        };

        if (typeof body.gameName !== "string") {

            throw new BadRequestError(

                "Falta el campo obligatorio: gameName."

            );

        }

        const files =
            (request as RequestWithFiles).files?.pdfs ?? [];

        const coverFile =
            (request as RequestWithFiles).files?.cover?.[0];

        await this.useCase.execute({

            requesterName: user.displayName,

            requesterEmail: user.email,

            gameName: body.gameName,

            bggUrl:

                typeof body.bggUrl === "string"
                    ? body.bggUrl
                    : undefined,

            files:

                files.map(file => ({

                    originalName: file.originalname,

                    buffer: file.buffer,

                    contentType: file.mimetype

                })),

            coverFile:

                coverFile

                    ? {

                        originalName: coverFile.originalname,

                        buffer: coverFile.buffer,

                        contentType: coverFile.mimetype

                    }

                    : undefined

        });

        response.status(204).end();

    };

}
