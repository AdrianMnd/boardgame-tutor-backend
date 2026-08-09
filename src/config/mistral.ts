import type { OpenAICompatibleConfiguration } from "../infrastructure/ai/common/OpenAICompatibleConfiguration";

export const MISTRAL: OpenAICompatibleConfiguration = {

    apiKey:

        process.env.MISTRAL_API_KEY ?? "",

    baseUrl:

        "https://api.mistral.ai/v1",

    chatModel:

        process.env.MISTRAL_CHAT_MODEL
            ?? "mistral-small-latest",

    embeddingModel:

        process.env.MISTRAL_EMBEDDING_MODEL
            ?? "mistral-embed"

};
