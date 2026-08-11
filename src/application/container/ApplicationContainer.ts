import { IMPORT_CONFIGURATION } from "../../config/import";

import { NodeFileSystem } from "../../infrastructure/filesystem/NodeFileSystem";
import { FileGameRepository } from "../../infrastructure/repositories/FileGameRepository";

import { AIProviderFactory } from "../../infrastructure/ai/factory/AIProviderFactory";

import { GameValidator } from "../../domain/game/services/game-validator.service";
import { SemanticRetriever } from "../../domain/knowledge/SemanticRetriever";
import { ContextBuilder } from "../../domain/ai/contextBuilder";

import { AskQuestionUseCase } from "../use-cases/ask-question/ask-question.use-case";
import { ListGamesUseCase } from "../use-cases/list-games/list-games.use-case";
import { GetGameManualUseCase } from "../use-cases/get-game-manual/get-game-manual.use-case";

export class ApplicationContainer {

    readonly fileSystem =
        new NodeFileSystem();

    readonly repository =
        new FileGameRepository(
            this.fileSystem
        );

    readonly listGamesUseCase =
        new ListGamesUseCase(
            this.repository
        );

    readonly getGameManualUseCase =
        new GetGameManualUseCase(
            this.repository
        );

    readonly validator =
        new GameValidator(
            this.repository
        );

    readonly ai =
        AIProviderFactory.create();

    readonly embeddingProvider =
        this.ai.embeddingProvider;

    readonly chatProvider =
        this.ai.chatProvider;

    readonly refiner =
        this.ai.refiner;

    readonly retriever =
        new SemanticRetriever(
            this.fileSystem,
            IMPORT_CONFIGURATION
        );

    readonly contextBuilder =
        new ContextBuilder();

    readonly askQuestionUseCase =
        new AskQuestionUseCase(

            this.validator,

            this.embeddingProvider,

            this.retriever,

            this.refiner,

            this.contextBuilder,

            this.chatProvider

        );

}