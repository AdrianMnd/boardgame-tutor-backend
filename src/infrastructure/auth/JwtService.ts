import jwt from "jsonwebtoken";

import type { AuthConfiguration } from "../../config/auth";

export interface TokenPayload {

    userId: string;

}

export class InvalidTokenError extends Error {

    constructor() {

        super("Token inválido o caducado.");

    }

}

/**
 * Emite y valida los JWT que identifican a un usuario ya
 * autenticado. Se usa JWT (no sesiones con cookie) a propósito
 * — el mismo token sirve igual para el frontend web que para la
 * futura app de Android, sin ninguna complicación de cookies
 * entre orígenes distintos.
 */
export class JwtService {

    constructor(

        private readonly configuration: AuthConfiguration

    ) {}

    sign(

        payload: TokenPayload

    ): string {

        return jwt.sign(

            payload,

            this.configuration.jwtSecret,

            {

                expiresIn:
                    this.configuration.tokenExpiresIn as jwt.SignOptions["expiresIn"]

            }

        );

    }

    verify(

        token: string

    ): TokenPayload {

        try {

            const decoded =

                jwt.verify(

                    token,

                    this.configuration.jwtSecret

                );

            if (

                typeof decoded !== "object" ||
                decoded === null ||
                typeof (decoded as { userId?: unknown }).userId !== "string"

            ) {

                throw new InvalidTokenError();

            }

            return decoded as unknown as TokenPayload;

        }
        catch {

            throw new InvalidTokenError();

        }

    }

}
