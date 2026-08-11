"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AskQuestionUseCase = void 0;
class AskQuestionUseCase {
    validator;
    embeddingProvider;
    retriever;
    refiner;
    contextBuilder;
    chatProvider;
    constructor(validator, embeddingProvider, retriever, refiner, contextBuilder, chatProvider) {
        this.validator = validator;
        this.embeddingProvider = embeddingProvider;
        this.retriever = retriever;
        this.refiner = refiner;
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
        console.log("4. Reordenando y recortando contexto (1 sola llamada)...");
        const refined = await this.refiner.refine(question, retrieved);
        const context = this.contextBuilder.build(refined);
        console.log("✔ Contexto listo");
        console.log("");
        console.log("5. Generando respuesta...");
        const answer = await this.chatProvider.answer(question, context);
        console.log("✔ Respuesta generada");
        console.log("");
        return {
            answer,
            sources: refined
        };
    }
}
exports.AskQuestionUseCase = AskQuestionUseCase;
