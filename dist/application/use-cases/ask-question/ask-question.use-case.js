"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AskQuestionUseCase = void 0;
class AskQuestionUseCase {
    validator;
    embeddingProvider;
    retriever;
    reranker;
    compressor;
    contextBuilder;
    chatProvider;
    constructor(validator, embeddingProvider, retriever, reranker, compressor, contextBuilder, chatProvider) {
        this.validator = validator;
        this.embeddingProvider = embeddingProvider;
        this.retriever = retriever;
        this.reranker = reranker;
        this.compressor = compressor;
        this.contextBuilder = contextBuilder;
        this.chatProvider = chatProvider;
    }
    async execute(gameId, question) {
        console.log("1. Validando juego...");
        const game = await this.validator.validate(gameId);
        console.log("✔ Juego validado");
        console.log("");
        console.log("2. Generando embedding...");
        const embedding = await this.embeddingProvider.generate(question);
        console.log("✔ Embedding generado");
        console.log("");
        console.log("3. Recuperando contexto...");
        const retrieved = await this.retriever.retrieve(game, question, embedding);
        console.log(`✔ ${retrieved.length} fragmentos recuperados`);
        console.log("");
        console.log("4. Reordenando contexto...");
        const reranked = await this.reranker.rerank(question, retrieved);
        console.log("✔ Contexto reordenado");
        console.log("");
        console.log("5. Construyendo contexto...");
        const compressed = await this.compressor.compress(question, reranked);
        const context = this.contextBuilder.build(compressed);
        console.log("✔ Contexto construido");
        console.log("");
        console.log("6. Generando respuesta...");
        const answer = await this.chatProvider.answer(question, context);
        console.log("✔ Respuesta generada");
        console.log("");
        return {
            answer,
            sources: compressed
        };
    }
}
exports.AskQuestionUseCase = AskQuestionUseCase;
