import path from "node:path";

import { describe, expect, it } from "vitest";

import { FakeFileSystem } from "../fakes/fakeFileSystem";

import { GameValidator } from "../../src/domain/game/services/game-validator.service";

describe("GameValidator", () => {

    it("should validate a correct game", async () => {

        const fs = new FakeFileSystem();

        const validator =
            new GameValidator(fs);

        const gameId = "catan";

        const root =
            path.join(
                process.cwd(),
                "knowledge",
                "games",
                gameId
            );

        fs.addDirectory(root);

        fs.addDirectory(
            path.join(root, "source")
        );

        fs.addFile(

            path.join(
                root,
                "metadata.json"
            ),

            JSON.stringify({

                id: "catan",

                name: "Catan",

                language: "es",

                version: "1.0",

                minPlayers: 3,

                maxPlayers: 4,

                year: 1995

            })

        );

        fs.addFile(

            path.join(
                root,
                "source",
                "rulebook.pdf"
            )

        );

        const result =
            await validator.validate(gameId);

        expect(result.metadata.id)
            .toBe("catan");

        expect(result.metadata.name)
            .toBe("Catan");

        expect(result.paths.root)
            .toBe(root);

            expect(

    await fs.exists(
        path.join(root, "generated")
    )

).toBe(true);

expect(

    await fs.exists(
        path.join(root, "assets")
    )

).toBe(true);

    });

});