import type {
    Request,
    Response
} from "express";


import {
    generateAnswer
} from "../services/ai.service";



export async function askQuestion(
    req: Request,
    res: Response
) {


    const {
        gameId,
        question
    } = req.body;



    if (!gameId || !question) {


        return res.status(400).json({

            message:
                "gameId y question son obligatorios"

        });

    }



    const answer =
        await generateAnswer(
            gameId,
            question
        );



    return res.json({

        answer

    });

}