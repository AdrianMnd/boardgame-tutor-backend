import { randomUUID } from "crypto";

import { EmailService } from "../../../infrastructure/email/EmailService";

import { BadRequestError } from "../../../presentation/api/errors/BadRequestError";

import type { IFileStorage } from "../../../shared/contracts/IFileStorage";

const MAX_GAME_NAME_LENGTH = 150;

const SIGNED_URL_EXPIRES_SECONDS = 60 * 60 * 24 * 7;

export interface GameRequestFile {

    originalName: string;

    buffer: Buffer;

    contentType: string;

}

export interface GameRequestInput {

    requesterName: string;

    requesterEmail: string;

    gameName: string;

    bggUrl?: string;

    files: GameRequestFile[];

}

export class GameRequestUseCase {

    constructor(

        private readonly storage: IFileStorage,

        private readonly emailService: EmailService

    ) {}

    async execute(

        input: GameRequestInput

    ): Promise<void> {

        const gameName = input.gameName.trim();

        if (gameName.length === 0) {

            throw new BadRequestError(

                "El nombre del juego no puede estar vacío."

            );

        }

        if (gameName.length > MAX_GAME_NAME_LENGTH) {

            throw new BadRequestError(

                `El nombre del juego no puede tener más de ${MAX_GAME_NAME_LENGTH} caracteres.`

            );

        }

        const bggUrl = input.bggUrl?.trim() || undefined;

        if (bggUrl && !bggUrl.includes("boardgamegeek.com")) {

            throw new BadRequestError(

                "El enlace no parece ser de BoardGameGeek."

            );

        }

        const requestId = randomUUID();

        const pdfLinks: string[] = [];

        for (const file of input.files) {

            const key =
                `pending-requests/${requestId}/${file.originalName}`;

            await this.storage.upload(

                key,

                file.buffer,

                file.contentType

            );

            const signedUrl =

                await this.storage.getSignedDownloadUrl(

                    key,

                    SIGNED_URL_EXPIRES_SECONDS

                );

            pdfLinks.push(signedUrl);

        }

        await this.emailService.sendGameRequestNotification({

            requesterName: input.requesterName,

            requesterEmail: input.requesterEmail,

            gameName,

            bggUrl,

            pdfLinks

        });

    }

}
