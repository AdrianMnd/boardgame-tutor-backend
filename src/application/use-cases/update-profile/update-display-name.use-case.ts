import { BadRequestError } from "../../../presentation/api/errors/BadRequestError";

import type { IUserRepository } from "../../../domain/user/repositories/IUserRepository";
import type { User } from "../../../domain/user/types/User";

export class UpdateDisplayNameUseCase {

    constructor(

        private readonly repository: IUserRepository

    ) {}

    async execute(

        userId: string,

        displayName: string

    ): Promise<User> {

        const trimmed = displayName.trim();

        if (trimmed.length === 0) {

            throw new BadRequestError(

                "El nombre no puede estar vacío."

            );

        }

        return this.repository.updateDisplayName(

            userId,

            trimmed

        );

    }

}
