import { describe, expect, it, vi } from "vitest";

import { UpdatePasswordUseCase } from "../../src/application/use-cases/update-profile/update-password.use-case";
import { PasswordHasher } from "../../src/infrastructure/auth/PasswordHasher";

import { BadRequestError } from "../../src/presentation/api/errors/BadRequestError";
import { UnauthorizedError } from "../../src/presentation/api/errors/UnauthorizedError";

import type { IUserRepository } from "../../src/domain/user/repositories/IUserRepository";

async function makeRepositoryWithPassword(

    password: string

): Promise<IUserRepository> {

    const hasher = new PasswordHasher();

    const hash = await hasher.hash(password);

    return {

        findByEmailWithPassword: vi.fn(),

        findById: vi.fn(),

        findByIdWithPassword: vi.fn().mockResolvedValue({

            id: "user-1",

            email: "test@example.com",

            displayName: "Test",

            createdAt: new Date().toISOString(),

            passwordHash: hash

        }),

        create: vi.fn(),

        updateDisplayName: vi.fn(),

        updateEmail: vi.fn(),

        updatePasswordHash: vi.fn()

    };

}

describe("UpdatePasswordUseCase", () => {

    it("cambia la contraseña cuando la actual es correcta", async () => {

        const repository = await makeRepositoryWithPassword("contraseñaVieja123");

        const hasher = new PasswordHasher();

        const useCase = new UpdatePasswordUseCase(repository, hasher);

        await useCase.execute("user-1", "contraseñaVieja123", "contraseñaNueva456");

        expect(repository.updatePasswordHash).toHaveBeenCalledTimes(1);

        const [userId, newHash] =
            (repository.updatePasswordHash as ReturnType<typeof vi.fn>).mock.calls[0];

        expect(userId).toBe("user-1");

        expect(newHash).not.toBe("contraseñaNueva456");
        expect(await hasher.verify("contraseñaNueva456", newHash)).toBe(true);

    });

    it("NUNCA llega a cambiar el hash si la contraseña actual es incorrecta", async () => {

        const repository = await makeRepositoryWithPassword("contraseñaVieja123");

        const useCase = new UpdatePasswordUseCase(repository, new PasswordHasher());

        await expect(

            useCase.execute("user-1", "contraseñaIncorrecta", "contraseñaNueva456")

        ).rejects.toBeInstanceOf(UnauthorizedError);

        expect(repository.updatePasswordHash).not.toHaveBeenCalled();

    });

    it("rechaza una contraseña nueva demasiado corta, sin siquiera comprobar la actual", async () => {

        const repository = await makeRepositoryWithPassword("contraseñaVieja123");

        const useCase = new UpdatePasswordUseCase(repository, new PasswordHasher());

        await expect(

            useCase.execute("user-1", "contraseñaVieja123", "corta")

        ).rejects.toBeInstanceOf(BadRequestError);

        expect(repository.findByIdWithPassword).not.toHaveBeenCalled();
        expect(repository.updatePasswordHash).not.toHaveBeenCalled();

    });

});
