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
     * Igual que findByEmailWithPassword, pero por id — para
     * verificar la contraseña actual antes de dejar cambiar el
     * email o la propia contraseña.
     */
    findByIdWithPassword(

        id: string

    ): Promise<UserRecord | null>;

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

    updateDisplayName(

        id: string,

        displayName: string

    ): Promise<User>;

    /**
     * Igual que create, devuelve null si el email ya está en
     * uso por OTRA cuenta, en vez de lanzar.
     */
    updateEmail(

        id: string,

        email: string

    ): Promise<User | null>;

    updatePasswordHash(

        id: string,

        passwordHash: string

    ): Promise<void>;

}
