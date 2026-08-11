import { GameValidator } from "../../../domain/game/services/game-validator.service";

import { IEmbeddingProvider } from "../../../domain/embeddings/IEmbeddingProvider";

import { IKnowledgeRetriever } from "../../../domain/knowledge/IknowledgeRetriever";

import { IContextRefiner } from "../../../domain/knowledge/IContextRefiner";

import { ContextBuilder } from "../../../domain/ai/contextBuilder";

import { ChatProvider } from "../../../domain/ai/chatProvider";
import { AskQuestionResult } from "./askQuestionResult";

export class AskQuestionUseCase {

    constructor(

        private readonly validator: GameValidator,

        private readonly embeddingProvider: IEmbeddingProvider,

        private readonly retriever: IKnowledgeRetriever,

        private readonly refiner: IContextRefiner,

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



        console.log("4. Reordenando y recortando contexto (1 sola llamada)...");

        const refined =

            await this.refiner.refine(

                question,

                retrieved

            );

        const context =

            this.contextBuilder.build(

                refined

            );

        console.log("✔ Contexto listo");

        console.log("");



        console.log("5. Generando respuesta...");

        const answer =

            await this.chatProvider.answer(

                question,

                context

            );

        console.log("✔ Respuesta generada");

        console.log("");



        return {

            answer,

            sources: refined

        };

    }

}
