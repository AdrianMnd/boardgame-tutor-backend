import PDFParser from "pdf2json";

import { IPDFExtractor } from "../../../shared/contracts/IPDFExtractor";
import { ExtractedDocument } from "../../../domain/importer/extractedDocument";

import {
    Pdf2JsonDocument
} from "./Pdf2JsonDocument";

import { PdfTextMapper } from "./PdfTextMapper";
import { ConsoleOutputSuppressor } from "../../../application/logger/ConsoleOutputSuppressor";

export class Pdf2JsonExtractor
    implements IPDFExtractor {

    private readonly mapper =
        new PdfTextMapper();

    async extract(
        pdfPath: string
    ): Promise<ExtractedDocument> {

        const pdf =
        await ConsoleOutputSuppressor.run(

            () => this.parse(pdfPath)

        );

        return this.mapper.map(pdf);

    }

    private parse(
        pdfPath: string
    ): Promise<Pdf2JsonDocument> {

        return new Promise(

            (resolve, reject) => {

                const parser =
                    new PDFParser();

                parser.on(

                    "pdfParser_dataError",

                    error => reject(error)

                );

                parser.on(

                    "pdfParser_dataReady",

                    pdf => {

                        resolve(
                            pdf as Pdf2JsonDocument
                        );

                    }

                );
                
                parser.loadPDF(pdfPath);

            }

        );

    }

}