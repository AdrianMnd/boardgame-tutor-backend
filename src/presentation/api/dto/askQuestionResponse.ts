export interface AskQuestionResponse {

    answer: string;

    sources: SourceResponse[];

}

export interface SourceResponse {

    id: string;

    gameId: string;

    documentId: string;

    documentName: string;

    page: number;

    score: number;

    text: string;

}