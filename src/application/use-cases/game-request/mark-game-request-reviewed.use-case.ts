import type { IGameRequestRepository } from "../../../domain/gameRequest/IGameRequestRepository";

export class MarkGameRequestReviewedUseCase {

    constructor(

        private readonly repository: IGameRequestRepository

    ) {}

    async execute(

        id: string

    ): Promise<void> {

        await this.repository.markReviewed(id);

    }

}
