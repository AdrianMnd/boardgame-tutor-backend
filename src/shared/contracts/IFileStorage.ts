export interface IFileStorage {

    upload(

        key: string,

        content: Buffer,

        contentType: string

    ): Promise<void>;

    download(

        key: string

    ): Promise<{

        content: Buffer;

        contentType: string;

    }>;

    exists(

        key: string

    ): Promise<boolean>;

    /**
     * Enlace de descarga temporal (el cubo es privado, así que
     * no hay URL pública fija) — pensado para incluir en el
     * correo de solicitud de un juego nuevo, donde hace falta un
     * enlace en el que se pueda simplemente clicar, sin pasar
     * por el backend de por medio.
     */
    getSignedDownloadUrl(

        key: string,

        expiresInSeconds: number

    ): Promise<string>;

}
