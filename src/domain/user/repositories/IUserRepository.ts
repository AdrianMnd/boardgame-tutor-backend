import type { User } from "../types/User";
import type { UserRecord } from "../types/UserRecord";

export interface IUserRepository {

    /**
     * Incluye el hash — pensado para el flujo de login, que
     * necesita compararlo contra la contraseña recibida.
     */
    findByEmailWithPassword(

        email: string

    ): Promise<UserRecord | null>;

    findById(

        id: string

    ): Promise<User | null>;

    /**
     * Devuelve null si el email ya existe — no lanza, para que
     * el caso de uso decida cómo comunicarlo (evita depender de
     * inspeccionar el tipo de error de Postgres).
     */
    create(

        email: string,

        passwordHash: string,

        displayName: string

    ): Promise<User | null>;

}
