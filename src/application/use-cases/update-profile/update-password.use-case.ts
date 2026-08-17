import { PasswordHasher } from "../../../infrastructure/auth/PasswordHasher";

import { BadRequestError } from "../../../presentation/api/errors/BadRequestError";

import { verifyCurrentPassword } from "./verifyCurrentPassword";

import type { IUserRepository } from "../../../domain/user/repositories/IUserRepository";

const MIN_PASSWORD_LENGTH = 8;

export class UpdatePasswordUseCase {

    constructor(

        private readonly repository: IUserRepository,

        private readonly passwordHasher: PasswordHasher

    ) {}

    async execute(

        userId: string,

        currentPassword: string,

        newPassword: string

    ): Promise<void> {

        if (newPassword.length < MIN_PASSWORD_LENGTH) {

            throw new BadRequestError(

                `La contraseña nueva debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`

            );

        }

        await verifyCurrentPassword(

            this.repository,

            this.passwordHasher,

            userId,

            currentPassword

        );

        const newPasswordHash =
            await this.passwordHasher.hash(newPassword);

        await this.repository.updatePasswordHash(

            userId,

            newPasswordHash

        );

    }

}
