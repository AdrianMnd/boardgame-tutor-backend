import type { ChatProvider } from "../../../domain/ai/chatProvider";

import type { IEmbeddingProvider } from "../../../domain/embeddings/IEmbeddingProvider";

import type { IContextRefiner } from "../../../domain/knowledge/IContextRefiner";

export interface AIProviders {

    embeddingProvider: IEmbeddingProvider;

    chatProvider: ChatProvider;

    refiner: IContextRefiner;

}