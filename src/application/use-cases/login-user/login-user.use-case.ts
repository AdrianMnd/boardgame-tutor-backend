import { PasswordHasher } from "../../../infrastructure/auth/PasswordHasher";
import { JwtService } from "../../../infrastructure/auth/JwtService";

import { UnauthorizedError } from "../../../presentation/api/errors/UnauthorizedError";

import type { IUserRepository } from "../../../domain/user/repositories/IUserRepository";
import type { User } from "../../../domain/user/types/User";

export interface LoginResult {

    user: User;

    token: string;

}

// Mismo mensaje tanto si el email no existe como si la
// contraseña es incorrecta — si fueran distintos, cualquiera
// podría usar el formulario de login para averiguar qué emails
// tienen cuenta en la app, probando uno a uno.
const INVALID_CREDENTIALS_MESSAGE =
    "Email o contraseña incorrectos.";

// Hash de relleno, de una contraseña que nunca se usa de
// verdad — se compara contra él cuando el email no existe, para
// que verificar una contraseña tarde siempre un tiempo similar
// tanto si el email existe como si no. Sin esto, alguien podría
// distinguir "el email no existe" (respuesta rápida, sin
// comparar hash) de "la contraseña es incorrecta" (respuesta
// más lenta, sí compara) simplemente midiendo cuánto tarda cada
// intento.
const DUMMY_HASH =
    "$2b$12$CwTycUXWue0Thq9StjUM0uJ8i8Zg0EK.Vh1KaP0y0nJ4M9E9pKzYm";

export class LoginUserUseCase {

    constructor(

        private readonly repository: IUserRepository,

        private readonly passwordHasher: PasswordHasher,

        private readonly jwtService: JwtService

    ) {}

    async execute(

        email: string,

        password: string

    ): Promise<LoginResult> {

        const record =

            await this.repository.findByEmailWithPassword(

                email.trim()

            );

        const passwordMatches =

            await this.passwordHasher.verify(

                password,

                record?.passwordHash ?? DUMMY_HASH

            );

        if (!record || !passwordMatches) {

            throw new UnauthorizedError(

                INVALID_CREDENTIALS_MESSAGE

            );

        }

        const token =

            this.jwtService.sign({

                userId: record.id

            });

        const { passwordHash: _passwordHash, ...user } = record;

        return { user: user as User, token };

    }

}
