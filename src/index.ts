import "dotenv/config";

import express from "express";
import path from "node:path";
import cors from "cors";

import gamesRoutes from "./presentation/api/routes/games.routes";
import chatRoutes from "./presentation/api/routes/chat.routes";

import { ApiError } from "./presentation/api/errors/ApiError";

const app = express();

//Abierto para pruebas, pero luego se debe restringir a la URL del frontend
//app.use(cors());

app.use(cors({
  origin: "https://boardgame-tutor-frontend.vercel.app"
}));

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

// ==========================================================
// MANEJO DE ERRORES GLOBAL
//
// Express 5 reenvía automáticamente los rechazos de promesas
// de los controladores `async` hasta aquí, así que no hace
// falta envolver cada ruta en un try/catch manual.
//
// Sin este middleware, cualquier excepción no controlada
// (ej. un error de programación, o un fallo de un proveedor
// de IA) devuelve la página HTML genérica de Express en vez
// de un JSON que el frontend pueda interpretar.
// ==========================================================

app.use(

    (

        error: unknown,

        _request: express.Request,

        response: express.Response,

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _next: express.NextFunction

    ) => {

        console.error(

            "[API] Error no controlado:",

            error

        );

        if (error instanceof ApiError) {

            response

                .status(error.status)

                .json({

                    error: error.code,

                    message: error.message

                });

            return;

        }

        const message =

            error instanceof Error
                ? error.message
                : "Error desconocido.";

        // Caso conocido: el juego se importó con un proveedor de
        // embeddings distinto al que usa este servidor para las
        // preguntas en vivo (ej. importado en local con el
        // modelo local, pero este servidor usa un proveedor en
        // la nube). Se da una pista accionable en vez de un 500
        // genérico.
        const isEmbeddingMismatch =

            message.includes(

                "misma dimensión"

            );

        response

            .status(500)

            .json({

                error: "internal_error",

                message:

                    isEmbeddingMismatch

                        ? "El juego se importó con un proveedor de embeddings " +
                          "distinto al que usa este servidor. Vuelve a " +
                          "ejecutar \"npm run import\" para este juego usando " +
                          "el mismo proveedor de embeddings que tiene " +
                          "configurado este servidor (revisa AI_PROVIDER_ORDER " +
                          "y LOCAL_EMBEDDING_ENABLED)."

                        : "Ha ocurrido un error interno. Inténtalo de nuevo " +

                          "en unos segundos."

            });

    }

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

<<<<<<< HEAD
    // En producción, servir URLs de localhost (ej. portadas de
    // juego) rompe en cualquier navegador que cargue la app por
    // HTTPS (mixed content). Si esto se ve en los logs, falta
    // configurar API_PUBLIC_URL en las variables de entorno.
=======
>>>>>>> 73f24cbc93d3d304d10bbbceed5efc0ab6151b65
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