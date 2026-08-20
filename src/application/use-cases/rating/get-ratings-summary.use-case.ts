import type {
    IMessageRatingRepository,
    RatingSummaryByGame,
    RecentNegativeRating
} from "../../../domain/rating/IMessageRatingRepository";

const RECENT_NEGATIVE_LIMIT = 15;

export interface RatingsSummary {

    byGame: RatingSummaryByGame[];

    recentNegative: RecentNegativeRating[];

}

export class GetRatingsSummaryUseCase {

    constructor(

        private readonly repository: IMessageRatingRepository

    ) {}

    async execute(): Promise<RatingsSummary> {

        const [byGame, recentNegative] =

            await Promise.all([

                this.repository.summaryByGame(),

                this.repository.recentNegative(RECENT_NEGATIVE_LIMIT)

            ]);

        return { byGame, recentNegative };

    }

}
