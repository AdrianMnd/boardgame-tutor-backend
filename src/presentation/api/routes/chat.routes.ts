import { Router } from "express";

import { container } from "../../../application/container/Index";

import { ChatController } from "../controllers/chat.controller";

const router = Router();

const controller =
    new ChatController(
        container.askQuestionUseCase
    );

router.post(

    "/",

    controller.ask

);

export default router;