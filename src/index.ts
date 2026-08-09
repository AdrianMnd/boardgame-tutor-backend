import "dotenv/config";

import express from "express";
import path from "node:path";
import cors from "cors";

import gamesRoutes from "./presentation/api/routes/games.routes";
import chatRoutes from "./presentation/api/routes/chat.routes";

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

const PORT =

    Number(

        process.env.PORT

        ?? 3000

    );

app.listen(

    PORT,

    () => {

        console.log(

            `Servidor iniciado en http://localhost:${PORT}`

        );

    }

);