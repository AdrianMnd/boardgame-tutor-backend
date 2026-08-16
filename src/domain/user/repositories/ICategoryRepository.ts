import type { UserCategory } from "../types/UserCategory";

export interface ICategoryRepository {

    list(

        userId: string

    ): Promise<UserCategory[]>;

    create(

        userId: string,

        name: string

    ): Promise<UserCategory>;

    /**
     * Los métodos que modifican una categoría concreta siempre
     * llevan userId, y comprueban en la propia consulta SQL que
     * la categoría pertenece a ese usuario — así es imposible
     * (ni por un fallo de programación en otra capa) que alguien
     * modifique la categoría de otra persona.
     *
     * Devuelven `false` si la categoría no existe o no
     * pertenece a ese usuario, para que el caso de uso pueda
     * traducirlo a un 404 sin distinguir ambos casos (por la
     * misma razón que en el login: no dar pistas de qué existe
     * y qué no).
     */
    rename(

        userId: string,

        categoryId: string,

        name: string

    ): Promise<boolean>;

    delete(

        userId: string,

        categoryId: string

    ): Promise<boolean>;

    addGame(

        userId: string,

        categoryId: string,

        gameId: string

    ): Promise<boolean>;

    removeGame(

        userId: string,

        categoryId: string,

        gameId: string

    ): Promise<boolean>;

}
