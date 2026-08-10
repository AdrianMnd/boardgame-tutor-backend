"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleImportLogger = void 0;
class ConsoleImportLogger {
    header(gameId) {
        console.log("");
        console.log("────────────────────────────────────────────");
        console.log(" BoardGame Tutor Importer");
        console.log("────────────────────────────────────────────");
        console.log("");
        console.log(` Juego: ${gameId}`);
        console.log("");
    }
    step(message) {
        console.log(`▶ ${message}`);
    }
    success(message) {
        console.log(`✔ ${message}`);
    }
    info(message) {
        console.log(`ℹ ${message}`);
    }
    warning(message) {
        console.log(`⚠ ${message}`);
    }
    error(message) {
        console.log(`✖ ${message}`);
    }
    footer(elapsedMs) {
        console.log("");
        console.log("────────────────────────────────────────────");
        console.log(`Importación completada en ${(elapsedMs / 1000).toFixed(2)} s`);
        console.log("────────────────────────────────────────────");
        console.log("");
    }
}
exports.ConsoleImportLogger = ConsoleImportLogger;
