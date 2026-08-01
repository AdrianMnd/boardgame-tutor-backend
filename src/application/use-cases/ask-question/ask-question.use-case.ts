import { GameValidator } from "../../../domain/game/services/game-validator.service";

import { KnowledgeRetriever } from "../../../domain/knowledge/KnowledgeRetriever";

import { IEmbeddingProvider } from "../../../domain/embeddings/IEmbeddingProvider";

import { ChatProvider } from "../../../domain/ai/chatProvider";

export class AskQuestionUseCase {

    constructor(

        private readonly validator: GameValidator,

        private readonly embeddingProvider: IEmbeddingProvider,

        private readonly retriever: KnowledgeRetriever,

        private readonly chatProvider: ChatProvider

    ) { }

    async execute(

    gameId: string,

    question: string

) {

    console.log("1. Validando juego...");

    const game =

        await this.validator.validate(

            gameId

        );

    console.log("✔ Juego validado");

    console.log("");

    console.log("2. Generando embedding de la pregunta...");

    const embedding =

        await this.embeddingProvider.generate(

            question

        );

    console.log("✔ Embedding generado");

    console.log("");

    console.log("3. Buscando contexto...");

    const chunks =

        await this.retriever.retrieve(

            game,

            embedding

        );

    console.log(

        `✔ ${chunks.length} fragmentos encontrados`

    );

    console.log("");

    console.log("4. Generando respuesta...");

    const context =

        chunks
            .map(chunk =>

                `Página ${chunk.page}\n${chunk.text}`

            )
            .join("\n\n----------------\n\n");

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