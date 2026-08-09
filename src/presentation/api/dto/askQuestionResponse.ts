export interface AskQuestionResponse {

    answer: string;

    sources: SourceResponse[];

}

export interface SourceResponse {

    id: string;

    gameId: string;

    page: number;

    score: number;

    text: string;

}