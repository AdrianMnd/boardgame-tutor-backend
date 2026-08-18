import { describe, expect, it, vi } from "vitest";

vi.mock("@aws-sdk/s3-request-presigner", () => ({

    getSignedUrl: vi.fn().mockResolvedValue("https://ejemplo.com/firmado?X-Amz-Signature=abc")

}));

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { B2FileStorage } from "../../src/infrastructure/storage/B2FileStorage";

const fakeConfiguration = {

    endpoint: "https://s3.ejemplo.com",

    bucket: "mi-cubo",

    accessKeyId: "clave",

    secretAccessKey: "secreto",

    forcePathStyle: true as const

};

describe("B2FileStorage — getSignedDownloadUrl", () => {

    it("devuelve el enlace firmado que genera el SDK de AWS", async () => {

        const storage = new B2FileStorage(fakeConfiguration);

        const url =
            await storage.getSignedDownloadUrl("pending-requests/abc/reglamento.pdf", 3600);

        expect(url).toBe("https://ejemplo.com/firmado?X-Amz-Signature=abc");

    });

    it("pasa el tiempo de expiración solicitado a la librería de firmado", async () => {

        const storage = new B2FileStorage(fakeConfiguration);

        await storage.getSignedDownloadUrl("archivo.pdf", 604800);

        const call = vi.mocked(getSignedUrl).mock.calls.at(-1);

        expect(call?.[2]).toEqual({ expiresIn: 604800 });

    });

});
