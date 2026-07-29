import { Request, Response } from "express";
import { ChatService } from "../services/chat.service";

const service = new ChatService();

export class ChatController {

    sendMessage(req: Request, res: Response) {

        const { game, question } = req.body;

        const response = service.getAnswer(game, question);

        res.json(response);

    }

}