import path from "node:path";

import { IGameRepository } from "../../../domain/game/repositories/IGameRepository";

export class GetGameManualUseCase {

    constructor(
        private readonly repository: IGameRepository
    ) {}

    /**
     * Devuelve la ruta al PDF de un documento concreto. Si no
     * se especifica documentId, devuelve el documento "por
     * defecto" (documents[0] — rulebook.pdf si existe), para
     * mantener el comportamiento de siempre en juegos con un
     * único documento.
     */
    async execute(

        gameId: string,

        documentId?: string

    ): Promise<string | null> {

        const game =
            await this.repository.findById(
                gameId
            );

        if (!game || game.documents.length === 0) {

            return null;

        }

        const document =

            documentId

                ? game.documents.find(

                    candidate => candidate.id === documentId

                )

                : game.documents[0];

        if (!document) {

            return null;

        }

        return path.join(

            game.paths.source,

            document.filename

        );

    }

}
