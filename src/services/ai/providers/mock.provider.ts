import type { AIProvider } from "./ai-provider";
import type { AIResponse } from "../../../types/ai/AIResponse";


export class MockProvider
    implements AIProvider {

    async ask(
        question: string,
        context: string
    ): Promise<AIResponse> {

        return {

    answer: `...`,

    provider: "mock",

    model: "mock",

    durationMs: 1,

    usage: {

        inputTokens: 0,

        outputTokens: 0,

        totalTokens: 0

    }

};

    }

}