export const AI_CONFIGURATION = {

    provider:

        process.env.AI_PROVIDER
        ?? "gemini",

    chatProvider:

        process.env.AI_CHAT_PROVIDER
        ?? process.env.AI_PROVIDER
        ?? "gemini",

    embeddingProvider:

        process.env.AI_EMBEDDING_PROVIDER
        ?? "gemini"

} as const;