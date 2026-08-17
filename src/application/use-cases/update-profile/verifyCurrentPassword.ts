import { PasswordHasher } from "../../../infrastructure/auth/PasswordHasher";
import { UnauthorizedError } from "../../../presentation/api/errors/UnauthorizedError";

import type { IUserRepository } from "../../../domain/user/repositories/IUserRepository";
import type { UserRecord } from "../../../domain/user/types/UserRecord";

/**
 * Comprueba la contraseña actual antes de dejar cambiar el
 * email o la propia contraseña — usada tanto por
 * UpdateEmailUseCase como por UpdatePasswordUseCase, para que
 * ambos verifiquen exactamente de la misma forma (evita que la
 * lógica de seguridad diverja sutilmente entre los dos si algún
 * día hay que tocarla).
 */
export async function verifyCurrentPassword(

    repository: IUserRepository,

    passwordHasher: PasswordHasher,

    userId: string,

    currentPassword: string

): Promise<UserRecord> {

    const record =
        await repository.findByIdWithPassword(userId);

    if (!record) {

        throw new UnauthorizedError(

            "No se pudo verificar tu identidad."

        );

    }

    const matches =

        await passwordHasher.verify(

            currentPassword,

            record.passwordHash

        );

    if (!matches) {

        throw new UnauthorizedError(

            "La contraseña actual no es correcta."

        );

    }

    return record;

}
