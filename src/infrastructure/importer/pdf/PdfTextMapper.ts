import { ExtractedDocument } from "../../../domain/importer/extractedDocument";
import { ExtractedPage } from "../../../domain/importer/extractedPage";

import {
    Pdf2JsonDocument,
    Pdf2JsonPage,
    Pdf2JsonText
} from "./Pdf2JsonDocument";

export class PdfTextMapper {

    map(
        document: Pdf2JsonDocument
    ): ExtractedDocument {

        const pages =
            document.Pages.map(

                (page, index) =>

                    this.mapPage(
                        page,
                        index + 1
                    )

            );

        return {

            totalPages: pages.length,

            pages

        };

    }

    private mapPage(

        page: Pdf2JsonPage,

        pageNumber: number

    ): ExtractedPage {

        const text =
            page.Texts

                .map(text =>

                    this.mapText(text)

                )

                .filter(text =>
                    text.length > 0
                )

                .join(" ");

        return {

            page: pageNumber,

            text

        };

    }

    private mapText(
        text: Pdf2JsonText
    ): string {

        return text.R

            .map(run =>

                this.decode(run.T)

            )

            .join("");

    }

    private decode(
        value: string
    ): string {

        try {

            return decodeURIComponent(value);

        }

        catch {

            return value;

        }

    }

}