import { IGameRepository } from "../../../domain/game/repositories/IGameRepository";
import type { IFileStorage } from "../../../shared/contracts/IFileStorage";

export interface ManualFile {

    content: Buffer;

    contentType: string;

}

export class GetGameManualUseCase {

    constructor(

        private readonly repository: IGameRepository,

        private readonly storage: IFileStorage

    ) {}

    async execute(

        gameId: string,

        documentId?: string

    ): Promise<ManualFile | null> {

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

        return this.storage.download(

            document.storagePath

        );

    }

}
