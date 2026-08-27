import { parseBggThingXml } from "./BggParser";

import type { BggGameData } from "./BggParser";

const BGG_API_URL = "https://boardgamegeek.com/xmlapi2/thing";

/**
 * Única pieza de esta integración que toca la red de verdad —
 * separada de BggParser.ts (lógica pura, testeable sin red) a
 * propósito.
 *
 * Requiere un token de autorización (BGG_API_TOKEN) desde que
 * BGG empezó a exigir registro de aplicaciones — se manda como
 * cabecera "Authorization: Bearer <token>", el único formato que
 * aceptan (ver https://boardgamegeek.com/using_the_xml_api). Sin
 * esta variable, la petición fallará con 401 igual que antes de
 * tener el token.
 */
export async function fetchBggMetadata(

    bggId: string

): Promise<BggGameData> {

    const token = process.env.BGG_API_TOKEN;

    if (!token) {

        throw new Error(

            "Falta BGG_API_TOKEN — genera un token en " +
            "https://boardgamegeek.com/applications (pestaña \"Tokens\" " +
            "de tu aplicación aprobada) y añádelo a tu .env."

        );

    }

    const response =

        await fetch(

            `${BGG_API_URL}?id=${bggId}&stats=0`,

            {

                headers: {

                    // Sigue siendo buena práctica mandarla, aunque
                    // el token ya identifique la aplicación —
                    // algunas capas intermedias de BGG podrían
                    // seguir fijándose en ella.
                    "User-Agent":

                        "BoardGameTutor/1.0 (+https://boardgametutor.vercel.app)",

                    // El único formato que acepta BGG: "Bearer",
                    // un espacio, y el token — sin dos puntos.
                    "Authorization": `Bearer ${token}`

                }

            }

        );

    if (!response.ok) {

        // El cuerpo de la respuesta puede explicar el motivo
        // real (BGG a veces devuelve un mensaje concreto, no
        // solo un código) — mostrarlo es la única forma de
        // avanzar sin acceso directo a la API para probarlo.
        const body =

            await response.text().catch(() => "");

        const hint =

            response.status === 401

                ? " (revisa que BGG_API_TOKEN esté bien configurado — un token " +
                  "ausente, caducado, o mal copiado dan este mismo error)"

                : response.status === 403

                    ? " (BGG puede estar bloqueando la petición por otro motivo " +
                      "no relacionado con el token)"

                    : "";

        throw new Error(

            `BoardGameGeek respondió con estado ${response.status} para el id ${bggId}.${hint}` +
            (body ? `\nCuerpo de la respuesta:\n${body.slice(0, 500)}` : "")

        );

    }

    const xml = await response.text();

    return parseBggThingXml(xml);

}
