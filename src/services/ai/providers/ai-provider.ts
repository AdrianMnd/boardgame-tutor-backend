import type { AIResponse } from "../../../types/AIResponse";

export interface AIProvider {

    ask(
        question: string,
        context: string
    ): Promise<AIResponse>;

}