import { describe, expect, it, vi } from "vitest";

import { PostgresGameRepository } from "../../src/infrastructure/repositories/PostgresGameRepository";

describe("PostgresGameRepository", () => {

    it("findById devuelve null si el juego no existe", async () => {

        const query =

            vi.fn().mockResolvedValue({ rows: [] });

        const fakePool =
            { query } as unknown as import("pg").Pool;

        const repository =
            new PostgresGameRepository(fakePool);

        const result =
            await repository.findById("no-existe");

        expect(result).toBeNull();

    });

    it("findById combina el juego con sus documentos", async () => {

        const query =

            vi.fn()

                .mockResolvedValueOnce({

                    rows: [{

                        id: "catan",
                        name: "Catan",
                        language: "es",
                        version: "1.0",
                        min_players: 3,
                        max_players: 4,
                        year: 1995,
                        cover_path: "catan/assets/cover.png",
                        created_at: "2026-01-15T10:30:00.000Z"

                    }]

                })

                .mockResolvedValueOnce({

                    rows: [{

                        id: "rulebook",
                        game_id: "catan",
                        name: "Rulebook",
                        storage_path: "catan/source/rulebook.pdf"

                    }]

                });

        const fakePool =
            { query } as unknown as import("pg").Pool;

        const repository =
            new PostgresGameRepository(fakePool);

        const result =
            await repository.findById("catan");

        expect(result).toEqual({

            metadata: {

                id: "catan",
                name: "Catan",
                language: "es",
                version: "1.0",
                minPlayers: 3,
                maxPlayers: 4,
                year: 1995,
                createdAt: "2026-01-15T10:30:00.000Z"

            },

            documents: [

                {
                    id: "rulebook",
                    name: "Rulebook",
                    storagePath: "catan/source/rulebook.pdf"
                }

            ],

            coverPath: "catan/assets/cover.png"

        });

    });

    it("un juego sin portada queda con coverPath undefined, no null", async () => {

        const query =

            vi.fn()

                .mockResolvedValueOnce({

                    rows: [{

                        id: "catan",
                        name: "Catan",
                        language: "es",
                        version: "1.0",
                        min_players: 3,
                        max_players: 4,
                        year: 1995,
                        cover_path: null

                    }]

                })

                .mockResolvedValueOnce({ rows: [] });

        const fakePool =
            { query } as unknown as import("pg").Pool;

        const repository =
            new PostgresGameRepository(fakePool);

        const result =
            await repository.findById("catan");

        expect(result?.coverPath).toBeUndefined();

    });

    it("list agrupa correctamente los documentos de varios juegos distintos", async () => {

        const listQuery =

            vi.fn()

                .mockResolvedValueOnce({

                    rows: [

                        {
                            id: "catan", name: "Catan", language: "es", version: "1.0",
                            min_players: 3, max_players: 4, year: 1995, cover_path: null
                        },

                        {
                            id: "40k", name: "Warhammer 40k", language: "es", version: "1.0",
                            min_players: 2, max_players: 2, year: 2026, cover_path: null
                        }

                    ]

                })

                .mockResolvedValueOnce({

                    rows: [

                        { id: "rulebook", game_id: "catan", name: "Rulebook", storage_path: "catan/source/rulebook.pdf" },

                        { id: "rulebook", game_id: "40k", name: "Rulebook", storage_path: "40k/source/rulebook.pdf" },

                        { id: "faq", game_id: "40k", name: "FAQ", storage_path: "40k/source/faq.pdf" }

                    ]

                });

        const listPool =
            { query: listQuery } as unknown as import("pg").Pool;

        const listRepository =
            new PostgresGameRepository(listPool);

        const result = await listRepository.list();

        expect(result).toHaveLength(2);

        const catan = result.find(g => g.metadata.id === "catan");
        const game40k = result.find(g => g.metadata.id === "40k");

        expect(catan?.documents).toHaveLength(1);
        expect(game40k?.documents).toHaveLength(2);
        expect(game40k?.documents.map(d => d.id).sort()).toEqual(["faq", "rulebook"]);

    });

});
