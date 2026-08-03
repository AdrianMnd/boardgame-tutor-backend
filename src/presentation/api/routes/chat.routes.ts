import { Router } from "express";

import { ApplicationContainer } from "../../../application/container/ApplicationContainer";

import { ChatController } from "../controllers/chat.controller";

const router = Router();

const container =
    new ApplicationContainer();

const controller =
    new ChatController(
        container.askQuestionUseCase
    );

router.post(

    "/",

    controller.ask

);

export default router;