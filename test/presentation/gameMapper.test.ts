import { describe, expect, it } from "vitest";

import { GameMapper } from "../../src/presentation/api/mappers/gameMapper";

import type { ValidatedGame } from "../../src/domain/game/types/ValidatedGame";

function makeGame(

    overrides: Partial<ValidatedGame["metadata"]> = {}

): ValidatedGame {

    return {

        metadata: {

            id: "catan",
            name: "Catan",
            language: "es",
            version: "1.0",
            minPlayers: 3,
            maxPlayers: 4,
            year: 1995,
            createdAt: "2026-01-15T10:30:00.000Z",

            ...overrides

        },

        documents: [],

        coverPath: undefined

    };

}

describe("GameMapper", () => {

    it("incluye createdAt en la respuesta, tal cual viene del dominio", () => {

        const response =
            GameMapper.toResponse(makeGame());

        expect(response.createdAt).toBe("2026-01-15T10:30:00.000Z");

    });

    it("no rompe si createdAt no viene informado (flujo de importación) — usa una cadena vacía como respaldo", () => {

        const response =

            GameMapper.toResponse(

                makeGame({ createdAt: undefined })

            );

        expect(response.createdAt).toBe("");

    });

    it("toResponses mapea createdAt en cada juego de la lista", () => {

        const responses =

            GameMapper.toResponses([

                makeGame({ id: "catan", createdAt: "2026-01-10T00:00:00.000Z" }),
                makeGame({ id: "arkham", createdAt: "2026-01-20T00:00:00.000Z" })

            ]);

        expect(responses.map(r => r.createdAt)).toEqual([

            "2026-01-10T00:00:00.000Z",
            "2026-01-20T00:00:00.000Z"

        ]);

    });

});
