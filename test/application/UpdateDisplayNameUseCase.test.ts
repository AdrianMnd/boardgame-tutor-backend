import { describe, expect, it, vi } from "vitest";

import { UpdateDisplayNameUseCase } from "../../src/application/use-cases/update-profile/update-display-name.use-case";
import { BadRequestError } from "../../src/presentation/api/errors/BadRequestError";

import type { IUserRepository } from "../../src/domain/user/repositories/IUserRepository";

function makeFakeRepository(

    overrides: Partial<IUserRepository> = {}

): IUserRepository {

    return {

        findByEmailWithPassword: vi.fn(),

        findById: vi.fn(),

        findByIdWithPassword: vi.fn(),

        create: vi.fn(),

        updateDisplayName: vi.fn().mockResolvedValue({

            id: "user-1",

            email: "test@example.com",

            displayName: "Nuevo nombre",

            createdAt: new Date().toISOString()

        }),

        updateEmail: vi.fn(),

        updatePasswordHash: vi.fn(),

        ...overrides

    };

}

describe("UpdateDisplayNameUseCase", () => {

    it("actualiza el nombre correctamente", async () => {

        const repository = makeFakeRepository();

        const useCase = new UpdateDisplayNameUseCase(repository);

        const result = await useCase.execute("user-1", "Nuevo nombre");

        expect(result.displayName).toBe("Nuevo nombre");
        expect(repository.updateDisplayName).toHaveBeenCalledWith("user-1", "Nuevo nombre");

    });

    it("recorta espacios en blanco antes de guardar", async () => {

        const repository = makeFakeRepository();

        const useCase = new UpdateDisplayNameUseCase(repository);

        await useCase.execute("user-1", "  Nuevo nombre  ");

        expect(repository.updateDisplayName).toHaveBeenCalledWith("user-1", "Nuevo nombre");

    });

    it("rechaza un nombre vacío", async () => {

        const repository = makeFakeRepository();

        const useCase = new UpdateDisplayNameUseCase(repository);

        await expect(

            useCase.execute("user-1", "   ")

        ).rejects.toBeInstanceOf(BadRequestError);

        expect(repository.updateDisplayName).not.toHaveBeenCalled();

    });

});
