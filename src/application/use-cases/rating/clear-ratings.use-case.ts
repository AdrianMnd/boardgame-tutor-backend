import type { IMessageRatingRepository } from "../../../domain/rating/IMessageRatingRepository";

export class ClearRatingsUseCase {

    constructor(

        private readonly repository: IMessageRatingRepository

    ) {}

    async execute(): Promise<void> {

        await this.repository.deleteAll();

    }

}
