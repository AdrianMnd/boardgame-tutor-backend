import type { GameRequestRecord } from "./GameRequestRecord";

export interface IGameRequestRepository {

    create(

        input: Omit<GameRequestRecord, "id" | "reviewed" | "createdAt">

    ): Promise<GameRequestRecord>;

    list(): Promise<GameRequestRecord[]>;

    markReviewed(

        id: string

    ): Promise<void>;

    deleteAll(): Promise<void>;

}
