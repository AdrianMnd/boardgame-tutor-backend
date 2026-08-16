export interface AuthConfiguration {

    jwtSecret: string;

    tokenExpiresIn: string;

}

function requireEnv(

    name: string

): string {

    const value = process.env[name];

    if (!value) {

        throw new Error(

            `Falta la variable de entorno ${name} — revisa tu .env.`

        );

    }

    return value;

}

export function loadAuthConfiguration(): AuthConfiguration {

    const jwtSecret =
        requireEnv("JWT_SECRET");

    // Un secreto corto o predecible invalida toda la seguridad
    // del sistema de login, así que se rechaza pronto y con un
    // mensaje claro en vez de dejar arrancar el servidor con un
    // secreto débil. 32 caracteres es el mínimo razonable para
    // un HMAC-SHA256 (el algoritmo que usa jsonwebtoken por
    // defecto).
    if (jwtSecret.length < 32) {

        throw new Error(

            "JWT_SECRET es demasiado corto (mínimo 32 caracteres) — " +
            "genera uno seguro con, por ejemplo: " +
            "node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""

        );

    }

    return {

        jwtSecret,

        tokenExpiresIn:
            process.env.JWT_EXPIRES_IN || "30d"

    };

}
