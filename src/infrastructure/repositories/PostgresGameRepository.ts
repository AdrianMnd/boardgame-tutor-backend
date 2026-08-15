import type { Pool } from "pg";

import { IGameRepository } from "../../domain/game/repositories/IGameRepository";

import type { ValidatedGame } from "../../domain/game/types/ValidatedGame";
import type { DocumentDescriptor } from "../../domain/game/types/DocumentDescriptor";

interface GameRow {

    id: string;

    name: string;

    language: string;

    version: string;

    min_players: number;

    max_players: number;

    year: number;

    cover_path: string | null;

}

interface DocumentRow {

    id: string;

    game_id: string;

    name: string;

    storage_path: string;

}

export class PostgresGameRepository
    implements IGameRepository {

    constructor(

        private readonly pool: Pool

    ) {}

    async list(): Promise<ValidatedGame[]> {

        const games =

            await this.pool.query<GameRow>(

                "SELECT * FROM games ORDER BY name ASC"

            );

        const documents =

            await this.pool.query<DocumentRow>(

                "SELECT * FROM documents"

            );

        const documentsByGame =

            this.groupDocumentsByGame(

                documents.rows

            );

        return games.rows.map(

            row =>

                this.toValidatedGame(

                    row,

                    documentsByGame.get(row.id) ?? []

                )

        );

    }

    async findById(

        gameId: string

    ): Promise<ValidatedGame | null> {

        const game =

            await this.pool.query<GameRow>(

                "SELECT * FROM games WHERE id = $1",

                [gameId]

            );

        const row = game.rows[0];

        if (!row) {

            return null;

        }

        const documents =

            await this.pool.query<DocumentRow>(

                "SELECT * FROM documents WHERE game_id = $1",

                [gameId]

            );

        return this.toValidatedGame(

            row,

            documents.rows.map(

                document => this.toDocumentDescriptor(document)

            )

        );

    }

    private groupDocumentsByGame(

        rows: DocumentRow[]

    ): Map<string, DocumentDescriptor[]> {

        const map = new Map<string, DocumentDescriptor[]>();

        for (const row of rows) {

            const list = map.get(row.game_id) ?? [];

            list.push(

                this.toDocumentDescriptor(row)

            );

            map.set(row.game_id, list);

        }

        return map;

    }

    private toDocumentDescriptor(

        row: DocumentRow

    ): DocumentDescriptor {

        return {

            id: row.id,

            name: row.name,

            storagePath: row.storage_path

        };

    }

    private toValidatedGame(

        row: GameRow,

        documents: DocumentDescriptor[]

    ): ValidatedGame {

        return {

            metadata: {

                id: row.id,

                name: row.name,

                language: row.language,

                version: row.version,

                minPlayers: row.min_players,

                maxPlayers: row.max_players,

                year: row.year

            },

            documents,

            coverPath: row.cover_path ?? undefined

        };

    }

}
