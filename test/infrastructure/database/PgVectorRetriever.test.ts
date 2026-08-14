import { describe, expect, it, vi } from "vitest";

import { PgVectorRetriever } from "../../../src/infrastructure/database/PgVectorRetriever";

import type { ValidatedGame } from "../../../src/domain/game/types/ValidatedGame";

function makeFakeGame(

    id: string

): ValidatedGame {

    return {

        metadata: {

            id,

            name: "Catan",

            language: "es",

            version: "1.0",

            minPlayers: 3,

            maxPlayers: 4,

            year: 1995

        },

        documents: []

    };

}

const configuration = {

    chunkSize: 600,

    chunkOverlap: 100,

    embeddingConcurrency: 1,

    embeddingRequestDelay: 0,

    embeddingBatchSize: 40,

    retryCount: 3,

    retryDelay: 0,

    maxRetrievedChunks: 5,

    minimumSimilarity: 0.7

};

describe("PgVectorRetriever", () => {

    it("consulta solo los chunks del juego indicado, ordenados por similitud", async () => {

        const query =

            vi.fn().mockResolvedValue({

                rows: [

                    {
                        id: "catan-rulebook-p1-c1",
                        game_id: "catan",
                        document_id: "rulebook",
                        document_name: "Rulebook",
                        page: 1,
                        text: "texto de ejemplo",
                        score: 0.92
                    }

                ]

            });

        const fakePool =
            { query } as unknown as import("pg").Pool;

        const retriever =

            new PgVectorRetriever(

                fakePool,

                configuration

            );

        const result =

            await retriever.retrieve(

                makeFakeGame("catan"),

                "¿cómo se gana?",

                [0.1, 0.2, 0.3]

            );

        expect(query).toHaveBeenCalledTimes(1);

        const [sql, params] = query.mock.calls[0];

        expect(sql).toContain("WHERE c.game_id = $1");
        expect(sql).toContain("ORDER BY c.embedding <=> $2::vector ASC");
        expect(sql).toContain("LIMIT $3");

        expect(params[0]).toBe("catan");
        expect(params[1]).toBe("[0.1,0.2,0.3]");
        expect(params[2]).toBe(5);

        expect(result).toEqual([

            {

                id: "catan-rulebook-p1-c1",

                gameId: "catan",

                documentId: "rulebook",

                documentName: "Rulebook",

                page: 1,

                text: "texto de ejemplo",

                score: 0.92

            }

        ]);

    });

    it("respeta maxRetrievedChunks al construir la consulta", async () => {

        const query =

            vi.fn().mockResolvedValue({ rows: [] });

        const fakePool =
            { query } as unknown as import("pg").Pool;

        const retriever =

            new PgVectorRetriever(

                fakePool,

                { ...configuration, maxRetrievedChunks: 3 }

            );

        await retriever.retrieve(

            makeFakeGame("40k"),

            "pregunta",

            [1, 0]

        );

        const [, params] = query.mock.calls[0];

        expect(params[2]).toBe(3);

    });

    it("devuelve una lista vacía si el juego no tiene chunks", async () => {

        const query =

            vi.fn().mockResolvedValue({ rows: [] });

        const fakePool =
            { query } as unknown as import("pg").Pool;

        const retriever =

            new PgVectorRetriever(

                fakePool,

                configuration

            );

        const result =

            await retriever.retrieve(

                makeFakeGame("juego-vacio"),

                "pregunta",

                [1, 0]

            );

        expect(result).toEqual([]);

    });

});
