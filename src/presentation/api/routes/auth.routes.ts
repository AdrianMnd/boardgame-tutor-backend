import { Router } from "express";

import { container } from "../../../application/container/Index";

import { AuthController } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

const controller =
    new AuthController(

        container.registerUserUseCase,

        container.loginUserUseCase,

        container.userRepository

    );

router.post(

    "/register",

    controller.register

);

router.post(

    "/login",

    controller.login

);

router.get(

    "/me",

    requireAuth(container.jwtService),

    controller.me

);

export default router;
