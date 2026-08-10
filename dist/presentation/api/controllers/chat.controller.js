"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const chatMapper_1 = require("../mappers/chatMapper");
class ChatController {
    useCase;
    constructor(useCase) {
        this.useCase = useCase;
    }
    ask = async (request, response) => {
        const body = request.body;
        const result = await this.useCase.execute(body.gameId, body.question);
        response.json(chatMapper_1.ChatMapper.toResponse(result));
    };
}
exports.ChatController = ChatController;
