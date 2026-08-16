import { PasswordHasher } from "../../../infrastructure/auth/PasswordHasher";
import { JwtService } from "../../../infrastructure/auth/JwtService";

import { ConflictError } from "../../../presentation/api/errors/ConflictError";
import { BadRequestError } from "../../../presentation/api/errors/BadRequestError";

import type { IUserRepository } from "../../../domain/user/repositories/IUserRepository";
import type { User } from "../../../domain/user/types/User";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MIN_PASSWORD_LENGTH = 8;

export interface RegisterResult {

    user: User;

    token: string;

}

export class RegisterUserUseCase {

    constructor(

        private readonly repository: IUserRepository,

        private readonly passwordHasher: PasswordHasher,

        private readonly jwtService: JwtService

    ) {}

    async execute(

        email: string,

        password: string,

        displayName: string

    ): Promise<RegisterResult> {

        const normalizedEmail = email.trim();

        const normalizedDisplayName = displayName.trim();

        if (!EMAIL_REGEX.test(normalizedEmail)) {

            throw new BadRequestError(

                "El email no tiene un formato válido."

            );

        }

        if (password.length < MIN_PASSWORD_LENGTH) {

            throw new BadRequestError(

                `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`

            );

        }

        if (normalizedDisplayName.length === 0) {

            throw new BadRequestError(

                "El nombre no puede estar vacío."

            );

        }

        const passwordHash =
            await this.passwordHasher.hash(password);

        const user =

            await this.repository.create(

                normalizedEmail,

                passwordHash,

                normalizedDisplayName

            );

        if (!user) {

            throw new ConflictError(

                "Ya existe una cuenta con ese email."

            );

        }

        const token =

            this.jwtService.sign({

                userId: user.id

            });

        return { user, token };

    }

}
