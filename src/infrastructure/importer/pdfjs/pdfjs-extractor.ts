import { readFile } from "node:fs/promises";

import {
    getDocument,
    GlobalWorkerOptions
} from "pdfjs-dist";
import { IPDFExtractor } from "../../../shared/contracts/IPDFExtractor";
import { ExtractedDocument } from "../../../domain/importer/extractedDocument";
import { ExtractedPage } from "../../../domain/importer/extractedPage";

GlobalWorkerOptions.workerSrc = "";

export class PdfJsExtractor
    implements IPDFExtractor {

    async extract(
        pdfPath: string
    ): Promise<ExtractedDocument> {

        const buffer =
            await readFile(pdfPath);

        const pdf =
            await getDocument({
                data: buffer
            }).promise;

        const pages: ExtractedPage[] = [];

        for (
            let pageNumber = 1;
            pageNumber <= pdf.numPages;
            pageNumber++
        ) {

            const page =
                await pdf.getPage(pageNumber);

            const content =
                await page.getTextContent();

            const text =
                content.items
                    .map(item => {

                        if ("str" in item) {

                            return item.str;

                        }

                        return "";

                    })
                    .join(" ");

            pages.push({

                page: pageNumber,

                text

            });

        }

        return {

            totalPages: pdf.numPages,

            pages

        };

    }

}