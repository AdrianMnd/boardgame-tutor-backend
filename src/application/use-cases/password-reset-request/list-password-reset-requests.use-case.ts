import type {
    IPasswordResetRequestRepository,
    PasswordResetRequestRecord
} from "../../../domain/passwordResetRequest/IPasswordResetRequestRepository";

export class ListPasswordResetRequestsUseCase {

    constructor(

        private readonly repository: IPasswordResetRequestRepository

    ) {}

    async execute(): Promise<PasswordResetRequestRecord[]> {

        return this.repository.list();

    }

}
