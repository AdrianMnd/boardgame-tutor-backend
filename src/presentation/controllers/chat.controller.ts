import type {
    Request,
    Response
} from "express";


import {
    generateAnswer
} from "../../services/ai/ai.service";



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



    const response = await generateAnswer(
        gameId,
        question
    );

    res.json(response);

}