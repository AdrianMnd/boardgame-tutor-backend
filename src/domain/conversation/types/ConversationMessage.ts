export interface ConversationMessage {

    id: string;

    role: "user" | "assistant";

    content: string;

    /**
     * Solo presente en mensajes de role="assistant" — las
     * fuentes citadas en esa respuesta. Se guarda tal cual llega
     * (mismo formato que ya devuelve /api/chat/stream), sin
     * mapear a un tipo de dominio propio — es un dato de solo
     * lectura para mostrarlo de vuelta al usuario, no algo sobre
     * lo que el backend necesite razonar.
     */
    sources?: unknown;

    createdAt: string;

}
