import { describe, expect, it, vi } from "vitest";

import { UpdateEmailUseCase } from "../../src/application/use-cases/update-profile/update-email.use-case";
import { PasswordHasher } from "../../src/infrastructure/auth/PasswordHasher";

import { BadRequestError } from "../../src/presentation/api/errors/BadRequestError";
import { ConflictError } from "../../src/presentation/api/errors/ConflictError";
import { UnauthorizedError } from "../../src/presentation/api/errors/UnauthorizedError";

import type { IUserRepository } from "../../src/domain/user/repositories/IUserRepository";

async function makeRepositoryWithPassword(

    password: string,

    overrides: Partial<IUserRepository> = {}

): Promise<IUserRepository> {

    const hasher = new PasswordHasher();

    const hash = await hasher.hash(password);

    return {

        findByEmailWithPassword: vi.fn(),

        findById: vi.fn(),

        findByIdWithPassword: vi.fn().mockResolvedValue({

            id: "user-1",

            email: "viejo@example.com",

            displayName: "Test",

            createdAt: new Date().toISOString(),

            passwordHash: hash

        }),

        create: vi.fn(),

        updateDisplayName: vi.fn(),

        updateEmail: vi.fn().mockResolvedValue({

            id: "user-1",

            email: "nuevo@example.com",

            displayName: "Test",

            createdAt: new Date().toISOString()

        }),

        updatePasswordHash: vi.fn(),

        ...overrides

    };

}

describe("UpdateEmailUseCase", () => {

    it("actualiza el email cuando la contraseña actual es correcta", async () => {

        const repository = await makeRepositoryWithPassword("miContraseña123");

        const useCase = new UpdateEmailUseCase(repository, new PasswordHasher());

        const result =

            await useCase.execute(

                "user-1",

                "nuevo@example.com",

                "miContraseña123"

            );

        expect(result.email).toBe("nuevo@example.com");

    });

    it("NUNCA llega a llamar a updateEmail si la contraseña actual es incorrecta", async () => {

        const repository = await makeRepositoryWithPassword("miContraseña123");

        const useCase = new UpdateEmailUseCase(repository, new PasswordHasher());

        await expect(

            useCase.execute("user-1", "nuevo@example.com", "contraseñaIncorrecta")

        ).rejects.toBeInstanceOf(UnauthorizedError);

        expect(repository.updateEmail).not.toHaveBeenCalled();

    });

    it("rechaza un formato de email inválido, sin siquiera comprobar la contraseña", async () => {

        const repository = await makeRepositoryWithPassword("miContraseña123");

        const useCase = new UpdateEmailUseCase(repository, new PasswordHasher());

        await expect(

            useCase.execute("user-1", "esto-no-es-un-email", "miContraseña123")

        ).rejects.toBeInstanceOf(BadRequestError);

        expect(repository.findByIdWithPassword).not.toHaveBeenCalled();
        expect(repository.updateEmail).not.toHaveBeenCalled();

    });

    it("lanza ConflictError si el email ya lo usa otra cuenta", async () => {

        const repository =

            await makeRepositoryWithPassword("miContraseña123", {

                updateEmail: vi.fn().mockResolvedValue(null)

            });

        const useCase = new UpdateEmailUseCase(repository, new PasswordHasher());

        await expect(

            useCase.execute("user-1", "yaexiste@example.com", "miContraseña123")

        ).rejects.toBeInstanceOf(ConflictError);

    });

});
