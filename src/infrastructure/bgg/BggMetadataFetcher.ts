import { parseBggThingXml } from "./BggParser";

import type { BggGameData } from "./BggParser";

const BGG_API_URL = "https://boardgamegeek.com/xmlapi2/thing";

/**
 * Única pieza de esta integración que toca la red de verdad —
 * separada de BggParser.ts (lógica pura, testeable sin red) a
 * propósito. No se ha podido probar contra la API real de BGG
 * durante el desarrollo (entorno sin acceso a
 * boardgamegeek.com) — el formato del XML se basa en la
 * documentación pública de /xmlapi2/thing, pero conviene
 * probarlo contra un id real antes de confiar en él del todo.
 */
export async function fetchBggMetadata(

    bggId: string

): Promise<BggGameData> {

    const response =

        await fetch(

            `${BGG_API_URL}?id=${bggId}&stats=0`,

            {

                headers: {

                    // Sin esta cabecera, BGG puede rechazar la
                    // petición (401/403) por tratarla como
                    // tráfico de bot — fetch() de Node no manda
                    // un User-Agent "de navegador" por defecto,
                    // y algunas APIs (BGG entre ellas, al
                    // parecer) lo exigen para peticiones
                    // automatizadas.
                    "User-Agent":

                        "BoardGameTutor/1.0 (+https://boardgametutor.vercel.app)"

                }

            }

        );

    if (!response.ok) {

        const hint =

            response.status === 401 || response.status === 403

                ? " (BGG suele devolver este código cuando bloquea la petición " +
                  "por parecer tráfico automatizado — si esto persiste, puede " +
                  "que BGG haya reforzado ese bloqueo más allá de la cabecera " +
                  "User-Agent que ya se manda)"

                : "";

        throw new Error(

            `BoardGameGeek respondió con estado ${response.status} para el id ${bggId}.${hint}`

        );

    }

    const xml = await response.text();

    return parseBggThingXml(xml);

}
