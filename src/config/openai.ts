import type { OpenAICompatibleConfiguration } from "../infrastructure/ai/common/OpenAICompatibleConfiguration";

export const OPENAI: OpenAICompatibleConfiguration = {

    apiKey:

        process.env.OPENAI_API_KEY ?? "",

    baseUrl:

        "https://api.openai.com/v1",

    chatModel:

        process.env.OPENAI_MODEL
            ?? "gpt-4o-mini",

    embeddingModel:

        process.env.OPENAI_EMBEDDING_MODEL
            ?? "text-embedding-3-small"

};
