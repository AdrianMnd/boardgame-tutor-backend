import type { ChatTurn } from "./chatTurn";

export interface ChatContextOptions {

    history?: ChatTurn[];

    /**
     * Con cuántos jugadores se está jugando esta partida
     * concreta — opcional del todo. Si no se indica, la
     * respuesta no asume ningún número de jugadores, igual que
     * siempre.
     */
    playerCount?: number;

}

export interface ChatProvider {

    answer(
        question: string,
        context: string,
        options?: ChatContextOptions
    ): Promise<string>;

    /**
     * Igual que answer, pero entregando la respuesta en
     * fragmentos a medida que se genera. Opcional a nivel de
     * tipo por si algún día hay una implementación que no lo
     * soporte, pero LLMChatProvider (la única implementación
     * actual) siempre la ofrece.
     */
    answerStream?(
        question: string,
        context: string,
        options?: ChatContextOptions
    ): AsyncIterable<string>;

}