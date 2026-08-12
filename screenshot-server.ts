import express from "express";
import cors from "cors";
import path from "node:path";

import { NodeFileSystem } from "./src/infrastructure/filesystem/NodeFileSystem";
import { FileGameRepository } from "./src/infrastructure/repositories/FileGameRepository";
import { GameValidator } from "./src/domain/game/services/game-validator.service";
import { SemanticRetriever } from "./src/domain/knowledge/SemanticRetriever";
import { ContextBuilder } from "./src/domain/ai/contextBuilder";
import { AskQuestionUseCase } from "./src/application/use-cases/ask-question/ask-question.use-case";
import { ChatController } from "./src/presentation/api/controllers/chat.controller";
import { GamesController } from "./src/presentation/api/controllers/games.controller";
import { ListGamesUseCase } from "./src/application/use-cases/list-games/list-games.use-case";
import { GetGameManualUseCase } from "./src/application/use-cases/get-game-manual/get-game-manual.use-case";
import { IMPORT_CONFIGURATION } from "./src/config/import";
import type { IEmbeddingProvider } from "./src/domain/embeddings/IEmbeddingProvider";
import type { IContextRefiner } from "./src/domain/knowledge/IContextRefiner";
import type { ChatProvider } from "./src/domain/ai/chatProvider";

const fakeEmbeddingProvider: IEmbeddingProvider = {
    generate: async () => new Array(3072).fill(0).map(() => Math.random()),
    generateBatch: async (texts) => texts.map(() => new Array(3072).fill(0).map(() => Math.random()))
};
const fakeRefiner: IContextRefiner = { refine: async (_q, chunks) => chunks };

async function* fakeStream() {
    const text = "Para ganar la partida necesitas ser el primero en alcanzar 10 puntos de victoria. Los puntos se consiguen construyendo poblados y ciudades, teniendo la carretera mas larga, el ejercito mas grande, y algunas cartas de desarrollo especiales.";
    for (const palabra of text.split(" ")) {
        await new Promise(r => setTimeout(r, 15));
        yield palabra + " ";
    }
}
const fakeChatProvider: ChatProvider = {
    answer: async () => "no usado en captura",
    answerStream: () => fakeStream()
};

const fileSystem = new NodeFileSystem();
const repository = new FileGameRepository(fileSystem);
const validator = new GameValidator(repository);
const retriever = new SemanticRetriever(fileSystem, IMPORT_CONFIGURATION);
const contextBuilder = new ContextBuilder();
const useCase = new AskQuestionUseCase(validator, fakeEmbeddingProvider, retriever, fakeRefiner, contextBuilder, fakeChatProvider);
const chatController = new ChatController(useCase);
const gamesController = new GamesController(
    new ListGamesUseCase(repository),
    new GetGameManualUseCase(repository)
);

const app = express();
app.use(cors());
app.use(express.json());
app.use("/games", express.static(path.resolve("games")));
app.get("/api/games", gamesController.getGames);
app.get("/api/games/:id/manual", gamesController.getManual);
app.post("/api/chat/stream", chatController.askStream);

app.listen(3000, "127.0.0.1", () => console.log("Servidor con datos reales en :3000"));
