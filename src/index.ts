import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

import chatRoutes from "./presentation/routes/chat.routes";
import gamesRoutes from "./presentation/routes/games.routes";
import { ConsoleImportLogger } from "./application/logger/ConsoleimportLogger";


const app = express();


app.use(cors());
app.use(express.json());


app.get("/", (_req, res) => {
    res.send("BoardGame Tutor Backend");
});


app.use("/api/games", gamesRoutes);
app.use("/api/chat", chatRoutes);


const PORT = 3000;

app.listen(PORT, () => {
    const logger = new ConsoleImportLogger();
    logger.info(

            (`Servidor iniciado en http://localhost:${PORT}`)

        );
});
