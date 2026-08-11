"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationContainer = void 0;
const import_1 = require("../../config/import");
const NodeFileSystem_1 = require("../../infrastructure/filesystem/NodeFileSystem");
const FileGameRepository_1 = require("../../infrastructure/repositories/FileGameRepository");
const AIProviderFactory_1 = require("../../infrastructure/ai/factory/AIProviderFactory");
const game_validator_service_1 = require("../../domain/game/services/game-validator.service");
const SemanticRetriever_1 = require("../../domain/knowledge/SemanticRetriever");
const contextBuilder_1 = require("../../domain/ai/contextBuilder");
const ask_question_use_case_1 = require("../use-cases/ask-question/ask-question.use-case");
const list_games_use_case_1 = require("../use-cases/list-games/list-games.use-case");
const get_game_manual_use_case_1 = require("../use-cases/get-game-manual/get-game-manual.use-case");
class ApplicationContainer {
    fileSystem = new NodeFileSystem_1.NodeFileSystem();
    repository = new FileGameRepository_1.FileGameRepository(this.fileSystem);
    listGamesUseCase = new list_games_use_case_1.ListGamesUseCase(this.repository);
    getGameManualUseCase = new get_game_manual_use_case_1.GetGameManualUseCase(this.repository);
    validator = new game_validator_service_1.GameValidator(this.repository);
    ai = AIProviderFactory_1.AIProviderFactory.create();
    embeddingProvider = this.ai.embeddingProvider;
    chatProvider = this.ai.chatProvider;
    refiner = this.ai.refiner;
    retriever = new SemanticRetriever_1.SemanticRetriever(this.fileSystem, import_1.IMPORT_CONFIGURATION);
    contextBuilder = new contextBuilder_1.ContextBuilder();
    askQuestionUseCase = new ask_question_use_case_1.AskQuestionUseCase(this.validator, this.embeddingProvider, this.retriever, this.refiner, this.contextBuilder, this.chatProvider);
}
exports.ApplicationContainer = ApplicationContainer;
