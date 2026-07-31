export interface IImportLogger {

    header(
        gameId: string
    ): void;

    step(
        message: string
    ): void;

    success(
        message: string
    ): void;

    info(
        message: string
    ): void;

    warning(
        message: string
    ): void;

    error(
        message: string
    ): void;

    footer(
        elapsedMs: number
    ): void;

}