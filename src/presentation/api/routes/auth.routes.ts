import { Router } from "express";

import { container } from "../../../application/container/Index";

import { AuthController } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

const controller =
    new AuthController(

        container.registerUserUseCase,

        container.loginUserUseCase,

        container.userRepository,

        container.updateDisplayNameUseCase,

        container.updateEmailUseCase,

        container.updatePasswordUseCase

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

router.patch(

    "/me",

    requireAuth(container.jwtService),

    controller.updateDisplayName

);

router.patch(

    "/me/email",

    requireAuth(container.jwtService),

    controller.updateEmail

);

router.patch(

    "/me/password",

    requireAuth(container.jwtService),

    controller.updatePassword

);

export default router;
