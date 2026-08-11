import type {

    Request,

    Response

} from "express";

import { AskQuestionUseCase } from "../../../application/use-cases/ask-question/ask-question.use-case";

import type {

    AskQuestionRequest

} from "../dto/askQuestionRequest";

import { ChatMapper } from "../mappers/chatMapper";

export class ChatController {

    constructor(

        private readonly useCase: AskQuestionUseCase

    ) {}

    ask = async (

        request: Request,

        response: Response

    ): Promise<void> => {

        const body =

            request.body as AskQuestionRequest;

        const result =

            await this.useCase.execute(

                body.gameId,

                body.question

            );

        response.json(

            ChatMapper.toResponse(

                result

            )

        );

    };

    /**
     * Igual que ask, pero devolviendo la respuesta como
     * Server-Sent Events a medida que se genera, en vez de
     * esperar a tenerla completa. Protocolo:
     *
     *   event: sources  -> data: [{ id, gameId, page, text, score }, ...]
     *   event: chunk    -> data: { "text": "..." }   (varios, uno por fragmento)
     *   event: done     -> data: {}
     *   event: error    -> data: { "message": "..." }  (en vez de "done", si algo falla)
     */
    askStream = async (

        request: Request,

        response: Response

    ): Promise<void> => {

        const body =

            request.body as AskQuestionRequest;

        response.setHeader(

            "Content-Type",

            "text/event-stream"

        );

        response.setHeader(

            "Cache-Control",

            "no-cache"

        );

        response.setHeader(

            "Connection",

            "keep-alive"

        );

        response.flushHeaders?.();

        const send = (

            event: string,

            data: unknown

        ) => {

            response.write(

                `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`

            );

        };

        try {

            for await (const chunkEvent of this.useCase.executeStream(

                body.gameId,

                body.question

            )) {

                if (chunkEvent.type === "sources") {

                    send(

                        "sources",

                        ChatMapper.toSources(chunkEvent.sources)

                    );

                }
                else if (chunkEvent.type === "chunk") {

                    send(

                        "chunk",

                        { text: chunkEvent.text }

                    );

                }
                else {

                    send("done", {});

                }

            }

        }
        catch (error) {

            console.error(

                "[API] Error durante el streaming de la respuesta:",

                error

            );

            const message =

                error instanceof Error
                    ? error.message
                    : "Ha ocurrido un error interno.";

            send("error", { message });

        }
        finally {

            response.end();

        }

    };

}