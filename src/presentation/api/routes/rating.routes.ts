import { Router } from "express";

import { container } from "../../../application/container/Index";

import { RatingController } from "../controllers/rating.controller";
import { optionalAuth } from "../middleware/optionalAuth";

const router = Router();

const controller =
    new RatingController(
        container.rateMessageUseCase
    );

router.use(

    optionalAuth(container.jwtService)

);

router.post(

    "/",

    controller.rate

);

export default router;
