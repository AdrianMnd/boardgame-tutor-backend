import { describe, expect, it, vi } from "vitest";

import { requireAuth, AuthenticatedRequest } from "../../../src/presentation/api/middleware/requireAuth";
import { JwtService } from "../../../src/infrastructure/auth/JwtService";
import { UnauthorizedError } from "../../../src/presentation/api/errors/UnauthorizedError";

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

    } as unknown as AuthenticatedRequest;

}

describe("requireAuth", () => {

    it("deja pasar una petición con un token válido, y añade userId a la petición", () => {

        const jwtService = new JwtService(configuration);

        const token = jwtService.sign({ userId: "user-123" });

        const middleware = requireAuth(jwtService);

        const request = makeRequest(`Bearer ${token}`);

        const next = vi.fn();

        middleware(request, {} as never, next);

        expect(next).toHaveBeenCalledOnce();
        expect(request.userId).toBe("user-123");

    });

    it("rechaza una petición sin cabecera Authorization", () => {

        const jwtService = new JwtService(configuration);

        const middleware = requireAuth(jwtService);

        const request = makeRequest(undefined);

        const next = vi.fn();

        expect(

            () => middleware(request, {} as never, next)

        ).toThrow(UnauthorizedError);

        expect(next).not.toHaveBeenCalled();

    });

    it("rechaza una cabecera Authorization que no empieza por \"Bearer \"", () => {

        const jwtService = new JwtService(configuration);

        const middleware = requireAuth(jwtService);

        const request = makeRequest("Basic algo-que-no-es-un-bearer-token");

        expect(

            () => middleware(request, {} as never, vi.fn())

        ).toThrow(UnauthorizedError);

    });

    it("rechaza un token inválido o manipulado", () => {

        const jwtService = new JwtService(configuration);

        const middleware = requireAuth(jwtService);

        const request = makeRequest("Bearer token-invalido-manipulado");

        expect(

            () => middleware(request, {} as never, vi.fn())

        ).toThrow(UnauthorizedError);

    });

    it("rechaza un token firmado con un secreto distinto (no podría venir de este servidor)", () => {

        const jwtService = new JwtService(configuration);

        const otroServicio =

            new JwtService({

                ...configuration,

                jwtSecret: "un-secreto-totalmente-distinto-de-32-car"

            });

        const tokenFalso = otroServicio.sign({ userId: "user-123" });

        const middleware = requireAuth(jwtService);

        const request = makeRequest(`Bearer ${tokenFalso}`);

        expect(

            () => middleware(request, {} as never, vi.fn())

        ).toThrow(UnauthorizedError);

    });

});
