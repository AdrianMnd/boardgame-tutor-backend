import type { ValidatedGame }
    from "../../../domain/game/types/ValidatedGame";

import type { GameResponse }
    from "../dto/gameResponse";

const BASE_URL =

    process.env.API_PUBLIC_URL
    ?? `http://localhost:${process.env.PORT ?? 3000}`;

export class GameMapper {

    static toResponse(

        game: ValidatedGame

    ): GameResponse {

        return {

            id: game.metadata.id,

            name: game.metadata.name,

            language: game.metadata.language,

            version: game.metadata.version,

            minPlayers: game.metadata.minPlayers,

            maxPlayers: game.metadata.maxPlayers,

            year: game.metadata.year,

            coverUrl:

                `/games/${game.metadata.id}/assets/cover.png`

        };

    }

    static toResponses(

        games: ValidatedGame[]

    ): GameResponse[] {

        return games.map(

            GameMapper.toResponse

        );

    }

}