export interface Pdf2JsonDocument {

    Pages: Pdf2JsonPage[];

}

export interface Pdf2JsonPage {

    Texts: Pdf2JsonText[];

}

export interface Pdf2JsonText {

    x: number;

    y: number;

    R: Pdf2JsonRun[];

}

export interface Pdf2JsonRun {

    T: string;

}