import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    HeadObjectCommand
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import type { IFileStorage } from "../../shared/contracts/IFileStorage";
import type { StorageConfiguration } from "../../config/storage";

export class B2FileStorage
    implements IFileStorage {

    private readonly client: S3Client;

    private readonly bucket: string;

    constructor(

        configuration: StorageConfiguration

    ) {

        this.bucket = configuration.bucket;

        this.client = new S3Client({

            endpoint: configuration.endpoint,

            region: "auto",

            forcePathStyle: configuration.forcePathStyle,

            credentials: {

                accessKeyId: configuration.accessKeyId,

                secretAccessKey: configuration.secretAccessKey

            }

        });

    }

    async upload(

        key: string,

        content: Buffer,

        contentType: string

    ): Promise<void> {

        await this.client.send(

            new PutObjectCommand({

                Bucket: this.bucket,

                Key: key,

                Body: content,

                ContentType: contentType

            })

        );

    }

    async download(

        key: string

    ): Promise<{

        content: Buffer;

        contentType: string;

    }> {

        const response =

            await this.client.send(

                new GetObjectCommand({

                    Bucket: this.bucket,

                    Key: key

                })

            );

        const chunks: Buffer[] = [];

        for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {

            chunks.push(Buffer.from(chunk));

        }

        return {

            content: Buffer.concat(chunks),

            contentType:

                response.ContentType

                ?? "application/octet-stream"

        };

    }

    async exists(

        key: string

    ): Promise<boolean> {

        try {

            await this.client.send(

                new HeadObjectCommand({

                    Bucket: this.bucket,

                    Key: key

                })

            );

            return true;

        }
        catch {

            return false;

        }

    }

    async getSignedDownloadUrl(

        key: string,

        expiresInSeconds: number

    ): Promise<string> {

        return getSignedUrl(

            this.client,

            new GetObjectCommand({

                Bucket: this.bucket,

                Key: key

            }),

            { expiresIn: expiresInSeconds }

        );

    }

}
