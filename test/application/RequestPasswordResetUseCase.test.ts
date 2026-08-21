import { describe, expect, it, vi } from "vitest";

import { RequestPasswordResetUseCase } from "../../src/application/use-cases/password-reset-request/request-password-reset.use-case";
import { BadRequestError } from "../../src/presentation/api/errors/BadRequestError";

import type { IPasswordResetRequestRepository } from "../../src/domain/passwordResetRequest/IPasswordResetRequestRepository";

function makeFakeRepository(): IPasswordResetRequestRepository {

    return {

        create: vi.fn().mockResolvedValue(undefined),

        list: vi.fn(),

        markResolved: vi.fn()

    };

}

describe("RequestPasswordResetUseCase", () => {

    it("guarda la solicitud con un email válido", async () => {

        const repository = makeFakeRepository();

        const useCase = new RequestPasswordResetUseCase(repository);

        await useCase.execute("ana@example.com");

        expect(repository.create).toHaveBeenCalledWith("ana@example.com");

    });

    it("recorta espacios en blanco antes de guardar", async () => {

        const repository = makeFakeRepository();

        const useCase = new RequestPasswordResetUseCase(repository);

        await useCase.execute("  ana@example.com  ");

        expect(repository.create).toHaveBeenCalledWith("ana@example.com");

    });

    it("rechaza un email sin forma de email, sin tocar el repositorio", async () => {

        const repository = makeFakeRepository();

        const useCase = new RequestPasswordResetUseCase(repository);

        await expect(

            useCase.execute("esto no es un email")

        ).rejects.toBeInstanceOf(BadRequestError);

        expect(repository.create).not.toHaveBeenCalled();

    });

    it("no revela si el email corresponde a una cuenta real — siempre guarda la solicitud igual", async () => {

        const repository = makeFakeRepository();

        const useCase = new RequestPasswordResetUseCase(repository);

        await useCase.execute("cuenta-inexistente@example.com");

        expect(repository.create).toHaveBeenCalledWith("cuenta-inexistente@example.com");

    });

});
