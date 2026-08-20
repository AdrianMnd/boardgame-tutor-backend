/**
 * Todo lo que se puede probar sin hacer ninguna llamada de red
 * real a BoardGameGeek — separado a propósito de
 * BggMetadataFetcher.ts (que sí llama a la red), para poder
 * testear el parseo del XML con casos fijos.
 */

const BGG_URL_PATTERN = /boardgame\/(\d+)/;

/**
 * Acepta tanto un id directo ("13") como una URL completa de BGG
 * ("https://boardgamegeek.com/boardgame/13/catan").
 */
export function extractBggId(

    input: string

): string {

    const trimmed = input.trim();

    const urlMatch = trimmed.match(BGG_URL_PATTERN);

    if (urlMatch) {

        return urlMatch[1];

    }

    if (/^\d+$/.test(trimmed)) {

        return trimmed;

    }

    throw new Error(

        `No se ha podido extraer un id de BoardGameGeek de: "${input}". ` +
        `Usa un id numérico o una URL de BGG (ej. https://boardgamegeek.com/boardgame/13/catan).`

    );

}

const XML_ENTITIES: Record<string, string> = {

    "&amp;": "&",

    "&lt;": "<",

    "&gt;": ">",

    "&quot;": "\"",

    "&#039;": "'",

    "&apos;": "'"

};

export function decodeXmlEntities(

    text: string

): string {

    return text.replace(

        /&amp;|&lt;|&gt;|&quot;|&#039;|&apos;/g,

        match => XML_ENTITIES[match]

    );

}

export interface BggGameData {

    name: string;

    year?: number;

    minPlayers?: number;

    maxPlayers?: number;

}

function extractAttributeValue(

    xml: string,

    pattern: RegExp

): string | null {

    const match = xml.match(pattern);

    return match ? decodeXmlEntities(match[1]) : null;

}

/**
 * Parsea la respuesta XML de /xmlapi2/thing — con expresiones
 * regulares, no con un parser XML completo. Es deliberado: la
 * estructura de estos atributos concretos es simple y estable, y
 * no merece la pena añadir una dependencia nueva solo para leer
 * cuatro valores de un documento que no vamos a modificar ni
 * recorrer de forma genérica.
 */
export function parseBggThingXml(

    xml: string

): BggGameData {

    const name =

        extractAttributeValue(

            xml,

            /<name type="primary"[^>]*value="([^"]*)"/

        );

    if (!name) {

        throw new Error(

            "No se ha podido leer el nombre del juego en la respuesta de BGG " +
            "— comprueba que el id es correcto y que el juego existe."

        );

    }

    const year =

        extractAttributeValue(xml, /<yearpublished value="(\d+)"/);

    const minPlayers =

        extractAttributeValue(xml, /<minplayers value="(\d+)"/);

    const maxPlayers =

        extractAttributeValue(xml, /<maxplayers value="(\d+)"/);

    return {

        name,

        year: year ? Number(year) : undefined,

        minPlayers: minPlayers ? Number(minPlayers) : undefined,

        maxPlayers: maxPlayers ? Number(maxPlayers) : undefined

    };

}
