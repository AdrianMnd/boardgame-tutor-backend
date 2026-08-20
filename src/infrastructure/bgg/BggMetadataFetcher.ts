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

        await fetch(`${BGG_API_URL}?id=${bggId}&stats=0`);

    if (!response.ok) {

        throw new Error(

            `BoardGameGeek respondió con estado ${response.status} para el id ${bggId}.`

        );

    }

    const xml = await response.text();

    return parseBggThingXml(xml);

}
