import { IMPORT_CONFIGURATION } from "../../config/import";
import { GEMINI } from "../../config/gemini";

import { NodeFileSystem } from "../../infrastructure/filesystem/NodeFileSystem";
import { FileGameRepository } from "../../infrastructure/repositories/FileGameRepository";

import { GameValidator } from "../../domain/game/services/game-validator.service";

import { SemanticRetriever } from "../../domain/knowledge/SemanticRetriever";

import { ContextBuilder } from "../../domain/ai/contextBuilder";

import { GeminiClient } from "../../infrastructure/ai/providers/gemini/geminiClient";
import { LLMEmbeddingProvider } from "../../infrastructure/ai/common/LLMEmbeddingProvider";
import { GeminiChatProvider } from "../../infrastructure/ai/providers/gemini/geminiChatProvider";

import { AskQuestionUseCase } from "../use-cases/ask-question/ask-question.use-case";
import { LLMContextReranker } from "../../infrastructure/ai/common/LLMContextReranker";
import { LLMContextCompressor } from "../../infrastructure/ai/common/LLMContextCompressor";

export class ApplicationFactory {

    static createAskQuestionUseCase(): AskQuestionUseCase {

        const fileSystem =
            new NodeFileSystem();

        const repository =
    new FileGameRepository(
        fileSystem
    );

const validator =
    new GameValidator(
        repository
    );

        const retriever =
            new SemanticRetriever(
                fileSystem,
                IMPORT_CONFIGURATION
            );

        const contextBuilder =
            new ContextBuilder();

        const geminiClient =
            new GeminiClient(
                GEMINI
            );

        const embeddingProvider =
            new LLMEmbeddingProvider(
                geminiClient
            );

        const chatProvider =
            new GeminiChatProvider(
                geminiClient
            );

        const reranker =
            new LLMContextReranker(
                geminiClient
            );

        const compressor =
            new LLMContextCompressor(
                geminiClient
            );

        return new AskQuestionUseCase(

            validator,

            embeddingProvider,

            retriever,

            reranker,

            compressor,

            contextBuilder,

            chatProvider

        );

    }

}