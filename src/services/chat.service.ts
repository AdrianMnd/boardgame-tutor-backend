import { ChatResponse } from "../types/chat";

export class ChatService {

    getAnswer(game: string, question: string): ChatResponse {

        return {
            answer: `Has preguntado sobre "${game}": "${question}". Esta respuesta es simulada.`
        };

    }

}