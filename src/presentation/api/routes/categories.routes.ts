import { Router } from "express";

import { container } from "../../../application/container/Index";

import { CategoriesController } from "../controllers/categories.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

const controller =
    new CategoriesController(
        container.categoriesUseCase
    );

router.use(

    requireAuth(container.jwtService)

);

router.get(

    "/",

    controller.list

);

router.post(

    "/",

    controller.create

);

router.patch(

    "/:categoryId",

    controller.rename

);

router.delete(

    "/:categoryId",

    controller.delete

);

router.post(

    "/:categoryId/games/:gameId",

    controller.addGame

);

router.delete(

    "/:categoryId/games/:gameId",

    controller.removeGame

);

export default router;
