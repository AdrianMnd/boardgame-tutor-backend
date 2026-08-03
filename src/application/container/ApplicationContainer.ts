import { GEMINI } from "../../config/gemini";
import { IMPORT_CONFIGURATION } from "../../config/import";

import { NodeFileSystem } from "../../infrastructure/filesystem/NodeFileSystem";
import { FileGameRepository } from "../../infrastructure/repositories/FileGameRepository";

import { GeminiClient } from "../../infrastructure/ai/gemini/geminiClient";
import { GeminiEmbeddingProvider } from "../../infrastructure/ai/gemini/geminiEmbeddingProvider";
import { GeminiChatProvider } from "../../infrastructure/ai/gemini/geminiChatProvider";
import { GeminiContextReranker } from "../../infrastructure/ai/gemini/geminiContextReranker";
import { GeminiContextCompressor } from "../../infrastructure/ai/gemini/geminiContextCompressor";

import { GameValidator } from "../../domain/game/services/game-validator.service";
import { SemanticRetriever } from "../../domain/knowledge/SemanticRetriever";
import { ContextBuilder } from "../../domain/ai/contextBuilder";

import { AskQuestionUseCase } from "../use-cases/ask-question/ask-question.use-case";
import { ListGamesUseCase } from "../use-cases/list-games/list-games.use-case";

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

    readonly validator =
        new GameValidator(
            this.repository
        );

    readonly geminiClient =
        new GeminiClient(
            GEMINI
        );

    readonly embeddingProvider =
        new GeminiEmbeddingProvider(
            this.geminiClient
        );

    readonly chatProvider =
        new GeminiChatProvider(
            this.geminiClient
        );

    readonly reranker =
        new GeminiContextReranker(
            this.geminiClient
        );

    readonly compressor =
        new GeminiContextCompressor(
            this.geminiClient
        );

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

            this.reranker,

            this.compressor,

            this.contextBuilder,

            this.chatProvider

        );

}