import type { IFileSystem } from "../../src/shared/contracts/IFileSystem";

export class FakeFileSystem implements IFileSystem {

    private readonly files =
        new Map<string, string>();

    private readonly directories =
        new Set<string>();


    async exists(
        path: string
    ): Promise<boolean> {

        return (
            this.files.has(path)
            || this.directories.has(path)
        );

    }


    async readText(
        path: string
    ): Promise<string> {

        const content =
            this.files.get(path);

        if (content === undefined) {

            throw new Error(
                `Archivo no encontrado: ${path}`
            );

        }

        return content;

    }


    async writeText(
        path: string,
        content: string
    ): Promise<void> {

        this.files.set(
            path,
            content
        );

    }


    async readJson<T>(
        path: string
    ): Promise<T> {

        const text =
            await this.readText(path);

        return JSON.parse(text) as T;

    }


    async writeJson<T>(
        path: string,
        value: T
    ): Promise<void> {

        await this.writeText(
            path,
            JSON.stringify(
                value,
                null,
                2
            )
        );

    }


    async ensureDirectory(
        path: string
    ): Promise<void> {

        this.directories.add(path);

    }


    async listDirectories(
        path: string
    ): Promise<string[]> {

        const prefix =
            path.endsWith("/")
                ? path
                : `${path}/`;

        return [...this.directories]

            .filter(directory =>
                directory.startsWith(prefix)
            )

            .map(directory =>
                directory.substring(prefix.length)
            )

            .filter(directory =>
                !directory.includes("/")
            );

    }


    async listFiles(
        path: string
    ): Promise<string[]> {

        const prefix =
            path.endsWith("/")
                ? path
                : `${path}/`;

        return [...this.files.keys()]

            .filter(file =>
                file.startsWith(prefix)
            )

            .map(file =>
                file.substring(prefix.length)
            )

            .filter(file =>
                !file.includes("/"));

    }


    addDirectory(
        path: string
    ): void {

        this.directories.add(path);

    }


    addFile(
        path: string,
        content = ""
    ): void {

        this.files.set(
            path,
            content
        );

    }

}