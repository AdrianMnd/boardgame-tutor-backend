import { describe, expect, it, vi } from "vitest";

import { PostgresFavoritesRepository } from "../../src/infrastructure/repositories/PostgresFavoritesRepository";

describe("PostgresFavoritesRepository", () => {

    it("list devuelve solo los ids de juego", async () => {

        const query =

            vi.fn().mockResolvedValue({

                rows: [{ game_id: "catan" }, { game_id: "arkhamlcg" }]

            });

        const repository =

            new PostgresFavoritesRepository(

                { query } as unknown as import("pg").Pool

            );

        const result = await repository.list("user-1");

        expect(result).toEqual(["catan", "arkhamlcg"]);
        expect(query).toHaveBeenCalledWith(

            expect.stringContaining("WHERE user_id = $1"),

            ["user-1"]

        );

    });

    it("add filtra por user_id Y game_id, para no duplicar", async () => {

        const query = vi.fn().mockResolvedValue({ rows: [] });

        const repository =

            new PostgresFavoritesRepository(

                { query } as unknown as import("pg").Pool

            );

        await repository.add("user-1", "catan");

        const [sql, params] = query.mock.calls[0];

        expect(sql).toContain("ON CONFLICT (user_id, game_id) DO NOTHING");
        expect(params).toEqual(["user-1", "catan"]);

    });

    it("remove filtra por user_id Y game_id — nunca podría borrar el favorito de otro usuario", async () => {

        const query = vi.fn().mockResolvedValue({ rows: [] });

        const repository =

            new PostgresFavoritesRepository(

                { query } as unknown as import("pg").Pool

            );

        await repository.remove("user-1", "catan");

        const [sql, params] = query.mock.calls[0];

        expect(sql).toContain("WHERE user_id = $1 AND game_id = $2");
        expect(params).toEqual(["user-1", "catan"]);

    });

});
