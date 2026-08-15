import { Router } from "express";

import { container } from "../../../application/container/Index";

import { GamesController } from "../controllers/games.controller";

const router = Router();

const controller =
    new GamesController(

        container.listGamesUseCase,

        container.getGameManualUseCase,

        container.repository,

        container.storage

    );

router.get(

    "/",

    controller.getGames

);

router.get(

    "/:id/cover",

    controller.getCover

);

router.get(

    "/:id/manual",

    controller.getManual

);

export default router;