import { BadRequestError } from "../../../presentation/api/errors/BadRequestError";

import type { IPasswordResetRequestRepository } from "../../../domain/passwordResetRequest/IPasswordResetRequestRepository";

// Comprobación laxa a propósito — solo para descartar valores
// claramente inválidos, no para validar un email "de verdad"
// (eso ya lo hace, indirectamente, el que el admin no encuentre
// la cuenta al intentar restablecer la contraseña).
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export class RequestPasswordResetUseCase {

    constructor(

        private readonly repository: IPasswordResetRequestRepository

    ) {}

    async execute(

        email: string

    ): Promise<void> {

        const trimmed = email.trim();

        if (!EMAIL_PATTERN.test(trimmed)) {

            throw new BadRequestError(

                "El email no parece válido."

            );

        }

        // No se comprueba si existe una cuenta con este email —
        // hacerlo revelaría qué emails están registrados, el
        // mismo motivo por el que /api/auth/login da el mismo
        // error tanto si el email no existe como si la
        // contraseña es incorrecta.
        await this.repository.create(trimmed);

    }

}
