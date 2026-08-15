import type { ValidatedGame }
    from "../../../domain/game/types/ValidatedGame";

import type { GameResponse }
    from "../dto/gameResponse";

// Se usa `||` en vez de `??` a propósito: una variable de
// entorno puesta pero vacía (ej. "API_PUBLIC_URL=" sin nada
// detrás en el .env) sigue contando como "tiene valor" para
// `??`, y el resultado sería una URL relativa en vez de
// absoluta — justo el tipo de fallo silencioso que rompe las
// portadas sin dar ningún error visible.
const BASE_URL =

    process.env.API_PUBLIC_URL
    || process.env.RENDER_EXTERNAL_URL
    || `http://localhost:${process.env.PORT || 3000}`;

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

                game.coverPath

                    ? `${BASE_URL}/api/games/${game.metadata.id}/cover`

                    : undefined,

            documents:

                game.documents.map(

                    document => ({

                        id: document.id,

                        name: document.name

                    })

                )

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