import path from "node:path";

import type { IFileSystem } from "../../../shared/contracts/IFileSystem";

import type { DocumentDescriptor } from "../types/DocumentDescriptor";

/**
 * Detecta automáticamente todos los PDF dentro de la carpeta
 * source/ de un juego. Sustituye a tener que declarar cada
 * documento a mano en metadata.json — pensado para juegos con
 * decenas de documentos (reglamento, FAQ, packs de facciones...)
 * donde eso sería inviable.
 *
 * rulebook.pdf, si existe, siempre queda primero en la lista —
 * es el documento "por defecto" que se abre cuando no se pide
 * ninguno en concreto, manteniendo el comportamiento de los
 * juegos que solo tienen un documento.
 */
export class SourceDocumentDiscovery {

    constructor(

        private readonly fileSystem: IFileSystem

    ) {}

    async discover(

        sourceDir: string

    ): Promise<DocumentDescriptor[]> {

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

    ): DocumentDescriptor {

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

            .replace(/[\u0300-\u036f]/g, "") // quita acentos

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

                    // Palabras que ya estaban en mayúsculas en
                    // el nombre de archivo (siglas tipo FAQ,
                    // PDF...) se respetan tal cual; el resto se
                    // capitaliza normal.
                    word === word.toUpperCase() && /[A-Z]/.test(word)

                        ? word

                        : word.charAt(0).toUpperCase() +

                          word.slice(1).toLowerCase()

            )

            .join(" ");

    }

}
