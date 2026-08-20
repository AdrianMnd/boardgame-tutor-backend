import { afterEach, describe, expect, it, vi } from "vitest";

import { requireAdmin } from "../../../src/presentation/api/middleware/requireAdmin";
import { UnauthorizedError } from "../../../src/presentation/api/errors/UnauthorizedError";

import type { IUserRepository } from "../../../src/domain/user/repositories/IUserRepository";
import type { AuthenticatedRequest } from "../../../src/presentation/api/middleware/requireAuth";

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

        updatePasswordHash: vi.fn(),

        ...overrides

    };

}

function makeRequest(

    userId: string

) {

    return { userId } as unknown as AuthenticatedRequest;

}

describe("requireAdmin", () => {

    afterEach(() => {

        delete process.env.ADMIN_EMAIL;

    });

    it("deja pasar si el email del usuario coincide con ADMIN_EMAIL", async () => {

        process.env.ADMIN_EMAIL = "admin@example.com";

        const repository =

            makeFakeRepository({

                findById: vi.fn().mockResolvedValue({

                    id: "user-1",

                    email: "admin@example.com",

                    displayName: "Admin"

                })

            });

        const middleware = requireAdmin(repository);

        const next = vi.fn();

        await middleware(makeRequest("user-1"), {} as never, next);

        expect(next).toHaveBeenCalledOnce();

    });

    it("la comparación no distingue mayúsculas/minúsculas", async () => {

        process.env.ADMIN_EMAIL = "Admin@Example.com";

        const repository =

            makeFakeRepository({

                findById: vi.fn().mockResolvedValue({

                    id: "user-1",

                    email: "admin@example.com",

                    displayName: "Admin"

                })

            });

        const middleware = requireAdmin(repository);

        const next = vi.fn();

        await middleware(makeRequest("user-1"), {} as never, next);

        expect(next).toHaveBeenCalledOnce();

    });

    it("rechaza si el usuario existe pero su email no es el del administrador", async () => {

        process.env.ADMIN_EMAIL = "admin@example.com";

        const repository =

            makeFakeRepository({

                findById: vi.fn().mockResolvedValue({

                    id: "user-2",

                    email: "otra-persona@example.com",

                    displayName: "Otra persona"

                })

            });

        const middleware = requireAdmin(repository);

        await expect(

            middleware(makeRequest("user-2"), {} as never, vi.fn())

        ).rejects.toBeInstanceOf(UnauthorizedError);

    });

    it("rechaza si ADMIN_EMAIL no está configurado, aunque el usuario exista", async () => {

        const repository =

            makeFakeRepository({

                findById: vi.fn().mockResolvedValue({

                    id: "user-1",

                    email: "quien-sea@example.com",

                    displayName: "Quien sea"

                })

            });

        const middleware = requireAdmin(repository);

        await expect(

            middleware(makeRequest("user-1"), {} as never, vi.fn())

        ).rejects.toBeInstanceOf(UnauthorizedError);

    });

    it("rechaza si el usuario del token ya no existe", async () => {

        process.env.ADMIN_EMAIL = "admin@example.com";

        const repository =

            makeFakeRepository({

                findById: vi.fn().mockResolvedValue(null)

            });

        const middleware = requireAdmin(repository);

        await expect(

            middleware(makeRequest("user-borrado"), {} as never, vi.fn())

        ).rejects.toBeInstanceOf(UnauthorizedError);

    });

});
