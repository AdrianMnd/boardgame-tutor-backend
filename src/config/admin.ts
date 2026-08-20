/**
 * Único administrador de la aplicación, identificado por email —
 * no hay roles ni permisos más finos porque no hacen falta
 * todavía: solo una persona gestiona el panel de solicitudes de
 * juegos. Si algún día hace falta más de un admin, esto es el
 * único sitio a tocar.
 */
export function isAdminEmail(

    email: string

): boolean {

    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {

        return false;

    }

    return (

        email.trim().toLowerCase() ===
        adminEmail.trim().toLowerCase()

    );

}
