import { GameValidator } from "../../../domain/game/services/game-validator.service";

import { IEmbeddingProvider } from "../../../domain/embeddings/IEmbeddingProvider";

import { IKnowledgeRetriever } from "../../../domain/knowledge/IknowledgeRetriever";

import { IContextReranker } from "../../../domain/knowledge/IContextReranker";

import { ContextBuilder } from "../../../domain/ai/contextBuilder";

import { ChatProvider } from "../../../domain/ai/chatProvider";
import { IContextCompressor } from "../../../domain/knowledge/IContextCompressor";
import { AskQuestionResult } from "./askQuestionResult";

export class AskQuestionUseCase {

    constructor(

        private readonly validator: GameValidator,

        private readonly embeddingProvider: IEmbeddingProvider,

        private readonly retriever: IKnowledgeRetriever,

        private readonly reranker: IContextReranker,

        private readonly compressor: IContextCompressor,

        private readonly contextBuilder: ContextBuilder,

        private readonly chatProvider: ChatProvider

    ) {}

    async execute(

        gameId: string,

        question: string

    ):Promise<AskQuestionResult> {

        console.log("1. Validando juego...");

        const game =

            await this.validator.validate(

                gameId

            );

        console.log("✔ Juego validado");

        console.log("");



        console.log("2. Generando embedding...");

        const embedding =

            await this.embeddingProvider.generate(

                question

            );

        console.log("✔ Embedding generado");

        console.log("");



        console.log("3. Recuperando contexto...");

        const retrieved =

            await this.retriever.retrieve(

                game,

                question,

                embedding

            );

        console.log(

            `✔ ${retrieved.length} fragmentos recuperados`

        );

        console.log("");



        console.log("4. Reordenando contexto...");

        const reranked =

            await this.reranker.rerank(

                question,

                retrieved

            );

        console.log("✔ Contexto reordenado");

        console.log("");



        console.log("5. Construyendo contexto...");


        const compressed =

            await this.compressor.compress(

                question,

                reranked

    );

        const context =

            this.contextBuilder.build(

                compressed

            );

        console.log("✔ Contexto construido");

        console.log("");



        console.log("6. Generando respuesta...");

        const answer =

            await this.chatProvider.answer(

                question,

                context

            );

        console.log("✔ Respuesta generada");

        console.log("");



        return {

            answer,

            sources: compressed

        };

    }

}