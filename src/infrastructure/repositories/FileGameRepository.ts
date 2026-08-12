import path from "node:path";

import type { IFileSystem } from "../../shared/contracts/IFileSystem";

import { IGameRepository } from "../../domain/game/repositories/IGameRepository";

import type { ValidatedGame } from "../../domain/game/types/ValidatedGame";
import type { GameMetadata } from "../../domain/game/types/GameMetadata";

export class FileGameRepository
    implements IGameRepository {

    constructor(

        private readonly fileSystem: IFileSystem

    ) {}

    async list(): Promise<ValidatedGame[]> {

        const directories =

            await this.fileSystem.listDirectories(

                path.resolve("games")

            );

        const games: ValidatedGame[] = [];

        for (const directory of directories) {

            const game =
                await this.findById(directory);

            if (game) {

                games.push(game);

            }

        }

        return games;

    }

    async findById(

    gameId: string

): Promise<ValidatedGame | null> {

    const root =
        path.resolve(
            "games",
            gameId
        );

    const metadataPath =
        path.join(
            root,
            "metadata.json"
        );

    const exists =
        await this.fileSystem.exists(
            metadataPath
        );

    if (!exists) {

        return null;

    }

    const metadata =

        await this.fileSystem.readJson<GameMetadata>(

            metadataPath

        );

    return {

        metadata,

        paths: {

            root,

            metadata: metadataPath,

            source:
                path.join(
                    root,
                    "source"
                ),

            rulebook:
                path.join(
                    root,
                    "source",
                    "rulebook.pdf"
                ),

            generated:
                path.join(
                    root,
                    "generated"
                ),

            chunks:
                path.join(
                    root,
                    "generated",
                    "chunks.json"
                ),

            knowledge:
                path.join(
                    root,
                    "generated",
                    "knowledge.json"
                ),

            assets:
                path.join(
                    root,
                    "assets"
                )

        }

    };

}

}