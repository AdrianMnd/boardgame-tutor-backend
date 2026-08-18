import { describe, expect, it, vi } from "vitest";

import { PostgresConversationRepository } from "../../src/infrastructure/repositories/PostgresConversationRepository";

const fakeRow = {

    id: "msg-1",

    role: "user",

    content: "¿Cómo se gana?",

    sources: null,

    created_at: new Date().toISOString()

};

describe("PostgresConversationRepository", () => {

    it("listMessages devuelve los mensajes filtrados por usuario Y juego, en orden cronológico", async () => {

        const query = vi.fn().mockResolvedValue({ rows: [fakeRow] });

        const repository =

            new PostgresConversationRepository(

                { query } as unknown as import("pg").Pool

            );

        const result = await repository.listMessages("user-1", "catan");

        expect(result).toHaveLength(1);
        expect(result[0].content).toBe("¿Cómo se gana?");

        const [sql, params] = query.mock.calls[0];
        expect(sql).toContain("WHERE user_id = $1 AND game_id = $2");
        expect(sql).toContain("ORDER BY created_at ASC");
        expect(params).toEqual(["user-1", "catan"]);

    });

    it("addMessage serializa las fuentes como JSON antes de guardarlas", async () => {

        const query =

            vi.fn().mockResolvedValue({

                rows: [{

                    id: "msg-2",

                    role: "assistant",

                    content: "Se gana con 10 puntos.",

                    sources: [{ page: 4 }],

                    created_at: new Date().toISOString()

                }]

            });

        const repository =

            new PostgresConversationRepository(

                { query } as unknown as import("pg").Pool

            );

        await repository.addMessage(

            "user-1",

            "catan",

            "assistant",

            "Se gana con 10 puntos.",

            [{ page: 4 }]

        );

        const params = query.mock.calls[0][1];
        expect(params[4]).toBe(JSON.stringify([{ page: 4 }]));

    });

    it("addMessage guarda null cuando no se pasan fuentes (mensajes de usuario)", async () => {

        const query =

            vi.fn().mockResolvedValue({

                rows: [fakeRow]

            });

        const repository =

            new PostgresConversationRepository(

                { query } as unknown as import("pg").Pool

            );

        await repository.addMessage(

            "user-1",

            "catan",

            "user",

            "¿Cómo se gana?"

        );

        const params = query.mock.calls[0][1];
        expect(params[4]).toBeNull();

    });

    it("clearConversation filtra por user_id Y game_id — nunca podría borrar la conversación de otro usuario", async () => {

        const query = vi.fn().mockResolvedValue({ rows: [] });

        const repository =

            new PostgresConversationRepository(

                { query } as unknown as import("pg").Pool

            );

        await repository.clearConversation("user-1", "catan");

        const [sql, params] = query.mock.calls[0];
        expect(sql).toContain("WHERE user_id = $1 AND game_id = $2");
        expect(params).toEqual(["user-1", "catan"]);

    });

});
