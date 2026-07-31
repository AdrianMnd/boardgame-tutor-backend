import type { ExtractedDocument } from "../../domain/importer/extractedDocument";

export interface IPDFExtractor {

    extract(
        pdfPath: string
    ): Promise<ExtractedDocument>;

}