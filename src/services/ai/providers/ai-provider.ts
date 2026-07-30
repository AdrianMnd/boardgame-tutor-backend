import type { AIResponse } from "../../../types/ai/AIResponse";

export interface AIProvider {

    ask(
        question: string,
        context: string
    ): Promise<AIResponse>;

}