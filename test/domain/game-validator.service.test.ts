import { describe, expect, it } from "vitest";

import { GameValidator } from "../../src/domain/game/services/game-validator.service";

import type { IGameRepository } from "../../src/domain/game/repositories/IGameRepository";
import type { ValidatedGame } from "../../src/domain/game/types/ValidatedGame";

function makeFakeGame(id: string): ValidatedGame {

    return {

        metadata: {

            id,

            name: "Catan",

            language: "es",

            version: "1.0",

            minPlayers: 3,

            maxPlayers: 4,

            year: 1995

        },

        paths: {

            root: `/games/${id}`,

            metadata: `/games/${id}/metadata.json`,

            source: `/games/${id}/source`,

            rulebook: `/games/${id}/source/rulebook.pdf`,

            generated: `/games/${id}/generated`,

            chunks: `/games/${id}/generated/chunks.json`,

            knowledge: `/games/${id}/generated/knowledge.json`,

            assets: `/games/${id}/assets`

        }

    };

}

class FakeGameRepository
    implements IGameRepository {

    constructor(

        private readonly games: Map<string, ValidatedGame>

    ) {}

    async list(): Promise<ValidatedGame[]> {

        return [...this.games.values()];

    }

    async findById(

        gameId: string

    ): Promise<ValidatedGame | null> {

        return this.games.get(gameId) ?? null;

    }

}

describe("GameValidator", () => {

    it("should return the game when it exists in the repository", async () => {

        const game = makeFakeGame("catan");

        const repository =

            new FakeGameRepository(

                new Map([["catan", game]])

            );

        const validator =
            new GameValidator(repository);

        const result =
            await validator.validate("catan");

        expect(result.metadata.id).toBe("catan");
        expect(result.metadata.name).toBe("Catan");
        expect(result.paths.root).toBe("/games/catan");

    });

    it("should throw a clear error when the game does not exist", async () => {

        const repository =

            new FakeGameRepository(

                new Map()

            );

        const validator =
            new GameValidator(repository);

        await expect(

            validator.validate("juego-inexistente")

        ).rejects.toThrow(

            'El juego "juego-inexistente" no existe.'

        );

    });

});
