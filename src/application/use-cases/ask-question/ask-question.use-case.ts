import { GameValidator } from "../../../domain/game/services/game-validator.service";

import { IEmbeddingProvider } from "../../../domain/embeddings/IEmbeddingProvider";

import { IKnowledgeRetriever } from "../../../domain/knowledge/IknowledgeRetriever";

import { IContextRefiner } from "../../../domain/knowledge/IContextRefiner";

import { ContextBuilder } from "../../../domain/ai/contextBuilder";

import { ChatProvider } from "../../../domain/ai/chatProvider";
import { AskQuestionResult } from "./askQuestionResult";
import type { AskQuestionStreamEvent } from "./askQuestionStreamEvent";
import type { RetrievedChunk } from "../../../domain/knowledge/RetrievedChunk";

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

    ): Promise<AskQuestionResult> {

        const { context, refined } =

            await this.prepareContext(

                gameId,

                question

            );

        const answer =

            await this.chatProvider.answer(

                question,

                context

            );

        return {

            answer,

            sources: refined

        };

    }

    /**
     * Igual que execute(), pero entregando la respuesta en
     * fragmentos a medida que se genera, en vez de esperar a
     * tenerla completa. Emite primero las fuentes (ya se
     * conocen antes de empezar a generar texto), luego los
     * fragmentos de la respuesta, y termina con "done".
     */
    async *executeStream(

        gameId: string,

        question: string

    ): AsyncIterable<AskQuestionStreamEvent> {

        const { context, refined } =

            await this.prepareContext(

                gameId,

                question

            );

        yield { type: "sources", sources: refined };

        if (this.chatProvider.answerStream) {

            for await (const chunk of this.chatProvider.answerStream(

                question,

                context

            )) {

                yield { type: "chunk", text: chunk };

            }

        }
        else {

            // El ChatProvider configurado no soporta streaming
            // (no debería pasar con LLMChatProvider, pero por si
            // acaso hay otra implementación en el futuro): se
            // entrega todo de una vez como un único fragmento.
            const answer =

                await this.chatProvider.answer(

                    question,

                    context

                );

            yield { type: "chunk", text: answer };

        }

        yield { type: "done" };

    }

    /**
     * Pasos comunes a execute() y executeStream(): validar el
     * juego y generar el embedding de la pregunta en paralelo
     * (no dependen entre sí), recuperar los fragmentos
     * relevantes, y refinarlos (reordenar + recortar en una
     * sola llamada de IA).
     */
    private async prepareContext(

        gameId: string,

        question: string

    ): Promise<{ context: string; refined: RetrievedChunk[] }> {

        const [game, embedding] =

            await Promise.all([

                this.validator.validate(

                    gameId

                ),

                this.embeddingProvider.generate(

                    question

                )

            ]);

        const retrieved =

            await this.retriever.retrieve(

                game,

                question,

                embedding

            );

        const refined =

            await this.refiner.refine(

                question,

                retrieved

            );

        const context =

            this.contextBuilder.build(

                refined

            );

        return { context, refined };

    }

}
