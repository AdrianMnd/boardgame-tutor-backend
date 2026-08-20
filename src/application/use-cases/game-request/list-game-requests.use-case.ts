import type { IGameRequestRepository } from "../../../domain/gameRequest/IGameRequestRepository";
import type { IFileStorage } from "../../../shared/contracts/IFileStorage";

// Los enlaces firmados anteriores (los que se mandaron por
// correo en su momento) caducan a los 7 días — este caso de uso
// regenera enlaces frescos cada vez que se lista, a partir de
// las rutas guardadas en pdf_keys, así el panel nunca muestra un
// enlace caducado, sin importar cuánto tiempo lleve pendiente la
// solicitud.
const SIGNED_URL_EXPIRES_SECONDS = 60 * 60 * 24 * 7;

export interface GameRequestListItem {

    id: string;

    requesterName: string;

    requesterEmail: string;

    gameName: string;

    bggUrl?: string;

    pdfLinks: string[];

    reviewed: boolean;

    createdAt: string;

}

export class ListGameRequestsUseCase {

    constructor(

        private readonly repository: IGameRequestRepository,

        private readonly storage: IFileStorage

    ) {}

    async execute(): Promise<GameRequestListItem[]> {

        const records =
            await this.repository.list();

        return Promise.all(

            records.map(async record => ({

                id: record.id,

                requesterName: record.requesterName,

                requesterEmail: record.requesterEmail,

                gameName: record.gameName,

                bggUrl: record.bggUrl,

                reviewed: record.reviewed,

                createdAt: record.createdAt,

                pdfLinks:

                    await Promise.all(

                        record.pdfKeys.map(key =>

                            this.storage.getSignedDownloadUrl(

                                key,

                                SIGNED_URL_EXPIRES_SECONDS

                            )

                        )

                    )

            }))

        );

    }

}
