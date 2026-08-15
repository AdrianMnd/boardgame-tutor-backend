import bcrypt from "bcrypt";

// 12 es un equilibrio razonable en 2026: bastante coste como
// para que un ataque por fuerza bruta sea impracticable, sin
// hacer el registro/login perceptiblemente lento para una
// persona real (unas pocas décimas de segundo).
const SALT_ROUNDS = 12;

/**
 * Nunca se guarda ni se compara una contraseña en texto plano —
 * solo su hash. bcrypt incluye la "sal" (salt) dentro del propio
 * hash resultante, así que no hace falta guardarla aparte.
 */
export class PasswordHasher {

    async hash(

        password: string

    ): Promise<string> {

        return bcrypt.hash(

            password,

            SALT_ROUNDS

        );

    }

    async verify(

        password: string,

        hash: string

    ): Promise<boolean> {

        return bcrypt.compare(

            password,

            hash

        );

    }

}
