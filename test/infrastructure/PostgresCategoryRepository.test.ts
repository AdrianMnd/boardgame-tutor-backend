import { describe, expect, it, vi } from "vitest";

import { PostgresCategoryRepository } from "../../src/infrastructure/repositories/PostgresCategoryRepository";

describe("PostgresCategoryRepository", () => {

    it("list combina categorías y sus juegos correctamente", async () => {

        const query =

            vi.fn()

                .mockResolvedValueOnce({

                    rows: [

                        { id: "cat-1", name: "Cartas" },
                        { id: "cat-2", name: "Cooperativos" }

                    ]

                })

                .mockResolvedValueOnce({

                    rows: [

                        { category_id: "cat-1", game_id: "arkhamlcg" },
                        { category_id: "cat-1", game_id: "catan" },
                        { category_id: "cat-2", game_id: "arkhamlcg" }

                    ]

                });

        const repository =

            new PostgresCategoryRepository(

                { query } as unknown as import("pg").Pool

            );

        const result = await repository.list("user-1");

        expect(result).toEqual([

            { id: "cat-1", name: "Cartas", gameIds: ["arkhamlcg", "catan"] },
            { id: "cat-2", name: "Cooperativos", gameIds: ["arkhamlcg"] }

        ]);

    });

    it("rename devuelve false si la categoría no existe o no es del usuario (rowCount 0)", async () => {

        const query = vi.fn().mockResolvedValue({ rowCount: 0 });

        const repository =

            new PostgresCategoryRepository(

                { query } as unknown as import("pg").Pool

            );

        const result =

            await repository.rename(

                "user-1",

                "categoria-de-otro-usuario",

                "Nuevo nombre"

            );

        expect(result).toBe(false);

        const [sql, params] = query.mock.calls[0];
        expect(sql).toContain("WHERE id = $2 AND user_id = $3");
        expect(params).toEqual(["Nuevo nombre", "categoria-de-otro-usuario", "user-1"]);

    });

    it("rename devuelve true cuando sí es del usuario (rowCount 1)", async () => {

        const query = vi.fn().mockResolvedValue({ rowCount: 1 });

        const repository =

            new PostgresCategoryRepository(

                { query } as unknown as import("pg").Pool

            );

        const result =
            await repository.rename("user-1", "cat-1", "Nuevo nombre");

        expect(result).toBe(true);

    });

    it("delete filtra por id Y user_id — nunca podría borrar la categoría de otro", async () => {

        const query = vi.fn().mockResolvedValue({ rowCount: 0 });

        const repository =

            new PostgresCategoryRepository(

                { query } as unknown as import("pg").Pool

            );

        const result =
            await repository.delete("user-1", "categoria-ajena");

        expect(result).toBe(false);

        const [sql, params] = query.mock.calls[0];
        expect(sql).toContain("WHERE id = $1 AND user_id = $2");
        expect(params).toEqual(["categoria-ajena", "user-1"]);

    });

    it("addGame comprueba la propiedad ANTES de insertar — si no es del usuario, no llega a tocar user_category_games", async () => {

        const query = vi.fn().mockResolvedValue({ rows: [] });

        const repository =

            new PostgresCategoryRepository(

                { query } as unknown as import("pg").Pool

            );

        const result =

            await repository.addGame(

                "user-1",

                "categoria-ajena",

                "catan"

            );

        expect(result).toBe(false);

        expect(query).toHaveBeenCalledTimes(1);
        expect(query.mock.calls[0][0]).toContain("SELECT 1 FROM user_categories");

    });

    it("addGame sí inserta cuando la categoría es del usuario", async () => {

        const query =

            vi.fn()

                .mockResolvedValueOnce({ rows: [{ "?column?": 1 }] })
                .mockResolvedValueOnce({ rows: [] });

        const repository =

            new PostgresCategoryRepository(

                { query } as unknown as import("pg").Pool

            );

        const result =

            await repository.addGame(

                "user-1",

                "cat-1",

                "catan"

            );

        expect(result).toBe(true);
        expect(query).toHaveBeenCalledTimes(2);
        expect(query.mock.calls[1][0]).toContain("INSERT INTO user_category_games");

    });

    it("removeGame también comprueba la propiedad antes de borrar", async () => {

        const query = vi.fn().mockResolvedValue({ rows: [] });

        const repository =

            new PostgresCategoryRepository(

                { query } as unknown as import("pg").Pool

            );

        const result =

            await repository.removeGame(

                "user-1",

                "categoria-ajena",

                "catan"

            );

        expect(result).toBe(false);
        expect(query).toHaveBeenCalledTimes(1);

    });

});
