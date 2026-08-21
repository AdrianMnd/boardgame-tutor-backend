import { Router } from "express";

import { container } from "../../../application/container/Index";

import { PasswordResetRequestController } from "../controllers/passwordResetRequest.controller";

const router = Router();

const controller =
    new PasswordResetRequestController(
        container.requestPasswordResetUseCase
    );

// Pública a propósito — quien ha olvidado su contraseña, por
// definición, no puede autenticarse para pedir el restablecimiento.
// El límite de tasa se aplica al montar la ruta en index.ts,
// reutilizando authRateLimiter (mismo riesgo de abuso que login).
router.post(

    "/",

    controller.request

);

export default router;
