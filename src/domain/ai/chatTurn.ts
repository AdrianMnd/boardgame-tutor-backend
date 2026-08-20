/**
 * Un turno de la conversación previa, tal como se manda al
 * generar una respuesta — solo lo imprescindible para dar
 * contexto a preguntas de seguimiento (no el objeto completo de
 * ConversationMessage, que incluye id/fuentes/fecha, ajenos a
 * esto).
 */
export interface ChatTurn {

    role: "user" | "assistant";

    content: string;

}
