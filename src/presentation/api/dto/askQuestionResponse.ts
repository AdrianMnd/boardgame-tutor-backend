export interface AskQuestionResponse {

    answer: string;

    sources: SourceResponse[];

}

export interface SourceResponse {

    page: number;

    score: number;

}