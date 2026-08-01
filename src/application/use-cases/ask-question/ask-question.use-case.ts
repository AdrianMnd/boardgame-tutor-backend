import { GameValidator } from "../../../domain/game/services/game-validator.service";

import { IKnowledgeRetriever } from "../../../domain/knowledge/IknowledgeRetriever";

import { IEmbeddingProvider } from "../../../domain/embeddings/IEmbeddingProvider";

import { ChatProvider } from "../../../domain/ai/chatProvider";

import { ContextBuilder } from "../../../domain/ai/contextBuilder";

export class AskQuestionUseCase {

    constructor(

        private readonly validator: GameValidator,

        private readonly embeddingProvider: IEmbeddingProvider,

        private readonly retriever: IKnowledgeRetriever,

        private readonly chatProvider: ChatProvider,

        private readonly contextBuilder: ContextBuilder

    ) {}

    async execute(

        gameId: string,

        question: string

    ) {

        console.log("1. Validando juego...");

        const game =
            await this.validator.validate(gameId);

        console.log("✔ Juego validado");
        console.log("");

        console.log("2. Generando embedding de la pregunta...");

        const embedding =
            await this.embeddingProvider.generate(question);

        console.log("✔ Embedding generado");
        console.log("");

        console.log("3. Buscando contexto...");

        const chunks =
            await this.retriever.retrieve(

                game,

                question,

                embedding

            );

        console.log(`✔ ${chunks.length} fragmentos encontrados`);
        console.log("");

        console.log("4. Generando respuesta...");

        const context =
            this.contextBuilder.build(chunks);

        const answer =
            await this.chatProvider.answer(

                question,

                context

            );

        console.log("✔ Respuesta generada");
        console.log("");

        return {

            answer,

            chunks

        };

    }

}