import type {
    NextFunction,
    Request,
    Response
} from "express";

import { JwtService } from "../../../infrastructure/auth/JwtService";
import { UnauthorizedError } from "../errors/UnauthorizedError";

export interface AuthenticatedRequest extends Request {

    userId: string;

}

export function requireAuth(

    jwtService: JwtService

) {

    return (

        request: Request,

        _response: Response,

        next: NextFunction

    ): void => {

        const header = request.headers.authorization;

        if (!header?.startsWith("Bearer ")) {

            throw new UnauthorizedError(

                "Falta el token de autenticación."

            );

        }

        const token = header.slice("Bearer ".length);

        const payload =

            (() => {

                try {

                    return jwtService.verify(token);

                }
                catch {

                    throw new UnauthorizedError(

                        "Token inválido o caducado. Vuelve a iniciar sesión."

                    );

                }

            })();

        (request as AuthenticatedRequest).userId =
            payload.userId;

        next();

    };

}
