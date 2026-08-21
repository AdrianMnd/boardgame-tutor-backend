import type { IPasswordResetRequestRepository } from "../../../domain/passwordResetRequest/IPasswordResetRequestRepository";

export class MarkPasswordResetRequestResolvedUseCase {

    constructor(

        private readonly repository: IPasswordResetRequestRepository

    ) {}

    async execute(

        id: string

    ): Promise<void> {

        await this.repository.markResolved(id);

    }

}
