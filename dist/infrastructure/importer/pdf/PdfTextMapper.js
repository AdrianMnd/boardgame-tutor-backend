"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfTextMapper = void 0;
class PdfTextMapper {
    map(document) {
        const pages = document.Pages.map((page, index) => this.mapPage(page, index + 1));
        return {
            totalPages: pages.length,
            pages
        };
    }
    mapPage(page, pageNumber) {
        const text = page.Texts
            .map(text => this.mapText(text))
            .filter(text => text.length > 0)
            .join(" ");
        return {
            page: pageNumber,
            text
        };
    }
    mapText(text) {
        return text.R
            .map(run => this.decode(run.T))
            .join("");
    }
    decode(value) {
        try {
            return decodeURIComponent(value);
        }
        catch {
            return value;
        }
    }
}
exports.PdfTextMapper = PdfTextMapper;
