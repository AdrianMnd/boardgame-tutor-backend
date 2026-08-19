import { GameValidator } from "../../../domain/game/services/game-validator.service";

import { IEmbeddingProvider } from "../../../domain/embeddings/IEmbeddingProvider";

import { IKnowledgeRetriever } from "../../../domain/knowledge/IknowledgeRetriever";

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
     * (no dependen entre sí), y recuperar los fragmentos
     * relevantes.
     *
     * Antes había un paso más aquí (reordenar los fragmentos con
     * una llamada de IA extra, antes de construir el contexto):
     * se quitó porque no cambiaba QUÉ información llega a la
     * respuesta final (ContextBuilder ya incluye siempre todos
     * los fragmentos recuperados, reordenados o no) — solo el
     * orden en que la IA los lee. El beneficio era sutil, pero
     * el coste era una llamada de IA completa entera, sin
     * streaming, bloqueando el inicio de cualquier respuesta.
     * Con reglamentos densos, esto se notaba en tiempos de
     * espera de 30+ segundos en algunos casos — se prioriza la
     * experiencia de usuario aquí.
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

        const context =

            this.contextBuilder.build(

                retrieved

            );

        return { context, refined: retrieved };

    }

}
