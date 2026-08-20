import { describe, expect, it, vi } from "vitest";

import { PostgresMessageRatingRepository } from "../../src/infrastructure/repositories/PostgresMessageRatingRepository";

describe("PostgresMessageRatingRepository", () => {

    it("create guarda userId como null cuando la valoración es de un invitado", async () => {

        const query = vi.fn().mockResolvedValue({ rows: [] });

        const repository =

            new PostgresMessageRatingRepository(

                { query } as unknown as import("pg").Pool

            );

        await repository.create({

            gameId: "catan",

            question: "¿Cómo se gana?",

            answer: "Al llegar a 10 puntos.",

            rating: "up"

        });

        const params = query.mock.calls[0][1];
        expect(params[1]).toBeNull();

    });

    it("summaryByGame convierte los COUNT (que llegan como string desde pg) a number", async () => {

        const query =

            vi.fn().mockResolvedValue({

                rows: [

                    { game_id: "catan", game_name: "Catan", up: "5", down: "2" }

                ]

            });

        const repository =

            new PostgresMessageRatingRepository(

                { query } as unknown as import("pg").Pool

            );

        const result = await repository.summaryByGame();

        expect(result[0]).toEqual({

            gameId: "catan",

            gameName: "Catan",

            up: 5,

            down: 2

        });

        expect(typeof result[0].up).toBe("number");

    });

    it("recentNegative filtra solo las valoraciones negativas, con el límite indicado", async () => {

        const query = vi.fn().mockResolvedValue({ rows: [] });

        const repository =

            new PostgresMessageRatingRepository(

                { query } as unknown as import("pg").Pool

            );

        await repository.recentNegative(15);

        const [sql, params] = query.mock.calls[0];
        expect(sql).toContain("WHERE r.rating = 'down'");
        expect(params).toEqual([15]);

    });

});
