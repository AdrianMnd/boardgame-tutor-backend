"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pdf2JsonExtractor = void 0;
const pdf2json_1 = __importDefault(require("pdf2json"));
const PdfTextMapper_1 = require("./PdfTextMapper");
const ConsoleOutputSuppressor_1 = require("../../../application/logger/ConsoleOutputSuppressor");
class Pdf2JsonExtractor {
    mapper = new PdfTextMapper_1.PdfTextMapper();
    async extract(pdfPath) {
        const pdf = await ConsoleOutputSuppressor_1.ConsoleOutputSuppressor.run(() => this.parse(pdfPath));
        return this.mapper.map(pdf);
    }
    parse(pdfPath) {
        return new Promise((resolve, reject) => {
            const parser = new pdf2json_1.default();
            parser.on("pdfParser_dataError", error => reject(error));
            parser.on("pdfParser_dataReady", pdf => {
                resolve(pdf);
            });
            parser.loadPDF(pdfPath);
        });
    }
}
exports.Pdf2JsonExtractor = Pdf2JsonExtractor;
