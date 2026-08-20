import { describe, expect, it, vi } from "vitest";

import { PostgresGameRequestRepository } from "../../src/infrastructure/repositories/PostgresGameRequestRepository";

const fakeRow = {

    id: "request-1",

    requester_name: "Ana",

    requester_email: "ana@example.com",

    game_name: "Wingspan",

    bgg_url: null,

    pdf_keys: [],

    reviewed: false,

    created_at: new Date().toISOString()

};

describe("PostgresGameRequestRepository", () => {

    it("create guarda las rutas de B2 (pdf_keys), no URLs firmadas", async () => {

        const query = vi.fn().mockResolvedValue({ rows: [fakeRow] });

        const repository =

            new PostgresGameRequestRepository(

                { query } as unknown as import("pg").Pool

            );

        await repository.create({

            requesterName: "Ana",

            requesterEmail: "ana@example.com",

            gameName: "Wingspan",

            pdfKeys: ["pending-requests/abc/reglamento.pdf"]

        });

        const params = query.mock.calls[0][1];
        expect(params[4]).toEqual(["pending-requests/abc/reglamento.pdf"]);

    });

    it("list ordena las no revisadas primero, y dentro de cada grupo por fecha descendente", async () => {

        const query = vi.fn().mockResolvedValue({ rows: [fakeRow] });

        const repository =

            new PostgresGameRequestRepository(

                { query } as unknown as import("pg").Pool

            );

        await repository.list();

        const sql = query.mock.calls[0][0];
        expect(sql).toContain("ORDER BY reviewed ASC, created_at DESC");

    });

    it("markReviewed actualiza solo la solicitud indicada por id", async () => {

        const query = vi.fn().mockResolvedValue({ rows: [] });

        const repository =

            new PostgresGameRequestRepository(

                { query } as unknown as import("pg").Pool

            );

        await repository.markReviewed("request-1");

        const [sql, params] = query.mock.calls[0];
        expect(sql).toContain("SET reviewed = true WHERE id = $1");
        expect(params).toEqual(["request-1"]);

    });

});
