import express from "express";
import cors from "cors";

import chatRoutes from "./routes/chat.routes";
import gamesRoutes from "./routes/games.routes";

import dotenv from "dotenv";

dotenv.config();

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
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});