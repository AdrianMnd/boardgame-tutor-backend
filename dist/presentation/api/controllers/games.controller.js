"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamesController = void 0;
const gameMapper_1 = require("../mappers/gameMapper");
class GamesController {
    useCase;
    getGameManualUseCase;
    constructor(useCase, getGameManualUseCase) {
        this.useCase = useCase;
        this.getGameManualUseCase = getGameManualUseCase;
    }
    getGames = async (_request, response) => {
        const games = await this.useCase.execute();
        response.json(gameMapper_1.GameMapper.toResponses(games));
    };
    getManual = async (request, response) => {
        const id = request.params.id;
        if (typeof id !== "string") {
            response
                .status(400)
                .json({
                message: "Identificador de juego inválido"
            });
            return;
        }
        const manualPath = await this.getGameManualUseCase.execute(id);
        if (!manualPath) {
            response
                .status(404)
                .json({
                message: "Juego no encontrado"
            });
            return;
        }
        response.sendFile(manualPath, error => {
            if (error && !response.headersSent) {
                response
                    .status(404)
                    .json({
                    message: "Reglamento no encontrado"
                });
            }
        });
    };
}
exports.GamesController = GamesController;
