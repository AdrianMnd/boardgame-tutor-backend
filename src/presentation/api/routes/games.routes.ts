import { Router } from "express";

import { ApplicationContainer } from "../../../application/container/ApplicationContainer";

import { GamesController } from "../controllers/games.controller";

const router = Router();

const container =
    new ApplicationContainer();

const controller =
    new GamesController(
        container.listGamesUseCase
    );

router.get(

    "/",

    controller.getGames

);

export default router;