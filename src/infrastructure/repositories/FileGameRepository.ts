import path from "node:path";

import type { IFileSystem } from "../../shared/contracts/IFileSystem";

import { IGameRepository } from "../../domain/game/repositories/IGameRepository";

import type { ValidatedGame } from "../../domain/game/types/ValidatedGame";
import type { GameMetadata } from "../../domain/game/types/GameMetadata";

import { SourceDocumentDiscovery } from "../../domain/game/services/SourceDocumentDiscovery";

export class FileGameRepository
    implements IGameRepository {

    private readonly documentDiscovery: SourceDocumentDiscovery;

    constructor(

        private readonly fileSystem: IFileSystem

    ) {

        this.documentDiscovery =

            new SourceDocumentDiscovery(

                fileSystem

            );

    }

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

        const sourceDir =

            path.join(

                root,

                "source"

            );

        const documents =

            await this.documentDiscovery.discover(

                sourceDir

            );

        return {

            metadata,

            documents,

            paths: {

                root,

                metadata: metadataPath,

                source: sourceDir,

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
