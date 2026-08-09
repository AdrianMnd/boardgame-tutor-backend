export interface NormalizedDocument {

    text: string;

    pageMap: {

        page: number;

        start: number;

        end: number;

    }[];

}