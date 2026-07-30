export interface AIUsage {

    inputTokens?: number;

    outputTokens?: number;

    totalTokens?: number;

}

export interface AIResponse {

    answer: string;

    provider: string;

    model: string;

    durationMs: number;

    usage?: AIUsage;

}