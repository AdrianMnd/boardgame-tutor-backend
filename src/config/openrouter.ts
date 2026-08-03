export interface OpenRouterConfiguration {

    apiKey: string;

    baseUrl: string;

    chatModel: string;

    embeddingModel: string;

}

export const OPENROUTER: OpenRouterConfiguration = {

    apiKey:

        process.env.OPENROUTER_API_KEY ?? "",

    baseUrl:

        "https://openrouter.ai/api/v1",

    chatModel:

       process.env.OPENROUTER_CHAT_MODEL
        ?? "openai/gpt-4.1-mini",

    embeddingModel:

        "text-embedding-3-small"

};