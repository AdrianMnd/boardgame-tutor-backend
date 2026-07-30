import type { AIProvider } from "./ai-provider";

import { MockProvider } from "./mock.provider";
import { OpenAIProvider } from "./openai.provider";
import { GeminiProvider } from "./gemini.provider";

export function createProvider(): AIProvider {

    switch (process.env.AI_PROVIDER) {

        case "openai":
            return new OpenAIProvider();

        case "gemini":
            return new GeminiProvider();

        default:
            return new MockProvider();

    }

}