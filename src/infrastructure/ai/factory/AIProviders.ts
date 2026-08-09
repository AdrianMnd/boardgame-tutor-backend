import type { ChatProvider } from "../../../domain/ai/chatProvider";

import type { IEmbeddingProvider } from "../../../domain/embeddings/IEmbeddingProvider";

import type { IContextReranker } from "../../../domain/knowledge/IContextReranker";

import type { IContextCompressor } from "../../../domain/knowledge/IContextCompressor";

export interface AIProviders {

    embeddingProvider: IEmbeddingProvider;

    chatProvider: ChatProvider;

    reranker: IContextReranker;

    compressor: IContextCompressor;

}