import { describe, expect, it, vi } from "vitest";

import { RegisterUserUseCase } from "../../src/application/use-cases/register-user/register-user.use-case";
import { PasswordHasher } from "../../src/infrastructure/auth/PasswordHasher";
import { JwtService } from "../../src/infrastructure/auth/JwtService";

import { ConflictError } from "../../src/presentation/api/errors/ConflictError";
import { BadRequestError } from "../../src/presentation/api/errors/BadRequestError";

import type { IUserRepository } from "../../src/domain/user/repositories/IUserRepository";

const authConfiguration = {

    jwtSecret: "0123456789abcdef0123456789abcdef",

    tokenExpiresIn: "30d"

};

function makeFakeRepository(

    overrides: Partial<IUserRepository> = {}

): IUserRepository {

    return {

        findByEmailWithPassword: vi.fn().mockResolvedValue(null),

        findById: vi.fn().mockResolvedValue(null),

        create: vi.fn().mockResolvedValue({

            id: "user-1",

            email: "test@example.com",

            displayName: "Test",

            createdAt: new Date().toISOString()

        }),

        ...overrides

    };

}

describe("RegisterUserUseCase", () => {

    it("registra un usuario nuevo y devuelve un token", async () => {

        const repository = makeFakeRepository();

        const useCase =

            new RegisterUserUseCase(

                repository,

                new PasswordHasher(),

                new JwtService(authConfiguration)

            );

        const result =

            await useCase.execute(

                "test@example.com",

                "contraseñaSegura123",

                "Test"

            );

        expect(result.user.email).toBe("test@example.com");
        expect(result.token).toBeTruthy();
        expect(typeof result.token).toBe("string");

    });

    it("nunca guarda la contraseña en texto plano — el repositorio recibe un hash, no la original", async () => {

        const create = vi.fn().mockResolvedValue({

            id: "user-1",

            email: "test@example.com",

            displayName: "Test",

            createdAt: new Date().toISOString()

        });

        const repository = makeFakeRepository({ create });

        const useCase =

            new RegisterUserUseCase(

                repository,

                new PasswordHasher(),

                new JwtService(authConfiguration)

            );

        await useCase.execute(

            "test@example.com",

            "contraseñaSegura123",

            "Test"

        );

        const [, passwordHashRecibido] = create.mock.calls[0];

        expect(passwordHashRecibido).not.toBe("contraseñaSegura123");
        expect(passwordHashRecibido).toMatch(/^\$2b\$/);

    });

    it("rechaza un email con formato inválido", async () => {

        const useCase =

            new RegisterUserUseCase(

                makeFakeRepository(),

                new PasswordHasher(),

                new JwtService(authConfiguration)

            );

        await expect(

            useCase.execute("no-es-un-email", "contraseñaSegura123", "Test")

        ).rejects.toBeInstanceOf(BadRequestError);

    });

    it("rechaza una contraseña demasiado corta", async () => {

        const useCase =

            new RegisterUserUseCase(

                makeFakeRepository(),

                new PasswordHasher(),

                new JwtService(authConfiguration)

            );

        await expect(

            useCase.execute("test@example.com", "corta", "Test")

        ).rejects.toBeInstanceOf(BadRequestError);

    });

    it("rechaza un nombre vacío", async () => {

        const useCase =

            new RegisterUserUseCase(

                makeFakeRepository(),

                new PasswordHasher(),

                new JwtService(authConfiguration)

            );

        await expect(

            useCase.execute("test@example.com", "contraseñaSegura123", "   ")

        ).rejects.toBeInstanceOf(BadRequestError);

    });

    it("lanza ConflictError si el email ya existe (el repositorio devuelve null)", async () => {

        const repository =

            makeFakeRepository({

                create: vi.fn().mockResolvedValue(null)

            });

        const useCase =

            new RegisterUserUseCase(

                repository,

                new PasswordHasher(),

                new JwtService(authConfiguration)

            );

        await expect(

            useCase.execute("ya-existe@example.com", "contraseñaSegura123", "Test")

        ).rejects.toBeInstanceOf(ConflictError);

    });

});
