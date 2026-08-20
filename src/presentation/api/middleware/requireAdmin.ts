import type {
    NextFunction,
    Request,
    Response
} from "express";

import { isAdminEmail } from "../../../config/admin";
import { UnauthorizedError } from "../errors/UnauthorizedError";

import type { IUserRepository } from "../../../domain/user/repositories/IUserRepository";
import type { AuthenticatedRequest } from "./requireAuth";

/**
 * Va DESPUÉS de requireAuth en la cadena de middlewares (necesita
 * userId ya resuelto). Consulta el email actual del usuario en
 * vez de fiarse de un dato guardado en el propio token — así, si
 * el administrador cambiara de email, el cambio se aplica sin
 * tener que esperar a que caduque ningún token antiguo.
 */
export function requireAdmin(

    userRepository: IUserRepository

) {

    return async (

        request: Request,

        _response: Response,

        next: NextFunction

    ): Promise<void> => {

        const { userId } = request as AuthenticatedRequest;

        const user = await userRepository.findById(userId);

        if (!user || !isAdminEmail(user.email)) {

            throw new UnauthorizedError(

                "No tienes permiso para acceder a esto."

            );

        }

        next();

    };

}
