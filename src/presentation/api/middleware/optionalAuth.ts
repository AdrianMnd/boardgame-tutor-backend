import type {
    NextFunction,
    Request,
    Response
} from "express";

import { JwtService } from "../../../infrastructure/auth/JwtService";

import type { AuthenticatedRequest } from "./requireAuth";

/**
 * Igual que requireAuth, pero nunca rechaza la petición — si
 * hay un token válido, añade userId a la request (igual que
 * requireAuth); si no hay token, o es inválido/ha caducado,
 * simplemente sigue sin userId, tratando la petición como de
 * invitado. Pensado para endpoints donde la sesión es opcional
 * (por ejemplo, valorar una respuesta funciona con o sin cuenta,
 * pero si hay cuenta interesa saber de quién es).
 */
export function optionalAuth(

    jwtService: JwtService

) {

    return (

        request: Request,

        _response: Response,

        next: NextFunction

    ): void => {

        const header = request.headers.authorization;

        if (header?.startsWith("Bearer ")) {

            try {

                const payload =
                    jwtService.verify(

                        header.slice("Bearer ".length)

                    );

                (request as AuthenticatedRequest).userId =
                    payload.userId;

            }
            catch {

                // Token inválido o caducado — se sigue tratando
                // como invitado, sin lanzar ningún error.

            }

        }

        next();

    };

}
