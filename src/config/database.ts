export interface DatabaseConfiguration {

    connectionString: string;

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

export function loadDatabaseConfiguration(): DatabaseConfiguration {

    const connectionString =
        requireEnv("DATABASE_URL");

    if (

        !connectionString.startsWith("postgres://") &&
        !connectionString.startsWith("postgresql://")

    ) {

        throw new Error(

            "DATABASE_URL no tiene un formato válido — debe empezar " +
            "por \"postgres://\" o \"postgresql://\". Cópiala tal cual " +
            "te la da el panel de Neon (\"Connection string\"), sin " +
            "comillas ni espacios alrededor."

        );

    }

    return { connectionString };

}
