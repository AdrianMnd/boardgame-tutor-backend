export interface StorageConfiguration {

    endpoint: string;

    bucket: string;

    accessKeyId: string;

    secretAccessKey: string;

    forcePathStyle: true;

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

export function loadStorageConfiguration(): StorageConfiguration {

    const endpoint =
        requireEnv("B2_ENDPOINT").trim();

    // Causa más común de "Invalid URL" al subir archivos: el
    // endpoint sin el esquema http(s):// delante — el SDK de S3
    // necesita una URL completa, no solo el nombre de host.
    if (

        !endpoint.startsWith("http://") &&
        !endpoint.startsWith("https://")

    ) {

        throw new Error(

            `B2_ENDPOINT ("${endpoint}") no es una URL válida — debe ` +
            "empezar por \"https://\". En el panel de Backblaze, dentro " +
            "del bucket → pestaña \"Settings\" → sección \"S3 API\", " +
            "copia la URL completa (algo como " +
            "\"https://s3.us-west-004.backblazeb2.com\"), no solo el " +
            "nombre de host."

        );

    }

    return {

        endpoint,

        bucket:
            requireEnv("B2_BUCKET").trim(),

        accessKeyId:
            requireEnv("B2_ACCESS_KEY_ID").trim(),

        secretAccessKey:
            requireEnv("B2_SECRET_ACCESS_KEY").trim(),

        forcePathStyle: true

    };

}
