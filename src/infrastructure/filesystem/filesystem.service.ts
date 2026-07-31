import { promises as fs } from "fs";
import path from "path";
import { IFileSystem } from "./IFileSystem";

export class FileSystemService implements IFileSystem{

    async listFiles(
        directory: string
    ): Promise<string[]> {

        const entries =
            await fs.readdir(directory);

        return entries;

    }

    async exists(filePath: string): Promise<boolean> {

        try {

            await fs.access(filePath);

            return true;

        } catch {

            return false;

        }

    }

    async ensureDirectory(directory: string): Promise<void> {

        await fs.mkdir(directory, {
            recursive: true
        });

    }

    async readText(filePath: string): Promise<string> {

        return fs.readFile(filePath, "utf-8");

    }

    async writeText(
        filePath: string,
        content: string
    ): Promise<void> {

        await fs.writeFile(
            filePath,
            content,
            "utf-8"
        );

    }

    async readJson<T>(filePath: string): Promise<T> {

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
                4
            )

        );

    }

    async listDirectories(
        directory: string
    ): Promise<string[]> {

        const entries =
            await fs.readdir(directory, {
                withFileTypes: true
            });

        return entries

            .filter(entry => entry.isDirectory())

            .map(entry => entry.name);

    }

        
}

export const fileSystem =
    new FileSystemService();