export type RatingValue = "up" | "down";

export interface MessageRatingInput {

    gameId: string;

    userId?: string;

    question: string;

    answer: string;

    rating: RatingValue;

}

export interface IMessageRatingRepository {

    create(

        input: MessageRatingInput

    ): Promise<void>;

}
