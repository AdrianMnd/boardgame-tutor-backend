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

        this.validateMetadata(

            metadata,

            gameId

        );

        await this.validateRulebook(paths);

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
        path.join(
            PATHS.GAMES,
            gameId
        );

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

    };

}

    private async ensureGameFolder(
        paths: GamePaths
    ): Promise<void> {

        if (
            !await this.fileSystem.exists(
                paths.root
            )
        ) {

            throw new ValidationError(

                `No existe la carpeta del juego:

${paths.root}`

            );

        }

    }

    private async loadMetadata(
        paths: GamePaths
    ): Promise<GameMetadata> {

        if (
            !await this.fileSystem.exists(
                paths.metadata
            )
        ) {

            throw new ValidationError(

                `No existe metadata.json:

${paths.metadata}`

            );

        }

        return this.fileSystem.readJson<GameMetadata>(
            paths.metadata
        );

    }

    private validateMetadata(

        metadata: GameMetadata,

        gameId: string

    ): void {

        if (
            metadata.id !== gameId
        ) {

            throw new ValidationError(

                `El id del metadata debe ser "${gameId}".`

            );

        }

        this.ensureNotEmpty(

            metadata.name,

            "name"

        );

        this.ensureNotEmpty(

            metadata.language,

            "language"

        );

        this.ensureNotEmpty(

            metadata.version,

            "version"

        );

    }

    private async validateRulebook(
        paths: GamePaths
    ): Promise<void> {

        await this.ensureRulebookExists(paths);

        this.ensurePdfExtension(paths);

        await this.ensureRulebookNotEmpty(paths);

    }

    private async ensureRulebookExists(
        paths: GamePaths
    ): Promise<void> {

        if (
            !await this.fileSystem.exists(
                paths.rulebook
            )
        ) {

            throw new ValidationError(

                `No existe el reglamento:

${paths.rulebook}`

            );

        }

    }

    private ensurePdfExtension(
        paths: GamePaths
    ): void {

        if (
            path.extname(
                paths.rulebook
            ).toLowerCase() !== ".pdf"
        ) {

            throw new ValidationError(

                "El reglamento debe ser un archivo PDF."

            );

        }

    }

    private async ensureRulebookNotEmpty(
        paths: GamePaths
    ): Promise<void> {

        const info =
            await this.fileSystem.stat(
                paths.rulebook
            );

        if (
            info.size === 0
        ) {

            throw new ValidationError(

                `El reglamento está vacío:

${paths.rulebook}`

            );

        }

    }

    private async ensureGeneratedFolder(
        paths: GamePaths
    ): Promise<void> {

        if (
            !await this.fileSystem.exists(
                paths.generated
            )
        ) {

            await this.fileSystem.ensureDirectory(
                paths.generated
            );

        }

    }

    private async ensureAssetsFolder(
        paths: GamePaths
    ): Promise<void> {

        if (
            !await this.fileSystem.exists(
                paths.assets
            )
        ) {

            await this.fileSystem.ensureDirectory(
                paths.assets
            );

        }

    }

    private ensureNotEmpty(

        value: string,

        field: string

    ): void {

        if (
            value.trim().length === 0
        ) {

            throw new ValidationError(

                `El campo "${field}" no puede estar vacío.`

            );

        }

    }

}