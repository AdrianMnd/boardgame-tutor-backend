import { Router } from "express";

import { GamesController } from "../controllers/games.controller";


const router = Router();

const controller = new GamesController();


router.get(
    "/",
    controller.getGames
);


router.get(
    "/:id",
    controller.getGameById
);


export default router;