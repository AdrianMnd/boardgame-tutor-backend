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

            files: MAX_FILES

        },

        fileFilter: (

            _request,

            file,

            callback

        ) => {

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

    upload.array("pdfs", MAX_FILES),

    controller.submit

);

export default router;
