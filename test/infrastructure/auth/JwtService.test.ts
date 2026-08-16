import { describe, expect, it } from "vitest";

import { JwtService, InvalidTokenError } from "../../../src/infrastructure/auth/JwtService";

const configuration = {

    jwtSecret: "0123456789abcdef0123456789abcdef",

    tokenExpiresIn: "30d"

};

describe("JwtService", () => {

    it("genera un token que se puede verificar de vuelta, con el mismo userId", () => {

        const service = new JwtService(configuration);

        const token = service.sign({ userId: "user-123" });

        const payload = service.verify(token);

        expect(payload.userId).toBe("user-123");

    });

    it("rechaza un token firmado con un secreto distinto", () => {

        const service = new JwtService(configuration);

        const otroServicio =

            new JwtService({

                ...configuration,

                jwtSecret: "otro-secreto-completamente-distinto-de-32"

            });

        const token = otroServicio.sign({ userId: "user-123" });

        expect(

            () => service.verify(token)

        ).toThrow(InvalidTokenError);

    });

    it("rechaza un token manipulado (texto cualquiera)", () => {

        const service = new JwtService(configuration);

        expect(

            () => service.verify("esto-no-es-un-token-valido")

        ).toThrow(InvalidTokenError);

    });

    it("rechaza un token ya caducado", () => {

        const service =

            new JwtService({

                ...configuration,

                tokenExpiresIn: "-1s"

            });

        const token = service.sign({ userId: "user-123" });

        expect(

            () => service.verify(token)

        ).toThrow(InvalidTokenError);

    });

});
