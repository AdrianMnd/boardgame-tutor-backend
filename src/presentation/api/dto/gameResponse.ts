export interface GameResponse {

    id: string;

    name: string;

    language: string;

    version: string;

    minPlayers: number;

    maxPlayers: number;

    year: number;

    coverUrl?: string;

    createdAt: string;

    documents: {

        id: string;

        name: string;

    }[];

}