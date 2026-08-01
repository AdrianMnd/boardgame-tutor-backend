import { GeminiConfiguration } from "../infrastructure/ai/gemini/geminiConfiguration";

export const GEMINI: GeminiConfiguration = {

    apiKey:

        process.env.GEMINI_API_KEY ?? "",

    embeddingModel:

        process.env.GEMINI_EMBEDDING_MODEL
            ?? "text-embedding-004",

    chatModel:

        process.env.GEMINI_CHAT_MODEL
            ?? "gemini-2.5-flash",

    apiVersion:

        process.env.GEMINI_API_VERSION
            ?? "v1beta"

};

if (!GEMINI.apiKey) {

    throw new Error(

        "No se ha configurado GEMINI_API_KEY."

    );

}