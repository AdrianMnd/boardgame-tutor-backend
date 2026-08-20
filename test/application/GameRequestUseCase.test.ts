import { describe, expect, it, vi } from "vitest";

import { GameRequestUseCase } from "../../src/application/use-cases/game-request/game-request.use-case";
import { BadRequestError } from "../../src/presentation/api/errors/BadRequestError";

import type { IFileStorage } from "../../src/shared/contracts/IFileStorage";
import type { EmailService } from "../../src/infrastructure/email/EmailService";
import type { IGameRequestRepository } from "../../src/domain/gameRequest/IGameRequestRepository";

function makeFakeStorage(

    overrides: Partial<IFileStorage> = {}

): IFileStorage {

    return {

        upload: vi.fn().mockResolvedValue(undefined),

        download: vi.fn(),

        exists: vi.fn(),

        getSignedDownloadUrl: vi.fn().mockResolvedValue("https://ejemplo.com/firmado"),

        ...overrides

    };

}

function makeFakeEmailService(): EmailService {

    return {

        sendGameRequestNotification: vi.fn().mockResolvedValue(undefined)

    } as unknown as EmailService;

}

function makeFakeRepository(): IGameRequestRepository {

    return {

        create: vi.fn().mockResolvedValue({

            id: "request-1",

            requesterName: "Ana",

            requesterEmail: "ana@example.com",

            gameName: "Wingspan",

            pdfKeys: [],

            reviewed: false,

            createdAt: new Date().toISOString()

        }),

        list: vi.fn().mockResolvedValue([]),

        markReviewed: vi.fn().mockResolvedValue(undefined)

    };

}

