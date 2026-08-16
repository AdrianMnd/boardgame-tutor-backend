import type { IFavoritesRepository } from "../../../domain/user/repositories/IFavoritesRepository";

export class FavoritesUseCase {

    constructor(

        private readonly repository: IFavoritesRepository

    ) {}

    list(

        userId: string

    ): Promise<string[]> {

        return this.repository.list(userId);

    }

    add(

        userId: string,

        gameId: string

    ): Promise<void> {

        return this.repository.add(userId, gameId);

    }

    remove(

        userId: string,

        gameId: string

    ): Promise<void> {

        return this.repository.remove(userId, gameId);

    }

}
