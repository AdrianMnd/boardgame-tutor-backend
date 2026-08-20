import type {

    Request,

    Response

} from "express";

import { AskQuestionUseCase } from "../../../application/use-cases/ask-question/ask-question.use-case";

import type {

    AskQuestionRequest

} from "../dto/askQuestionRequest";

import { ChatMapper } from "../mappers/chatMapper";

import type { ChatTurn } from "../../../domain/ai/chatTurn";
import type { ChatContextOptions } from "../../../domain/ai/chatProvider";

/**
 * El historial llega del cliente sin garantías de formato — se
 * descarta cualquier entrada que no tenga la forma esperada, en
 * vez de dejar que un dato malformado rompa la petición o se
 * cuele tal cual en el prompt.
 */
function sanitizeHistory(

    value: unknown

): ChatTurn[] {

    if (!Array.isArray(value)) {

        return [];

    }

    return value.filter(

        (item): item is ChatTurn =>

            typeof item === "object" &&

            item !== null &&

            (item.role === "user" || item.role === "assistant") &&

            typeof item.content === "string"

    );

}

/**
 * Con cuántos jugadores se está jugando, saneado — solo se
 * acepta un entero positivo y razonable (hasta 99). Cualquier
 * otra cosa (texto, negativo, decimal, un número disparatado) se
 * descarta en vez de colarse tal cual en el prompt.
 */
function sanitizePlayerCount(

    value: unknown

): number | undefined {

    if (

        typeof value !== "number" ||
        !Number.isInteger(value) ||
        value < 1 ||
        value > 99

    ) {

        return undefined;

    }

    return value;

}

function buildChatOptions(

    body: AskQuestionRequest

): ChatContextOptions {

    return {

        history: sanitizeHistory(body.history),

        playerCount: sanitizePlayerCount(body.playerCount)

    };

}

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

                body.question,

                buildChatOptions(body)

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

                body.question,

                buildChatOptions(body)

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