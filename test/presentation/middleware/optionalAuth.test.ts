import { describe, expect, it, vi } from "vitest";

import { optionalAuth } from "../../../src/presentation/api/middleware/optionalAuth";
import { JwtService } from "../../../src/infrastructure/auth/JwtService";

import type { AuthenticatedRequest } from "../../../src/presentation/api/middleware/requireAuth";

const configuration = {

    jwtSecret: "0123456789abcdef0123456789abcdef",

    tokenExpiresIn: "30d"

};

function makeRequest(

    authorizationHeader?: string

) {

    return {

        headers: {

            authorization: authorizationHeader

        }

    } as unknown as Partial<AuthenticatedRequest>;

}

describe("optionalAuth", () => {

    it("con un token válido, añade userId a la petición y deja pasar", () => {

        const jwtService = new JwtService(configuration);

        const token = jwtService.sign({ userId: "user-123" });

        const middleware = optionalAuth(jwtService);

        const request = makeRequest(`Bearer ${token}`);

        const next = vi.fn();

        middleware(request as never, {} as never, next);

        expect(next).toHaveBeenCalledOnce();
        expect(request.userId).toBe("user-123");

    });

    it("sin ninguna cabecera, deja pasar sin userId (invitado) — nunca lanza", () => {

        const jwtService = new JwtService(configuration);

        const middleware = optionalAuth(jwtService);

        const request = makeRequest(undefined);

        const next = vi.fn();

        expect(

            () => middleware(request as never, {} as never, next)

        ).not.toThrow();

        expect(next).toHaveBeenCalledOnce();
        expect(request.userId).toBeUndefined();

    });

    it("con un token inválido o manipulado, deja pasar igualmente sin userId — nunca lanza", () => {

        const jwtService = new JwtService(configuration);

        const middleware = optionalAuth(jwtService);

        const request = makeRequest("Bearer token-invalido-manipulado");

        const next = vi.fn();

        expect(

            () => middleware(request as never, {} as never, next)

        ).not.toThrow();

        expect(next).toHaveBeenCalledOnce();
        expect(request.userId).toBeUndefined();

    });

});
