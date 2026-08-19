import type { ChatProvider } from "../../../domain/ai/chatProvider";

import type { IEmbeddingProvider } from "../../../domain/embeddings/IEmbeddingProvider";

export interface AIProviders {

    embeddingProvider: IEmbeddingProvider;

    chatProvider: ChatProvider;

}