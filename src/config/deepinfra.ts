import type { OpenAICompatibleConfiguration } from "../infrastructure/ai/common/OpenAICompatibleConfiguration";

/**
 * DeepInfra expone una API compatible con el formato de OpenAI
 * tanto para chat como para embeddings, con precios muy bajos
 * y algo de crédito gratuito al crear la cuenta.
 * https://deepinfra.com/docs
 */
export const DEEPINFRA: OpenAICompatibleConfiguration = {

    apiKey:

        process.env.DEEPINFRA_API_KEY ?? "",

    baseUrl:

        "https://api.deepinfra.com/v1/openai",

    chatModel:

        process.env.DEEPINFRA_CHAT_MODEL
            ?? "meta-llama/Meta-Llama-3.1-8B-Instruct",

    embeddingModel:

        process.env.DEEPINFRA_EMBEDDING_MODEL
            ?? "BAAI/bge-m3"

};
