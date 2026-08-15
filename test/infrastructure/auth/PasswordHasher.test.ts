import { describe, expect, it } from "vitest";

import { PasswordHasher } from "../../../src/infrastructure/auth/PasswordHasher";

describe("PasswordHasher", () => {

    it("genera un hash distinto del texto original", async () => {

        const hasher = new PasswordHasher();

        const hash = await hasher.hash("miContraseña123");

        expect(hash).not.toBe("miContraseña123");
        expect(hash.length).toBeGreaterThan(20);

    });

    it("verifica correctamente una contraseña correcta", async () => {

        const hasher = new PasswordHasher();

        const hash = await hasher.hash("miContraseña123");

        const result = await hasher.verify("miContraseña123", hash);

        expect(result).toBe(true);

    });

    it("rechaza una contraseña incorrecta", async () => {

        const hasher = new PasswordHasher();

        const hash = await hasher.hash("miContraseña123");

        const result = await hasher.verify("otraContraseña", hash);

        expect(result).toBe(false);

    });

    it("dos hashes de la misma contraseña son distintos entre sí (sal aleatoria)", async () => {

        const hasher = new PasswordHasher();

        const hash1 = await hasher.hash("miContraseña123");
        const hash2 = await hasher.hash("miContraseña123");

        expect(hash1).not.toBe(hash2);

        expect(await hasher.verify("miContraseña123", hash1)).toBe(true);
        expect(await hasher.verify("miContraseña123", hash2)).toBe(true);

    });

});
