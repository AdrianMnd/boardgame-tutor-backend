import { describe, expect, it, vi } from "vitest";

import { GetRatingsSummaryUseCase } from "../../src/application/use-cases/rating/get-ratings-summary.use-case";

import type { IMessageRatingRepository } from "../../src/domain/rating/IMessageRatingRepository";

describe("GetRatingsSummaryUseCase", () => {

    it("combina el resumen por juego y las últimas valoraciones negativas", async () => {

        const repository: IMessageRatingRepository = {

            create: vi.fn(),

            summaryByGame: vi.fn().mockResolvedValue([

                { gameId: "catan", gameName: "Catan", up: 5, down: 2 }

            ]),

            recentNegative: vi.fn().mockResolvedValue([

                {

                    gameId: "catan",

                    gameName: "Catan",

                    question: "¿Cómo se comercia con el banco?",

                    answer: "No he encontrado esa información en el reglamento.",

                    createdAt: "2024-01-01T00:00:00.000Z"

                }

            ])

        };

        const useCase = new GetRatingsSummaryUseCase(repository);

        const result = await useCase.execute();

        expect(result.byGame).toHaveLength(1);
        expect(result.byGame[0].down).toBe(2);
        expect(result.recentNegative).toHaveLength(1);
        expect(result.recentNegative[0].gameName).toBe("Catan");

    });

    it("pide como mucho las últimas 15 valoraciones negativas", async () => {

        const repository: IMessageRatingRepository = {

            create: vi.fn(),

            summaryByGame: vi.fn().mockResolvedValue([]),

            recentNegative: vi.fn().mockResolvedValue([])

        };

        const useCase = new GetRatingsSummaryUseCase(repository);

        await useCase.execute();

        expect(repository.recentNegative).toHaveBeenCalledWith(15);

    });

});
