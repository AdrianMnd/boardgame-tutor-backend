import type { User } from "./User";

/**
 * Igual que User, pero con el hash de la contraseña — solo debe
 * usarse dentro del flujo de login, para poder compararlo. Nunca
 * debe salir de la capa de aplicación hacia un DTO de respuesta.
 */
export interface UserRecord extends User {

    passwordHash: string;

}
