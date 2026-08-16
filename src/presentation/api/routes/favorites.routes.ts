import { Router } from "express";

import { container } from "../../../application/container/Index";

import { FavoritesController } from "../controllers/favorites.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

const controller =
    new FavoritesController(
        container.favoritesUseCase
    );

router.use(

    requireAuth(container.jwtService)

);

router.get(

    "/",

    controller.list

);

router.post(

    "/:gameId",

    controller.add

);

router.delete(

    "/:gameId",

    controller.remove

);

export default router;
