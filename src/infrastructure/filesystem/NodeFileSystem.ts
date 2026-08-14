import fs, { stat } from "node:fs/promises";
import path from "node:path";

import type { IFileSystem } from "../../shared/contracts/IFileSystem";
import { FileInfo } from "../../types/FileInfo";

export class NodeFileSystem
    implements IFileSystem {

    async exists(
        filePath: string
    ): Promise<boolean> {

        try {

            await fs.access(filePath);

            return true;

        } catch {

            return false;

        }

    }

    async stat(
        path: string
    ): Promise<FileInfo> {

        const info =
            await stat(path);

        return {

            size: info.size

        };

    }

    async readText(
        filePath: string
    ): Promise<string> {

        return fs.readFile(

            filePath,

            "utf8"

        );

    }

    async readBuffer(
        filePath: string
    ): Promise<Buffer> {

        return fs.readFile(

            filePath

        );

    }

    async writeText(

        filePath: string,

        content: string

    ): Promise<void> {

        await fs.mkdir(

            path.dirname(filePath),

            {
                recursive: true
            }

        );

        await fs.writeFile(

            filePath,

            content,

            "utf8"

        );

    }

    async readJson<T>(
        filePath: string
    ): Promise<T> {

        const content =
            await this.readText(filePath);

        return JSON.parse(content) as T;

    }

    async writeJson<T>(

        filePath: string,

        value: T

    ): Promise<void> {

        await this.writeText(

            filePath,

            JSON.stringify(

                value,

                null,

                2

            )

        );

    }

    async ensureDirectory(
        directory: string
    ): Promise<void> {

        await fs.mkdir(

            directory,

            {
                recursive: true
            }

        );

    }

    async listDirectories(
        directory: string
    ): Promise<string[]> {

        const entries =
            await fs.readdir(

                directory,

                {
                    withFileTypes: true
                }

            );

        return entries

            .filter(entry =>
                entry.isDirectory()
            )

            .map(entry =>
                entry.name
            );

    }

    async listFiles(
        directory: string
    ): Promise<string[]> {

        const entries =
            await fs.readdir(

                directory,

                {
                    withFileTypes: true
                }

            );

        return entries

            .filter(entry =>
                entry.isFile()
            )

            .map(entry =>
                entry.name
            );

    }

        async delete(
            filePath: string
        ): Promise<void> {

            await fs.rm(

                filePath,

                {
                    recursive: true,
                    force: true
                }

            );

        }

}