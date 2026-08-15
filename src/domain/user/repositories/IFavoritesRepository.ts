export interface IFavoritesRepository {

    list(

        userId: string

    ): Promise<string[]>;

    add(

        userId: string,

        gameId: string

    ): Promise<void>;

    remove(

        userId: string,

        gameId: string

    ): Promise<void>;

}
