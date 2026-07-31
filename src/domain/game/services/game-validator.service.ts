import path from "path";

import { PATHS } from "../../../config/paths";

import type { IFileSystem } from "../../../shared/contracts/IFileSystem";

import type { GameMetadata } from "../types/GameMetadata";
import type { GamePaths } from "../types/GamePaths";
import type { ValidatedGame } from "../types/ValidatedGame";

import { ValidationError } from "../../errors/ValidationError";

export class GameValidator {

    constructor(
        private readonly fileSystem: IFileSystem
    ) {}

    async validate(
        gameId: string
    ): Promise<ValidatedGame> {

        const paths =
            this.buildPaths(gameId);

        await this.ensureGameFolder(paths);

        const metadata =
            await this.loadMetadata(paths);

        await this.ensureRulebook(paths);

        await this.ensureGeneratedFolder(paths);

        await this.ensureAssetsFolder(paths);

        return {

            metadata,

            paths

        };

    }

    private buildPaths(
        gameId: string
    ): GamePaths {

        const root =
            path.join(PATHS.GAMES, gameId);

        return {

            root,

            metadata:
                path.join(
                    root,
                    "metadata.json"
                ),

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

            assets:
                path.join(
                    root,
                    "assets"
                )

        };

    }

    private async ensureGameFolder(
        paths: GamePaths
    ): Promise<void> {

        const exists =
            await this.fileSystem.exists(
                paths.root
            );

        if (!exists) {

            throw new ValidationError(

                `No existe la carpeta del juego:

${paths.root}`

            );

        }

    }

    private async loadMetadata(
        paths: GamePaths
    ): Promise<GameMetadata> {

        const exists =
            await this.fileSystem.exists(
                paths.metadata
            );

        if (!exists) {

            throw new ValidationError(

                `No existe el archivo metadata.json:

${paths.metadata}`

            );

        }

        return this.fileSystem.readJson<GameMetadata>(
            paths.metadata
        );

    }

    private async ensureRulebook(
        paths: GamePaths
    ): Promise<void> {

        const exists =
            await this.fileSystem.exists(
                paths.rulebook
            );

        if (!exists) {

            throw new ValidationError(

                `No existe el reglamento:

${paths.rulebook}`

            );

        }

    }

    private async ensureGeneratedFolder(
        paths: GamePaths
    ): Promise<void> {

        const exists =
            await this.fileSystem.exists(
                paths.generated
            );

        if (!exists) {

            await this.fileSystem.ensureDirectory(
                paths.generated
            );

        }

    }

    private async ensureAssetsFolder(
        paths: GamePaths
    ): Promise<void> {

        const exists =
            await this.fileSystem.exists(
                paths.assets
            );

        if (!exists) {

            await this.fileSystem.ensureDirectory(
                paths.assets
            );

        }

    }

}