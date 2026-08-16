import { describe, expect, it, vi } from "vitest";

import { PostgresUserRepository } from "../../src/infrastructure/repositories/PostgresUserRepository";

const fakeRow = {

    id: "user-1",

    email: "test@example.com",

    password_hash: "hash-simulado",

    display_name: "Test",

    created_at: new Date().toISOString()

};

describe("PostgresUserRepository — métodos de perfil", () => {

    it("findByIdWithPassword incluye el hash de la contraseña", async () => {

        const query = vi.fn().mockResolvedValue({ rows: [fakeRow] });

        const repository =

            new PostgresUserRepository(

                { query } as unknown as import("pg").Pool

            );

        const result = await repository.findByIdWithPassword("user-1");

        expect(result?.passwordHash).toBe("hash-simulado");
        expect(query).toHaveBeenCalledWith(

            expect.stringContaining("WHERE id = $1"),

            ["user-1"]

        );

    });

    it("findByIdWithPassword devuelve null si no existe", async () => {

        const query = vi.fn().mockResolvedValue({ rows: [] });

        const repository =

            new PostgresUserRepository(

                { query } as unknown as import("pg").Pool

            );

        const result = await repository.findByIdWithPassword("no-existe");

        expect(result).toBeNull();

    });

    it("updateDisplayName recorta espacios y actualiza el nombre correcto", async () => {

        const query = vi.fn().mockResolvedValue({

            rows: [{ ...fakeRow, display_name: "Nuevo" }]

        });

        const repository =

            new PostgresUserRepository(

                { query } as unknown as import("pg").Pool

            );

        const result = await repository.updateDisplayName("user-1", "  Nuevo  ");

        expect(result.displayName).toBe("Nuevo");
        expect(query.mock.calls[0][1]).toEqual(["Nuevo", "user-1"]);

    });

    it("updateEmail normaliza a minúsculas antes de guardar", async () => {

        const query = vi.fn().mockResolvedValue({

            rows: [{ ...fakeRow, email: "nuevo@example.com" }]

        });

        const repository =

            new PostgresUserRepository(

                { query } as unknown as import("pg").Pool

            );

        await repository.updateEmail("user-1", "  NUEVO@Example.com  ");

        expect(query.mock.calls[0][1]).toEqual(["nuevo@example.com", "user-1"]);

    });

    it("updateEmail devuelve null si el email ya lo usa otra cuenta (código 23505 de Postgres)", async () => {

        const query =

            vi.fn().mockRejectedValue({ code: "23505" });

        const repository =

            new PostgresUserRepository(

                { query } as unknown as import("pg").Pool

            );

        const result = await repository.updateEmail("user-1", "yaexiste@example.com");

        expect(result).toBeNull();

    });

    it("updateEmail propaga cualquier otro error de base de datos, sin ocultarlo como si fuera un email duplicado", async () => {

        const query =

            vi.fn().mockRejectedValue(new Error("fallo de conexión inesperado"));

        const repository =

            new PostgresUserRepository(

                { query } as unknown as import("pg").Pool

            );

        await expect(

            repository.updateEmail("user-1", "cualquiera@example.com")

        ).rejects.toThrow("fallo de conexión inesperado");

    });

    it("updatePasswordHash guarda el hash recibido tal cual, sin volver a procesarlo", async () => {

        const query = vi.fn().mockResolvedValue({ rows: [] });

        const repository =

            new PostgresUserRepository(

                { query } as unknown as import("pg").Pool

            );

        await repository.updatePasswordHash("user-1", "hash-ya-calculado");

        expect(query.mock.calls[0][1]).toEqual(["hash-ya-calculado", "user-1"]);

    });

});
