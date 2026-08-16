import { BadRequestError } from "../../../presentation/api/errors/BadRequestError";
import { NotFoundError } from "../../../presentation/api/errors/NotFoundError";

import type { ICategoryRepository } from "../../../domain/user/repositories/ICategoryRepository";
import type { UserCategory } from "../../../domain/user/types/UserCategory";

const MAX_NAME_LENGTH = 60;

function validateName(

    name: string

): string {

    const trimmed = name.trim();

    if (trimmed.length === 0) {

        throw new BadRequestError(

            "El nombre de la categoría no puede estar vacío."

        );

    }

    if (trimmed.length > MAX_NAME_LENGTH) {

        throw new BadRequestError(

            `El nombre de la categoría no puede tener más de ${MAX_NAME_LENGTH} caracteres.`

        );

    }

    return trimmed;

}

export class CategoriesUseCase {

    constructor(

        private readonly repository: ICategoryRepository

    ) {}

    list(

        userId: string

    ): Promise<UserCategory[]> {

        return this.repository.list(userId);

    }

    create(

        userId: string,

        name: string

    ): Promise<UserCategory> {

        return this.repository.create(

            userId,

            validateName(name)

        );

    }

    async rename(

        userId: string,

        categoryId: string,

        name: string

    ): Promise<void> {

        const found =

            await this.repository.rename(

                userId,

                categoryId,

                validateName(name)

            );

        if (!found) {

            throw new NotFoundError(

                "Categoría no encontrada."

            );

        }

    }

    async delete(

        userId: string,

        categoryId: string

    ): Promise<void> {

        const found =

            await this.repository.delete(

                userId,

                categoryId

            );

        if (!found) {

            throw new NotFoundError(

                "Categoría no encontrada."

            );

        }

    }

    async addGame(

        userId: string,

        categoryId: string,

        gameId: string

    ): Promise<void> {

        const found =

            await this.repository.addGame(

                userId,

                categoryId,

                gameId

            );

        if (!found) {

            throw new NotFoundError(

                "Categoría no encontrada."

            );

        }

    }

    async removeGame(

        userId: string,

        categoryId: string,

        gameId: string

    ): Promise<void> {

        const found =

            await this.repository.removeGame(

                userId,

                categoryId,

                gameId

            );

        if (!found) {

            throw new NotFoundError(

                "Categoría no encontrada."

            );

        }

    }

}
