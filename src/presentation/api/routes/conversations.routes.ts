import { Router } from "express";

import { container } from "../../../application/container/Index";

import { ConversationsController } from "../controllers/conversations.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

const controller =
    new ConversationsController(
        container.conversationsUseCase
    );

router.use(

    requireAuth(container.jwtService)

);

router.get(

    "/:gameId",

    controller.list

);

router.post(

    "/:gameId/messages",

    controller.addMessage

);

router.delete(

    "/:gameId",

    controller.clear

);

export default router;
