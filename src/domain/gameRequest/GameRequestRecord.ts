export interface GameRequestRecord {

    id: string;

    requesterName: string;

    requesterEmail: string;

    gameName: string;

    bggUrl?: string;

    pdfKeys: string[];

    reviewed: boolean;

    createdAt: string;

}
