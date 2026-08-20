export interface AskQuestionRequest {

    gameId: string;

    question: string;

    /**
     * Opcional — últimos mensajes de la conversación, para que
     * el backend pueda entender preguntas de seguimiento ("¿y
     * con 5 jugadores?"). El backend se queda solo con los
     * últimos turnos (ver MAX_HISTORY_TURNS en LLMChatProvider)
     * sin importar cuántos se manden aquí — no hace falta que
     * el cliente los recorte de antemano.
     */
    history?: {

        role: "user" | "assistant";

        content: string;

    }[];

}