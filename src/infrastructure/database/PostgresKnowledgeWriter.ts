import type { Pool, PoolClient } from "pg";

import type { GameMetadata } from "../../domain/game/types/GameMetadata";
import type { EmbeddedChunk } from "../../domain/importer/embeddedChunk";

export interface DocumentToWrite {

    id: string;

    name: string;

    storagePath: string;

}

export class PostgresKnowledgeWriter {

    constructor(

        private readonly pool: Pool

    ) {}

    async upsertGame(

        metadata: GameMetadata,

        coverPath?: string

    ): Promise<void> {

        await this.pool.query(

            `
            INSERT INTO games (id, name, language, version, min_players, max_players, year, cover_path)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                language = EXCLUDED.language,
                version = EXCLUDED.version,
                min_players = EXCLUDED.min_players,
                max_players = EXCLUDED.max_players,
                year = EXCLUDED.year,
                cover_path = COALESCE(EXCLUDED.cover_path, games.cover_path)
            `,

            [

                metadata.id,

                metadata.name,

                metadata.language,

                metadata.version,

                metadata.minPlayers,

                metadata.maxPlayers,

                metadata.year,

                coverPath ?? null

            ]

        );

    }

    async upsertDocument(

        gameId: string,

        document: DocumentToWrite

    ): Promise<void> {

        await this.pool.query(

            `
            INSERT INTO documents (id, game_id, name, storage_path)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (game_id, id) DO UPDATE SET
                name = EXCLUDED.name,
                storage_path = EXCLUDED.storage_path
            `,

            [

                document.id,

                gameId,

                document.name,

                document.storagePath

            ]

        );

    }

    async replaceChunks(

        gameId: string,

        chunks: EmbeddedChunk[]

    ): Promise<void> {

        const client = await this.pool.connect();

        try {

            await client.query("BEGIN");

            await client.query(

                "DELETE FROM chunks WHERE game_id = $1",

                [gameId]

            );

            const BATCH_SIZE = 200;

            for (

                let start = 0;

                start < chunks.length;

                start += BATCH_SIZE

            ) {

                const batch =

                    chunks.slice(

                        start,

                        start + BATCH_SIZE

                    );

                await this.insertBatch(

                    client,

                    batch

                );

            }

            await client.query("COMMIT");

        }
        catch (error) {

            await client.query("ROLLBACK");

            throw error;

        }
        finally {

            client.release();

        }

    }

    private async insertBatch(

        client: PoolClient,

        chunks: EmbeddedChunk[]

    ): Promise<void> {

        if (chunks.length === 0) {

            return;

        }

        const values: unknown[] = [];

        const placeholders: string[] = [];

        chunks.forEach(

            (chunk, index) => {

                const base = index * 7;

                placeholders.push(

                    `($${base + 1}, $${base + 2}, $${base + 3}, ` +
                    `$${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}::vector)`

                );

                values.push(

                    chunk.id,

                    chunk.gameId,

                    chunk.documentId,

                    chunk.page,

                    chunk.index,

                    chunk.text,

                    `[${chunk.embedding.join(",")}]`

                );

            }

        );

        await client.query(

            `
            INSERT INTO chunks (id, game_id, document_id, page, chunk_index, text, embedding)
            VALUES ${placeholders.join(", ")}
            `,

            values

        );

    }

}
