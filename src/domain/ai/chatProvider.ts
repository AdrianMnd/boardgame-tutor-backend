export interface ChatProvider {

    answer(
        question: string,
        context: string
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
        context: string
    ): AsyncIterable<string>;

}