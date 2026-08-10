import "dotenv/config";

import express from "express";
import path from "node:path";
import cors from "cors";

import gamesRoutes from "./presentation/api/routes/games.routes";
import chatRoutes from "./presentation/api/routes/chat.routes";

const app = express();

app.use(cors());

app.use(express.json());

app.use(

    "/games",

    express.static(

        path.resolve("games")

    )

);

app.get(

    "/",

    (_request, response) => {

        response.json({

            name: "BoardGame Tutor API",

            version: "1.0.0"

        });

    }

);

app.use(

    "/api/games",

    gamesRoutes

);

app.use(

    "/api/chat",

    chatRoutes

);

const PORT =

    Number(

        process.env.PORT

        ?? 3000

    );

const PUBLIC_URL =

    process.env.API_PUBLIC_URL
    ?? process.env.RENDER_EXTERNAL_URL
    ?? `http://localhost:${PORT}`;

if (

    process.env.NODE_ENV === "production" &&
    /^https?:\/\/localhost/.test(PUBLIC_URL)

) {

    // En producción, servir URLs de localhost (ej. portadas de
    // juego) rompe en cualquier navegador que cargue la app por
    // HTTPS (mixed content). Si esto se ve en los logs, falta
    // configurar API_PUBLIC_URL en las variables de entorno.
    console.warn(

        "[Config] API_PUBLIC_URL no está configurada y no se ha " +

        "podido detectar automáticamente. Las URLs de portadas de " +

        "juego usarán localhost y no funcionarán para los usuarios. " +

        "Configura API_PUBLIC_URL con la URL pública de este servicio."

    );

}

app.listen(

    PORT,

    () => {

        console.log(

            `Servidor iniciado en http://localhost:${PORT}`

        );

        console.log(

            `URL pública configurada: ${PUBLIC_URL}`

        );

    }

);