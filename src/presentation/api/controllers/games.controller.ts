import { Request, Response } from "express";
import { games } from "../../../data/games";


export class GamesController {


    getGames(_req: Request, res: Response) {

        res.json(games);

    }


    getGameById(req: Request, res: Response) {

        const id = Number(req.params.id);


        const game = games.find(
            game => game.id === id
        );


        if (!game) {

            return res.status(404).json({
                message: "Juego no encontrado"
            });

        }


        res.json(game);

    }

}