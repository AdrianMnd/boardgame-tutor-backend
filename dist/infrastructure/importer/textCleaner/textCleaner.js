"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextCleaner = void 0;
class TextCleaner {
    clean(document) {
        return {
            totalPages: document.totalPages,
            pages: document.pages.map(page => ({
                ...page,
                text: this.cleanText(page.text)
            }))
        };
    }
    cleanText(text) {
        return text
            // Normalizar saltos de línea Windows
            .replace(/\r/g, "")
            // Sustituir tabuladores por espacios
            .replace(/\t/g, " ")
            // Eliminar espacios múltiples
            .replace(/ +/g, " ")
            // Máximo dos saltos de línea consecutivos
            .replace(/\n{3,}/g, "\n\n")
            // Eliminar espacios al principio y al final
            .trim();
    }
}
exports.TextCleaner = TextCleaner;