describe("GameRequestUseCase", () => {

    it("envía la notificación con los datos correctos, sin archivos", async () => {

        const storage = makeFakeStorage();

        const emailService = makeFakeEmailService();

        const repository = makeFakeRepository();

        const useCase = new GameRequestUseCase(storage, emailService, repository);

        await useCase.execute({

            requesterName: "Ana",

            requesterEmail: "ana@example.com",

            gameName: "Wingspan",

            bggUrl: "https://boardgamegeek.com/boardgame/266192/wingspan",

            files: []

        });

        expect(emailService.sendGameRequestNotification).toHaveBeenCalledWith({

            requesterName: "Ana",

            requesterEmail: "ana@example.com",

            gameName: "Wingspan",

            bggUrl: "https://boardgamegeek.com/boardgame/266192/wingspan",

            pdfLinks: []

        });

        expect(storage.upload).not.toHaveBeenCalled();

    });

    it("sube cada PDF a B2 y genera un enlace firmado para cada uno", async () => {

        const storage = makeFakeStorage({

            getSignedDownloadUrl:

                vi.fn()

                    .mockResolvedValueOnce("https://ejemplo.com/1")
                    .mockResolvedValueOnce("https://ejemplo.com/2")

        });

        const emailService = makeFakeEmailService();

        const repository = makeFakeRepository();

        const useCase = new GameRequestUseCase(storage, emailService, repository);

        await useCase.execute({

            requesterName: "Ana",

            requesterEmail: "ana@example.com",

            gameName: "Wingspan",

            files: [

                { originalName: "reglamento.pdf", buffer: Buffer.from("a"), contentType: "application/pdf" },
                { originalName: "faq.pdf", buffer: Buffer.from("b"), contentType: "application/pdf" }

            ]

        });

        expect(storage.upload).toHaveBeenCalledTimes(2);

        const emailCall =

            (emailService.sendGameRequestNotification as ReturnType<typeof vi.fn>).mock.calls[0][0];

        expect(emailCall.pdfLinks).toEqual([

            "https://ejemplo.com/1",

            "https://ejemplo.com/2"

        ]);

    });

    it("rechaza un nombre de juego vacío, sin llegar a subir nada ni mandar correo", async () => {

        const storage = makeFakeStorage();

        const emailService = makeFakeEmailService();

        const repository = makeFakeRepository();

        const useCase = new GameRequestUseCase(storage, emailService, repository);

        await expect(

            useCase.execute({

                requesterName: "Ana",

                requesterEmail: "ana@example.com",

                gameName: "   ",

                files: []

            })

        ).rejects.toBeInstanceOf(BadRequestError);

        expect(storage.upload).not.toHaveBeenCalled();
        expect(emailService.sendGameRequestNotification).not.toHaveBeenCalled();

    });

    it("rechaza un enlace que no es de BoardGameGeek", async () => {

        const storage = makeFakeStorage();

        const emailService = makeFakeEmailService();

        const repository = makeFakeRepository();

        const useCase = new GameRequestUseCase(storage, emailService, repository);

        await expect(

            useCase.execute({

                requesterName: "Ana",

                requesterEmail: "ana@example.com",

                gameName: "Wingspan",

                bggUrl: "https://ejemplo-cualquiera.com/juego",

                files: []

            })

        ).rejects.toBeInstanceOf(BadRequestError);

        expect(emailService.sendGameRequestNotification).not.toHaveBeenCalled();

    });

    it("acepta la solicitud sin ningún enlace de BGG (es opcional)", async () => {

        const storage = makeFakeStorage();

        const emailService = makeFakeEmailService();

        const repository = makeFakeRepository();

        const useCase = new GameRequestUseCase(storage, emailService, repository);

        await useCase.execute({

            requesterName: "Ana",

            requesterEmail: "ana@example.com",

            gameName: "Wingspan",

            files: []

        });

        expect(emailService.sendGameRequestNotification).toHaveBeenCalledWith(

            expect.objectContaining({ bggUrl: undefined })

        );

    });

    it("guarda la solicitud en el repositorio, con las rutas de B2 (no las URLs firmadas)", async () => {

        const storage = makeFakeStorage();

        const emailService = makeFakeEmailService();

        const repository = makeFakeRepository();

        const useCase = new GameRequestUseCase(storage, emailService, repository);

        await useCase.execute({

            requesterName: "Ana",

            requesterEmail: "ana@example.com",

            gameName: "Wingspan",

            bggUrl: "https://boardgamegeek.com/boardgame/266192/wingspan",

            files: [

                { originalName: "reglamento.pdf", buffer: Buffer.from("a"), contentType: "application/pdf" }

            ]

        });

        expect(repository.create).toHaveBeenCalledWith(

            expect.objectContaining({

                requesterName: "Ana",

                requesterEmail: "ana@example.com",

                gameName: "Wingspan",

                bggUrl: "https://boardgamegeek.com/boardgame/266192/wingspan",

                pdfKeys: [

                    expect.stringContaining("reglamento.pdf")

                ]

            })

        );

    });

    it("guarda la solicitud en el repositorio ANTES de mandar el correo", async () => {

        const storage = makeFakeStorage();

        const emailService = makeFakeEmailService();

        const repository = makeFakeRepository();

        const llamadas: string[] = [];

        repository.create =

            vi.fn().mockImplementation(async () => {

                llamadas.push("repository.create");

                return {

                    id: "request-1",

                    requesterName: "Ana",

                    requesterEmail: "ana@example.com",

                    gameName: "Wingspan",

                    pdfKeys: [],

                    reviewed: false,

                    createdAt: new Date().toISOString()

                };

            });

        emailService.sendGameRequestNotification =

            vi.fn().mockImplementation(async () => {

                llamadas.push("emailService.sendGameRequestNotification");

            });

        const useCase = new GameRequestUseCase(storage, emailService, repository);

        await useCase.execute({

            requesterName: "Ana",

            requesterEmail: "ana@example.com",

            gameName: "Wingspan",

            files: []

        });

        expect(llamadas).toEqual([

            "repository.create",

            "emailService.sendGameRequestNotification"

        ]);

    });

});
