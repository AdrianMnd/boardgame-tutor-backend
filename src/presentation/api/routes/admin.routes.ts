import { Router } from "express";

import { container } from "../../../application/container/Index";

import { AdminController } from "../controllers/admin.controller";
import { requireAuth } from "../middleware/requireAuth";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

const controller =
    new AdminController(

        container.listGameRequestsUseCase,

        container.markGameRequestReviewedUseCase,

        container.clearGameRequestsUseCase,

        container.adminResetPasswordUseCase,

        container.getRatingsSummaryUseCase,

        container.clearRatingsUseCase,

        container.listPasswordResetRequestsUseCase,

        container.markPasswordResetRequestResolvedUseCase

    );

router.use(

    requireAuth(container.jwtService)

);

router.use(

    requireAdmin(container.userRepository)

);

router.get(

    "/game-requests",

    controller.listGameRequests

);

router.patch(

    "/game-requests/:id/reviewed",

    controller.markGameRequestReviewed

);

router.delete(

    "/game-requests",

    controller.clearGameRequests

);

router.post(

    "/users/reset-password",

    controller.resetUserPassword

);

router.get(

    "/ratings/summary",

    controller.getRatingsSummary

);

router.delete(

    "/ratings",

    controller.clearRatings

);

router.get(

    "/password-reset-requests",

    controller.listPasswordResetRequests

);

router.patch(

    "/password-reset-requests/:id/resolved",

    controller.markPasswordResetRequestResolved

);

export default router;
