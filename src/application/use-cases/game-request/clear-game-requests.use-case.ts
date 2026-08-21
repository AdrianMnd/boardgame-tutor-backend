import type { IGameRequestRepository } from "../../../domain/gameRequest/IGameRequestRepository";

export class ClearGameRequestsUseCase {

    constructor(

        private readonly repository: IGameRequestRepository

    ) {}

    async execute(): Promise<void> {

        await this.repository.deleteAll();

    }

}
