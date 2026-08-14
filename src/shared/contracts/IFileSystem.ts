import { FileInfo } from "../../types/FileInfo";
export interface IFileSystem {

    exists(path: string): Promise<boolean>;

    readText(path: string): Promise<string>;

    readBuffer(path: string): Promise<Buffer>;

    writeText(
        path: string,
        content: string
    ): Promise<void>;

    readJson<T>(path: string): Promise<T>;

    writeJson<T>(
        path: string,
        value: T
    ): Promise<void>;

    ensureDirectory(
        path: string
    ): Promise<void>;

    listDirectories(
        path: string
    ): Promise<string[]>;

    listFiles(
        path: string
    ): Promise<string[]>;

    stat(
        path: string
    ): Promise<FileInfo>;

    delete(
        path: string
    ): Promise<void>;

}