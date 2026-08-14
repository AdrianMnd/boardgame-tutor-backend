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

}
