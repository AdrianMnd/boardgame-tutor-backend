import { randomBytes } from "crypto";

import { NotFoundError } from "../../../presentation/api/errors/NotFoundError";

import type { IUserRepository } from "../../../domain/user/repositories/IUserRepository";
import type { PasswordHasher } from "../../../infrastructure/auth/PasswordHasher";

/**
 * Genera una contraseña temporal aleatoria — no una que elija el
 * administrador a mano, para que sea imposible de adivinar y no
 * dependa de que se le ocurra algo razonablemente seguro en el
 * momento. Se comunica una única vez, por el canal personal del
 * administrador (nunca por la app) — quien la reciba debería
 * cambiarla por una propia desde "Editar perfil" en cuanto entre.
 */
function generateTemporaryPassword(): string {

    return randomBytes(9).toString("base64url");

}

export class AdminResetPasswordUseCase {

    constructor(

        private readonly userRepository: IUserRepository,

        private readonly passwordHasher: PasswordHasher

    ) {}

    async execute(

        email: string

    ): Promise<string> {

        const user =
            await this.userRepository.findByEmailWithPassword(

                email.trim()

            );

        if (!user) {

            throw new NotFoundError(

                "No existe ninguna cuenta con ese email."

            );

        }

        const temporaryPassword =
            generateTemporaryPassword();

        const passwordHash =
            await this.passwordHasher.hash(temporaryPassword);

        await this.userRepository.updatePasswordHash(

            user.id,

            passwordHash

        );

        return temporaryPassword;

    }

}
