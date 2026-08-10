"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const Index_1 = require("../container/Index");
async function main() {
    const gameId = process.argv[2];
    const question = process.argv
        .slice(3)
        .join(" ");
    if (!gameId || !question) {
        console.log("");
        console.log("Uso:");
        console.log("");
        console.log("npm run ask <gameId> <pregunta>");
        console.log("");
        process.exit(1);
    }
    console.log("");
    console.log("==================================");
    console.log(`Consultando juego: ${gameId}`);
    console.log("==================================");
    console.log("");
    const result = await Index_1.container.askQuestionUseCase.execute(gameId, question);
    console.log("");
    console.log("Respuesta:");
    console.log("");
    console.log(result.answer);
    console.log("");
    console.log("Fuentes:");
    console.log("");
    for (const chunk of result.sources) {
        console.log(`Página ${chunk.page} (score ${chunk.score.toFixed(3)})`);
    }
    console.log("");
}
main().catch(error => {
    console.error(error);
    process.exit(1);
});
