import type { ValidatedGame } from "../../../domain/game/types/ValidatedGame";

import type { GameResponse } from "../dto/gameResponse";

export class GameMapper {

    static toResponse(

        game: ValidatedGame

    ): GameResponse {

        return {

            id: game.metadata.id,

            name: game.metadata.name,

            language: game.metadata.language,

            version: game.metadata.version,

            cover:

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