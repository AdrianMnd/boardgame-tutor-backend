import { describe, expect, it, vi } from "vitest";

import { ListGameRequestsUseCase } from "../../src/application/use-cases/game-request/list-game-requests.use-case";

import type { IGameRequestRepository } from "../../src/domain/gameRequest/IGameRequestRepository";
import type { IFileStorage } from "../../src/shared/contracts/IFileStorage";

describe("ListGameRequestsUseCase", () => {

    it("regenera un enlace firmado fresco por cada PDF, a partir de las rutas guardadas", async () => {

        const repository: IGameRequestRepository = {

            create: vi.fn(),

            markReviewed: vi.fn(),

            list: vi.fn().mockResolvedValue([

                {

                    id: "request-1",

                    requesterName: "Ana",

                    requesterEmail: "ana@example.com",

                    gameName: "Wingspan",

                    bggUrl: undefined,

                    pdfKeys: [

                        "pending-requests/abc/reglamento.pdf",

                        "pending-requests/abc/faq.pdf"

                    ],

                    reviewed: false,

                    createdAt: "2024-01-01T00:00:00.000Z"

                }

            ])

        };

        const storage: IFileStorage = {

            upload: vi.fn(),

            download: vi.fn(),

            exists: vi.fn(),

            getSignedDownloadUrl:

                vi.fn()

                    .mockResolvedValueOnce("https://ejemplo.com/reglamento-firmado")
                    .mockResolvedValueOnce("https://ejemplo.com/faq-firmado")

        };

        const useCase = new ListGameRequestsUseCase(repository, storage);

        const result = await useCase.execute();

        expect(result).toHaveLength(1);
        expect(result[0].pdfLinks).toEqual([

            "https://ejemplo.com/reglamento-firmado",

            "https://ejemplo.com/faq-firmado"

        ]);

        expect(result[0]).not.toHaveProperty("pdfKeys");

    });

    it("una solicitud sin PDF no genera ninguna llamada de firmado", async () => {

        const repository: IGameRequestRepository = {

            create: vi.fn(),

            markReviewed: vi.fn(),

            list: vi.fn().mockResolvedValue([

                {

                    id: "request-1",

                    requesterName: "Ana",

                    requesterEmail: "ana@example.com",

                    gameName: "Wingspan",

                    pdfKeys: [],

                    reviewed: false,

                    createdAt: "2024-01-01T00:00:00.000Z"

                }

            ])

        };

        const storage: IFileStorage = {

            upload: vi.fn(),

            download: vi.fn(),

            exists: vi.fn(),

            getSignedDownloadUrl: vi.fn()

        };

        const useCase = new ListGameRequestsUseCase(repository, storage);

        const result = await useCase.execute();

        expect(result[0].pdfLinks).toEqual([]);
        expect(storage.getSignedDownloadUrl).not.toHaveBeenCalled();

    });

});
