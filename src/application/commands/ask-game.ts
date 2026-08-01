import "dotenv/config";

import { NodeFileSystem } from "../../infrastructure/filesystem/NodeFileSystem";

import { GameValidator } from "../../domain/game/services/game-validator.service";

import { SemanticRetriever } from "../../domain/knowledge/SemanticRetriever";
import { KeywordRetriever } from "../../domain/knowledge/KeywordRetriever";
import { HybridRetriever } from "../../domain/knowledge/HybridRetriever";
import { ContextBuilder } from "../../domain/ai/contextBuilder";

import { AskQuestionUseCase } from "../use-cases/ask-question/ask-question.use-case";

import { GeminiClient } from "../../infrastructure/ai/gemini/geminiClient";
import { GeminiEmbeddingProvider } from "../../infrastructure/ai/gemini/geminiEmbeddingProvider";
import { GeminiChatProvider } from "../../infrastructure/ai/gemini/geminiChatProvider";

import { GEMINI } from "../../config/gemini";
import { IMPORT_CONFIGURATION } from "../../config/import";
import { GeminiContextReranker } from "../../infrastructure/ai/gemini/geminiContextReranker";
import { GeminiContextCompressor } from "../../infrastructure/ai/gemini/geminiContextCompressor";

async function main() {

    const gameId =
        process.argv[2];

    const question =
        process.argv
            .slice(3)
            .join(" ");

    if (!gameId || !question) {

        console.log("");
        console.log("Uso:");
        console.log("");
        console.log("npm run ask <gameId> <pregunta>");
        console.log("");

        process.exit(1);

    }

    console.log("");
    console.log("==================================");
    console.log(`Consultando juego: ${gameId}`);
    console.log("==================================");
    console.log("");

    const fileSystem =
        new NodeFileSystem();

    const validator =
        new GameValidator(fileSystem);

    const semanticRetriever =
        new SemanticRetriever(

            fileSystem,

            IMPORT_CONFIGURATION

        );

    const keywordRetriever =
        new KeywordRetriever(

            fileSystem,

            IMPORT_CONFIGURATION

        );

    const retriever =
        new HybridRetriever(

             new SemanticRetriever(

            fileSystem,

            IMPORT_CONFIGURATION

        ),

        new KeywordRetriever(

            fileSystem,

            IMPORT_CONFIGURATION

        )

        );

    
    const contextBuilder =
    new ContextBuilder();
    
    const geminiClient =
    new GeminiClient(
        
        GEMINI
        
    );
    
    const embeddingProvider =
    new GeminiEmbeddingProvider(
        
        geminiClient
        
    );
    
    const reranker = new GeminiContextReranker(

        geminiClient

    );
    const chatProvider =
        new GeminiChatProvider(

            geminiClient

        );

    const compressor =

    new GeminiContextCompressor(

        geminiClient

    );

    const useCase =
        new AskQuestionUseCase(

            validator,

            embeddingProvider,

            retriever,

            reranker,

            compressor,

            contextBuilder,

            chatProvider

        );

    const result =
        await useCase.execute(

            gameId,

            question

        );

    console.log("");
    console.log("Respuesta:");
    console.log("");
    console.log(result.answer);
    console.log("");
    console.log("Fuentes:");
    console.log("");

    for (const chunk of result.chunks) {

        console.log(

            `Página ${chunk.page} (score ${chunk.score.toFixed(3)})`

        );

    }

    console.log("");

}

main().catch(error => {

    console.error(error);

    process.exit(1);

});