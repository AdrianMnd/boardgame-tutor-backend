"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeChatProvider = void 0;
class FakeChatProvider {
    async ask(prompt) {
        console.log("");
        console.log("==================================");
        console.log("PROMPT");
        console.log("==================================");
        console.log("");
        console.log(prompt);
        console.log("");
        return "Respuesta simulada.";
    }
}
exports.FakeChatProvider = FakeChatProvider;
