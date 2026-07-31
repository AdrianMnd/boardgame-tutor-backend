import { ExtractedDocument } from "../../../domain/importer/extractedDocument";

export class TextCleaner {

    clean(
        document: ExtractedDocument
    ): ExtractedDocument {

        return {

            totalPages: document.totalPages,

            pages: document.pages.map(page => ({

                ...page,

                text: this.cleanText(page.text)

            }))

        };

    }

    private cleanText(
        text: string
    ): string {

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