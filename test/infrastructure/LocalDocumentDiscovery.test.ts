import { describe, expect, it } from "vitest";

import { LocalDocumentDiscovery } from "../../src/infrastructure/importer/LocalDocumentDiscovery";

import type { IFileSystem } from "../../src/shared/contracts/IFileSystem";

function makeFakeFileSystem(

    files: string[]

): IFileSystem {

    return {

        exists: async () => true,

        listFiles: async () => files,

        readText: async () => "",

        readBuffer: async () => Buffer.from(""),

        writeText: async () => {},

        readJson: async () => ({}) as never,

        writeJson: async () => {},

        ensureDirectory: async () => {},

        listDirectories: async () => [],

        stat: async () => ({}) as never,

        delete: async () => {}

    };

}

describe("LocalDocumentDiscovery", () => {

    it("detecta un único rulebook.pdf (caso habitual)", async () => {

        const discovery =

            new LocalDocumentDiscovery(

                makeFakeFileSystem(["rulebook.pdf"])

            );

        const documents =
            await discovery.discover("/games/catan/source");

        expect(documents).toHaveLength(1);
        expect(documents[0]).toEqual({

            id: "rulebook",

            filename: "rulebook.pdf",

            name: "Rulebook"

        });

    });

    it("ignora archivos que no son PDF", async () => {

        const discovery =

            new LocalDocumentDiscovery(

                makeFakeFileSystem([

                    "rulebook.pdf",

                    "notas.txt",

                    ".DS_Store"

                ])

            );

        const documents =
            await discovery.discover("/games/catan/source");

        expect(documents).toHaveLength(1);
        expect(documents[0].filename).toBe("rulebook.pdf");

    });

    it("rulebook.pdf siempre queda primero, sea cual sea el orden de archivos", async () => {

        const discovery =

            new LocalDocumentDiscovery(

                makeFakeFileSystem([

                    "zzz-ultimo.pdf",

                    "aaa-primero.pdf",

                    "rulebook.pdf"

                ])

            );

        const documents =
            await discovery.discover("/games/arkhamlcg/source");

        expect(documents[0].id).toBe("rulebook");

    });

    it("sin rulebook.pdf, ordena el resto alfabéticamente por nombre", async () => {

        const discovery =

            new LocalDocumentDiscovery(

                makeFakeFileSystem([

                    "zeta-pack.pdf",

                    "alpha-pack.pdf"

                ])

            );

        const documents =
            await discovery.discover("/games/40k/source");

        expect(documents.map(d => d.id)).toEqual([

            "alpha-pack",

            "zeta-pack"

        ]);

    });

    it("genera nombres legibles a partir de guiones y guiones bajos", async () => {

        const discovery =

            new LocalDocumentDiscovery(

                makeFakeFileSystem(["reference-guide.pdf"])

            );

        const documents =
            await discovery.discover("/games/arkhamlcg/source");

        expect(documents[0]).toEqual({

            id: "reference-guide",

            filename: "reference-guide.pdf",

            name: "Reference Guide"

        });

    });

    it("respeta las siglas en mayúsculas (FAQ) sin romper el resto del nombre", async () => {

        const discovery =

            new LocalDocumentDiscovery(

                makeFakeFileSystem(["FAQ_Enero_2026.pdf"])

            );

        const documents =
            await discovery.discover("/games/40k/source");

        expect(documents[0].name).toBe("FAQ Enero 2026");

    });

    it("quita los acentos al generar el identificador, pero no del nombre visible", async () => {

        const discovery =

            new LocalDocumentDiscovery(

                makeFakeFileSystem(["Reglamento Básico.pdf"])

            );

        const documents =
            await discovery.discover("/games/catan/source");

        expect(documents[0].id).toBe("reglamento-basico");
        expect(documents[0].name).toBe("Reglamento Básico");

    });

    it("devuelve una lista vacía si la carpeta source/ no existe", async () => {

        const fileSystem = makeFakeFileSystem([]);

        fileSystem.exists = async () => false;

        const discovery =

            new LocalDocumentDiscovery(fileSystem);

        const documents =
            await discovery.discover("/games/inexistente/source");

        expect(documents).toEqual([]);

    });

    it("simula el caso real de Warhammer 40k: muchos documentos, rulebook primero", async () => {

        const files =

            Array.from({ length: 33 }, (_, i) => `faction-pack-${i}.pdf`)

                .concat(["rulebook.pdf"]);

        const discovery =

            new LocalDocumentDiscovery(

                makeFakeFileSystem(files)

            );

        const documents =
            await discovery.discover("/games/40k/source");

        expect(documents).toHaveLength(34);
        expect(documents[0].id).toBe("rulebook");

        const ids = documents.map(d => d.id);
        expect(new Set(ids).size).toBe(ids.length);

    });

});
