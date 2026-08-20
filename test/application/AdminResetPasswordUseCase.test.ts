import { describe, expect, it, vi } from "vitest";

import { AdminResetPasswordUseCase } from "../../src/application/use-cases/admin/admin-reset-password.use-case";
import { NotFoundError } from "../../src/presentation/api/errors/NotFoundError";
import { PasswordHasher } from "../../src/infrastructure/auth/PasswordHasher";

import type { IUserRepository } from "../../src/domain/user/repositories/IUserRepository";

function makeFakeRepository(

    overrides: Partial<IUserRepository> = {}

): IUserRepository {

    return {

        findByEmailWithPassword: vi.fn(),

        findById: vi.fn(),

        findByIdWithPassword: vi.fn(),

        create: vi.fn(),

        updateDisplayName: vi.fn(),

        updateEmail: vi.fn(),

        updatePasswordHash: vi.fn().mockResolvedValue(undefined),

        ...overrides

    };

}

describe("AdminResetPasswordUseCase", () => {

    it("genera una contraseña temporal, la hashea y actualiza al usuario correcto", async () => {

        const repository =

            makeFakeRepository({

                findByEmailWithPassword: vi.fn().mockResolvedValue({

                    id: "user-1",

                    email: "ana@example.com",

                    displayName: "Ana",

                    passwordHash: "hash-antiguo"

                })

            });

        const useCase =

            new AdminResetPasswordUseCase(repository, new PasswordHasher());

        const temporaryPassword = await useCase.execute("ana@example.com");

        expect(temporaryPassword).toBeTruthy();
        expect(typeof temporaryPassword).toBe("string");

        expect(repository.updatePasswordHash).toHaveBeenCalledTimes(1);

        const [userId, passwordHash] =

            (repository.updatePasswordHash as ReturnType<typeof vi.fn>).mock.calls[0];

        expect(userId).toBe("user-1");

        expect(passwordHash).not.toBe(temporaryPassword);
        expect(passwordHash).toMatch(/^\$2[aby]\$/);

    });

    it("dos llamadas seguidas generan contraseñas temporales distintas", async () => {

        const repository =

            makeFakeRepository({

                findByEmailWithPassword: vi.fn().mockResolvedValue({

                    id: "user-1",

                    email: "ana@example.com",

                    displayName: "Ana",

                    passwordHash: "hash-antiguo"

                })

            });

        const useCase =

            new AdminResetPasswordUseCase(repository, new PasswordHasher());

        const primera = await useCase.execute("ana@example.com");

        const segunda = await useCase.execute("ana@example.com");

        expect(primera).not.toBe(segunda);

    });

    it("lanza NotFoundError si no existe ninguna cuenta con ese email, sin tocar el repositorio de escritura", async () => {

        const repository =

            makeFakeRepository({

                findByEmailWithPassword: vi.fn().mockResolvedValue(null)

            });

        const useCase =

            new AdminResetPasswordUseCase(repository, new PasswordHasher());

        await expect(

            useCase.execute("no-existe@example.com")

        ).rejects.toBeInstanceOf(NotFoundError);

        expect(repository.updatePasswordHash).not.toHaveBeenCalled();

    });

});
