import { Router } from "express";

import multer from "multer";

import { container } from "../../../application/container/Index";

import { GameRequestController } from "../controllers/gameRequest.controller";
import { requireAuth } from "../middleware/requireAuth";
import { BadRequestError } from "../errors/BadRequestError";

const router = Router();

const MAX_FILE_SIZE_BYTES = 150 * 1024 * 1024;

const MAX_FILES = 10;

const upload =

    multer({

        storage: multer.memoryStorage(),

        limits: {

            fileSize: MAX_FILE_SIZE_BYTES,

            files: MAX_FILES + 1

        },

        fileFilter: (

            _request,

            file,

            callback

        ) => {

            if (file.fieldname === "cover") {

                if (!file.mimetype.startsWith("image/")) {

                    callback(

                        new BadRequestError(

                            "La portada debe ser una imagen."

                        )

                    );

                    return;

                }

                callback(null, true);

                return;

            }

            if (file.mimetype !== "application/pdf") {

                callback(

                    new BadRequestError(

                        "Solo se admiten archivos PDF."

                    )

                );

                return;

            }

            callback(null, true);

        }

    });

const controller =

    new GameRequestController(

        container.gameRequestUseCase,

        container.userRepository

    );

router.post(

    "/",

    requireAuth(container.jwtService),

    upload.fields([

        { name: "pdfs", maxCount: MAX_FILES },

        { name: "cover", maxCount: 1 }

    ]),

    controller.submit

);

export default router;
