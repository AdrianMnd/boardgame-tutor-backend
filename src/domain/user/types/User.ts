/**
 * El usuario tal como se expone al resto de la app — nunca
 * incluye el hash de la contraseña. Para el flujo de login, que
 * sí necesita comparar contra el hash, ver UserRecord.
 */
export interface User {

    id: string;

    email: string;

    displayName: string;

    createdAt: string;

}
