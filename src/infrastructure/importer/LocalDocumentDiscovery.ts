import path from "node:path";

import type { IFileSystem } from "../../shared/contracts/IFileSystem";

import type { LocalDocumentFile } from "../../domain/game/types/LocalDocumentFile";

export class LocalDocumentDiscovery {

    constructor(

        private readonly fileSystem: IFileSystem

    ) {}

    async discover(

        sourceDir: string

    ): Promise<LocalDocumentFile[]> {

        const exists =

            await this.fileSystem.exists(

                sourceDir

            );

        if (!exists) {

            return [];

        }

        const files =

            await this.fileSystem.listFiles(

                sourceDir

            );

        const descriptors =

            files

                .filter(

                    filename =>

                        filename.toLowerCase().endsWith(".pdf")

                )

                .map(

                    filename =>

                        this.toDescriptor(filename)

                );

        return descriptors.sort(

            (a, b) => {

                if (a.id === "rulebook") {

                    return -1;

                }

                if (b.id === "rulebook") {

                    return 1;

                }

                return a.name.localeCompare(b.name, "es");

            }

        );

    }

    private toDescriptor(

        filename: string

    ): LocalDocumentFile {

        const withoutExtension =

            path.basename(

                filename,

                path.extname(filename)

            );

        return {

            id: this.slugify(withoutExtension),

            filename,

            name: this.prettify(withoutExtension)

        };

    }

    private slugify(

        text: string

    ): string {

        return text

            .normalize("NFD")

            .replace(/[\u0300-\u036f]/g, "")

            .toLowerCase()

            .replace(/[^a-z0-9]+/g, "-")

            .replace(/^-+|-+$/g, "");

    }

    private prettify(

        text: string

    ): string {

        return text

            .replace(/[_-]+/g, " ")

            .trim()

            .split(" ")

            .map(

                word =>

                    word === word.toUpperCase() && /[A-Z]/.test(word)

                        ? word

                        : word.charAt(0).toUpperCase() +

                          word.slice(1).toLowerCase()

            )

            .join(" ");

    }

}
