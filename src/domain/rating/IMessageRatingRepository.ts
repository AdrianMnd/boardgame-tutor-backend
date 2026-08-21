export type RatingValue = "up" | "down";

export interface MessageRatingInput {

    gameId: string;

    userId?: string;

    question: string;

    answer: string;

    rating: RatingValue;

}

export interface RatingSummaryByGame {

    gameId: string;

    gameName: string;

    up: number;

    down: number;

}

export interface RecentNegativeRating {

    gameId: string;

    gameName: string;

    question: string;

    answer: string;

    createdAt: string;

}

export interface IMessageRatingRepository {

    create(

        input: MessageRatingInput

    ): Promise<void>;

    summaryByGame(): Promise<RatingSummaryByGame[]>;

    recentNegative(

        limit: number

    ): Promise<RecentNegativeRating[]>;

    deleteAll(): Promise<void>;

}
