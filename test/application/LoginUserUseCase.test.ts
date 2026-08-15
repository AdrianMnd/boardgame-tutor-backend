import { describe, expect, it, vi } from "vitest";

import { LoginUserUseCase } from "../../src/application/use-cases/login-user/login-user.use-case";
import { PasswordHasher } from "../../src/infrastructure/auth/PasswordHasher";
import { JwtService } from "../../src/infrastructure/auth/JwtService";

import { UnauthorizedError } from "../../src/presentation/api/errors/UnauthorizedError";

import type { IUserRepository } from "../../src/domain/user/repositories/IUserRepository";

const authConfiguration = {

    jwtSecret: "0123456789abcdef0123456789abcdef",

    tokenExpiresIn: "30d"

};

describe("LoginUserUseCase", () => {

    it("inicia sesión con credenciales correctas y devuelve un token", async () => {

        const hasher = new PasswordHasher();

        const hash = await hasher.hash("contraseñaSegura123");

        const repository: IUserRepository = {

            findByEmailWithPassword: vi.fn().mockResolvedValue({

                id: "user-1",

                email: "test@example.com",

                displayName: "Test",

                createdAt: new Date().toISOString(),

                passwordHash: hash

            }),

            findById: vi.fn(),

            create: vi.fn()

        };

        const useCase =

            new LoginUserUseCase(

                repository,

                hasher,

                new JwtService(authConfiguration)

            );

        const result =

            await useCase.execute(

                "test@example.com",

                "contraseñaSegura123"

            );

        expect(result.user.email).toBe("test@example.com");
        expect(result.token).toBeTruthy();

        expect(

            (result.user as unknown as { passwordHash?: string }).passwordHash

        ).toBeUndefined();

    });

    it("rechaza una contraseña incorrecta con el mismo error que un email inexistente", async () => {

        const hasher = new PasswordHasher();

        const hash = await hasher.hash("contraseñaCorrecta");

        const repository: IUserRepository = {

            findByEmailWithPassword: vi.fn().mockResolvedValue({

                id: "user-1",

                email: "test@example.com",

                displayName: "Test",

                createdAt: new Date().toISOString(),

                passwordHash: hash

            }),

            findById: vi.fn(),

            create: vi.fn()

        };

        const useCase =

            new LoginUserUseCase(

                repository,

                hasher,

                new JwtService(authConfiguration)

            );

        await expect(

            useCase.execute("test@example.com", "contraseñaIncorrecta")

        ).rejects.toThrow("Email o contraseña incorrectos.");

    });

    it("rechaza un email que no existe con el MISMO mensaje que una contraseña incorrecta", async () => {

        const repository: IUserRepository = {

            findByEmailWithPassword: vi.fn().mockResolvedValue(null),

            findById: vi.fn(),

            create: vi.fn()

        };

        const useCase =

            new LoginUserUseCase(

                repository,

                new PasswordHasher(),

                new JwtService(authConfiguration)

            );

        await expect(

            useCase.execute("no-existe@example.com", "cualquier-cosa")

        ).rejects.toThrow("Email o contraseña incorrectos.");

        await expect(

            useCase.execute("no-existe@example.com", "cualquier-cosa")

        ).rejects.toBeInstanceOf(UnauthorizedError);

    });

    it("tarda un tiempo similar tanto si el email existe (contraseña mal) como si no existe — protección contra ataques de temporización", async () => {

        const hasher = new PasswordHasher();

        const hash = await hasher.hash("contraseñaCorrecta");

        const repositoryConEmail: IUserRepository = {

            findByEmailWithPassword: vi.fn().mockResolvedValue({

                id: "user-1",

                email: "existe@example.com",

                displayName: "Test",

                createdAt: new Date().toISOString(),

                passwordHash: hash

            }),

            findById: vi.fn(),

            create: vi.fn()

        };

        const repositorySinEmail: IUserRepository = {

            findByEmailWithPassword: vi.fn().mockResolvedValue(null),

            findById: vi.fn(),

            create: vi.fn()

        };

        const useCaseConEmail =

            new LoginUserUseCase(

                repositoryConEmail,

                hasher,

                new JwtService(authConfiguration)

            );

        const useCaseSinEmail =

            new LoginUserUseCase(

                repositorySinEmail,

                hasher,

                new JwtService(authConfiguration)

            );

        const medir = async (

            useCase: LoginUserUseCase,

            email: string

        ): Promise<number> => {

            const start = performance.now();

            await useCase.execute(email, "contraseñaIncorrecta").catch(() => {});

            return performance.now() - start;

        };

        const tiemposConEmail: number[] = [];
        const tiemposSinEmail: number[] = [];

        for (let i = 0; i < 5; i++) {

            tiemposConEmail.push(await medir(useCaseConEmail, "existe@example.com"));
            tiemposSinEmail.push(await medir(useCaseSinEmail, "no-existe@example.com"));

        }

        const promedio = (valores: number[]) =>
            valores.reduce((a, b) => a + b, 0) / valores.length;

        const promedioConEmail = promedio(tiemposConEmail);
        const promedioSinEmail = promedio(tiemposSinEmail);

        expect(promedioSinEmail).toBeGreaterThan(1);

        const ratio =

            Math.max(promedioConEmail, promedioSinEmail) /

            Math.min(promedioConEmail, promedioSinEmail);

        expect(ratio).toBeLessThan(3);

    });

});
