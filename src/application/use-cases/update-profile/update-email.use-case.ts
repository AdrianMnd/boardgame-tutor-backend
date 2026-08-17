import { PasswordHasher } from "../../../infrastructure/auth/PasswordHasher";

import { BadRequestError } from "../../../presentation/api/errors/BadRequestError";
import { ConflictError } from "../../../presentation/api/errors/ConflictError";

import { verifyCurrentPassword } from "./verifyCurrentPassword";

import type { IUserRepository } from "../../../domain/user/repositories/IUserRepository";
import type { User } from "../../../domain/user/types/User";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class UpdateEmailUseCase {

    constructor(

        private readonly repository: IUserRepository,

        private readonly passwordHasher: PasswordHasher

    ) {}

    async execute(

        userId: string,

        newEmail: string,

        currentPassword: string

    ): Promise<User> {

        const trimmedEmail = newEmail.trim();

        if (!EMAIL_REGEX.test(trimmedEmail)) {

            throw new BadRequestError(

                "El email no tiene un formato válido."

            );

        }

        await verifyCurrentPassword(

            this.repository,

            this.passwordHasher,

            userId,

            currentPassword

        );

        const updated =

            await this.repository.updateEmail(

                userId,

                trimmedEmail

            );

        if (!updated) {

            throw new ConflictError(

                "Ya hay otra cuenta usando ese email."

            );

        }

        return updated;

    }

}
