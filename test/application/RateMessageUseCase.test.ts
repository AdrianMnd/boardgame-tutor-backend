import { describe, expect, it, vi } from "vitest";

import { RateMessageUseCase } from "../../src/application/use-cases/rating/rate-message.use-case";
import { BadRequestError } from "../../src/presentation/api/errors/BadRequestError";

import type { IMessageRatingRepository } from "../../src/domain/rating/IMessageRatingRepository";

function makeFakeRepository(): IMessageRatingRepository {

    return {

        create: vi.fn().mockResolvedValue(undefined)

    };

}

const validInput = {

    gameId: "catan",

    question: "¿Cómo se gana?",

    answer: "Se gana al llegar a 10 puntos de victoria.",

    rating: "up" as const

};

describe("RateMessageUseCase", () => {

    it("guarda la valoración con los datos correctos", async () => {

        const repository = makeFakeRepository();

        const useCase = new RateMessageUseCase(repository);

        await useCase.execute({ ...validInput, userId: "user-1" });

        expect(repository.create).toHaveBeenCalledWith(

            expect.objectContaining({

                gameId: "catan",

                userId: "user-1",

                rating: "up"

            })

        );

    });

    it("funciona sin userId — valorar no requiere sesión", async () => {

        const repository = makeFakeRepository();

        const useCase = new RateMessageUseCase(repository);

        await useCase.execute(validInput);

        expect(repository.create).toHaveBeenCalledWith(

            expect.objectContaining({ userId: undefined })

        );

    });

    it("rechaza un rating que no sea \"up\" ni \"down\"", async () => {

        const repository = makeFakeRepository();

        const useCase = new RateMessageUseCase(repository);

        await expect(

            useCase.execute({

                ...validInput,

                rating: "excelente" as never

            })

        ).rejects.toBeInstanceOf(BadRequestError);

        expect(repository.create).not.toHaveBeenCalled();

    });

    it("rechaza si falta la pregunta o la respuesta", async () => {

        const repository = makeFakeRepository();

        const useCase = new RateMessageUseCase(repository);

        await expect(

            useCase.execute({ ...validInput, question: "   " })

        ).rejects.toBeInstanceOf(BadRequestError);

        expect(repository.create).not.toHaveBeenCalled();

    });

    it("recorta textos desproporcionadamente largos antes de guardarlos", async () => {

        const repository = makeFakeRepository();

        const useCase = new RateMessageUseCase(repository);

        await useCase.execute({

            ...validInput,

            answer: "a".repeat(10000)

        });

        const saved =

            (repository.create as ReturnType<typeof vi.fn>).mock.calls[0][0];

        expect(saved.answer.length).toBeLessThanOrEqual(4000);

    });

});
