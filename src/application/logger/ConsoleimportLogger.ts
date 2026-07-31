import { IImportLogger } from "./IImportLogger";

export class ConsoleImportLogger
    implements IImportLogger {

    header(
        gameId: string
    ): void {

        console.log("");

        console.log(
            "────────────────────────────────────────────"
        );

        console.log(
            " BoardGame Tutor Importer"
        );

        console.log(
            "────────────────────────────────────────────"
        );

        console.log("");

        console.log(
            ` Juego: ${gameId}`
        );

        console.log("");

    }

    step(
        message: string
    ): void {

        console.log(
            `▶ ${message}`
        );

    }

    success(
        message: string
    ): void {

        console.log(
            `✔ ${message}`
        );

    }

    info(
        message: string
    ): void {

        console.log(
            `ℹ ${message}`
        );

    }

    warning(
        message: string
    ): void {

        console.log(
            `⚠ ${message}`
        );

    }

    error(
        message: string
    ): void {

        console.log(
            `✖ ${message}`
        );

    }

    footer(
        elapsedMs: number
    ): void {

        console.log("");

        console.log(
            "────────────────────────────────────────────"
        );

        console.log(
            `Importación completada en ${(elapsedMs / 1000).toFixed(2)} s`
        );

        console.log(
            "────────────────────────────────────────────"
        );

        console.log("");

    }

}