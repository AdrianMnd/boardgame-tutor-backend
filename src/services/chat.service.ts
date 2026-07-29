import { ChatResponse } from "../types/chat";

export class ChatService {

    getAnswer(gameId: string, question: string): ChatResponse {

        return {
            answer: `Has preguntado sobre "${gameId}": "${question}". Esta respuesta es simulada.`
        };

    }

}