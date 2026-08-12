import "dotenv/config";

import express from "express";
import path from "node:path";
import cors from "cors";
import { rateLimit } from "express-rate-limit";

import gamesRoutes from "./presentation/api/routes/games.routes";
import chatRoutes from "./presentation/api/routes/chat.routes";

import { ApiError } from "./presentation/api/errors/ApiError";

const app = express();

// Necesario en Render (y cualquier plataforma detrás de un
// proxy/balanceador): sin esto, express-rate-limit no puede
// identificar la IP real de cada visitante a partir de la
// cabecera X-Forwarded-For.
app.set("trust proxy", 1);

// Orígenes permitidos por CORS: la URL de producción (fija) más
// cualquiera que se indique en FRONTEND_URL (separadas por
// comas), para poder probar en local contra un frontend en
// localhost sin tener que tocar código.
const allowedOrigins = [

    "https://boardgame-tutor-frontend.vercel.app",

    ...(

        process.env.FRONTEND_URL

            ?.split(",")
            .map(url => url.trim())
            .filter(Boolean)

        ?? []

    )

];

app.use(cors({

    origin: allowedOrigins

}));

app.use(express.json());

// Cada pregunta encadena varias llamadas a proveedores de IA de
// pago — sin límite, cualquiera podría agotar la cuota en
// minutos mandando peticiones en bucle. 20 preguntas cada 15
// minutos por IP es generoso para un uso normal, y bloquea un
// abuso automatizado.
const chatRateLimiter =

    rateLimit({

        windowMs: 15 * 60 * 1000,

        limit:

            Number(process.env.CHAT_RATE_LIMIT) || 20,

        standardHeaders: true,

        legacyHeaders: false,

        message: {

            error: "rate_limited",

            message:

                "Demasiadas preguntas seguidas. Espera unos minutos " +

                "antes de volver a preguntar."

        }

    });

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

    chatRateLimiter,

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