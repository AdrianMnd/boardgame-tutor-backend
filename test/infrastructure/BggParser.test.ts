import { describe, expect, it } from "vitest";

import {
    decodeXmlEntities,
    extractBggId,
    parseBggThingXml
} from "../../src/infrastructure/bgg/BggParser";

const SAMPLE_XML = `
<items>
  <item type="boardgame" id="13">
    <name type="primary" sortindex="1" value="CATAN" />
    <name type="alternate" sortindex="1" value="Catán" />
    <description>Descripción larga aquí...</description>
    <yearpublished value="1995" />
    <minplayers value="3" />
    <maxplayers value="4" />
    <playingtime value="120" />
  </item>
</items>
`;

describe("extractBggId", () => {

    it("extrae el id de una URL completa de BGG", () => {

        expect(

            extractBggId("https://boardgamegeek.com/boardgame/13/catan")

        ).toBe("13");

    });

    it("acepta un id numérico directo", () => {

        expect(extractBggId("13")).toBe("13");
        expect(extractBggId("  266192  ")).toBe("266192");

    });

    it("lanza un error con un texto que no es ni id ni URL de BGG", () => {

        expect(

            () => extractBggId("esto no es válido")

        ).toThrow();

    });

});

describe("decodeXmlEntities", () => {

    it("decodifica las entidades XML más comunes", () => {

        expect(decodeXmlEntities("Marvel &amp; DC")).toBe("Marvel & DC");
        expect(decodeXmlEntities("It&#039;s Mine")).toBe("It's Mine");
        expect(decodeXmlEntities("A &lt;B&gt; C")).toBe("A <B> C");

    });

    it("deja intacto el texto que no tiene entidades", () => {

        expect(decodeXmlEntities("Catan")).toBe("Catan");

    });

});

describe("parseBggThingXml", () => {

    it("extrae nombre, año y número de jugadores del XML de ejemplo", () => {

        const result = parseBggThingXml(SAMPLE_XML);

        expect(result).toEqual({

            name: "CATAN",

            year: 1995,

            minPlayers: 3,

            maxPlayers: 4

        });

    });

    it("decodifica entidades XML en el nombre", () => {

        const xml = `
            <item>
                <name type="primary" value="Boggle &amp; Friends" />
                <yearpublished value="1972" />
                <minplayers value="2" />
                <maxplayers value="8" />
            </item>
        `;

        const result = parseBggThingXml(xml);

        expect(result.name).toBe("Boggle & Friends");

    });

    it("deja los campos numéricos como undefined si no aparecen en el XML", () => {

        const xml = `<item><name type="primary" value="Juego sin más datos" /></item>`;

        const result = parseBggThingXml(xml);

        expect(result).toEqual({

            name: "Juego sin más datos",

            year: undefined,

            minPlayers: undefined,

            maxPlayers: undefined

        });

    });

    it("lanza un error si no encuentra el nombre principal (id inexistente o XML inesperado)", () => {

        expect(

            () => parseBggThingXml("<items></items>")

        ).toThrow();

    });

});
