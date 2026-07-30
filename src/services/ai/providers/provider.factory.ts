import { MockProvider } from "./mock.provider";
import { OpenAIProvider } from "./openai.provider";

export function createProvider() {

    const provider =
        process.env.AI_PROVIDER ??
        "mock";

    switch (provider) {

        case "openai":
            return new OpenAIProvider();

        default:
            return new MockProvider();

    }

}