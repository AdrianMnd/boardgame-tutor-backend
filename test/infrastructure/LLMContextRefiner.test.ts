import { describe, expect, it } from "vitest";

import { LLMContextRefiner } from "../../src/infrastructure/ai/common/LLMContextRefiner";

import type { ILLMClient } from "../../src/infrastructure/ai/common/ILLMClient";
import type { RetrievedChunk } from "../../src/domain/knowledge/RetrievedChunk";

function makeChunk(

    overrides: Partial<RetrievedChunk> = {}

): RetrievedChunk {

    return {

        id: "chunk-1",

        gameId: "40k",

        page: 42,

        score: 0.9,

        text: "Texto original del fragmento.",

        ...overrides

    };

}

function makeFakeClient(

    respondWith: string

): ILLMClient {

    return {

        supportsEmbeddings: false,

        supportsChat: true,

        generateText: async () => respondWith,

        generateChat: async () => respondWith

    };

}

describe("LLMContextRefiner", () => {

    it("no modifica el texto de los fragmentos, aunque la IA intente devolver uno recortado", async () => {

        // Simula exactamente el bug real: la IA "intenta"
        // devolver una versión recortada del texto (como hacía
        // el diseño antiguo) — el refiner nuevo debe ignorar
        // por completo cualquier campo de texto que la IA
        // devuelva, y conservar siempre el original íntegro.
        const originalText =

            "La regla de Destacamento de Cábala del Caos otorga " +

            "+1 a las tiradas de impacto con armas de fuego " +

            "cuando la unidad está a 6 pulgadas de un Campeón del Caos.";

        const chunks = [

            makeChunk({

                id: "a",

                page: 12,

                text: originalText

            }),

            makeChunk({

                id: "b",

                page: 30,

                text: "Otro fragmento, menos relevante."

            })

        ];

        // La IA devuelve un "text" (formato del diseño antiguo)
        // que ha eliminado el dato clave (+1 a las tiradas) —
        // el refiner nuevo ni siquiera debería mirar ese campo.
        const client =

            makeFakeClient(

                JSON.stringify({

                    order: ["a", "b"],

                    chunks: [

                        { id: "a", text: "La regla de Destacamento de Cábala del Caos." }

                    ]

                })

            );

        const refiner = new LLMContextRefiner(client);

        const result =

            await refiner.refine(

                "¿Cómo funciona la regla de Destacamento de Cábala del Caos?",

                chunks

            );

        const chunkA =

            result.find(chunk => chunk.id === "a");

        expect(chunkA?.text).toBe(originalText);
        expect(chunkA?.text).toContain("+1 a las tiradas de impacto");

    });

    it("reordena los fragmentos según el orden indicado por la IA", async () => {

        const chunks = [

            makeChunk({ id: "a", page: 1 }),

            makeChunk({ id: "b", page: 2 }),

            makeChunk({ id: "c", page: 3 })

        ];

        const client =

            makeFakeClient(

                JSON.stringify({ order: ["c", "a", "b"] })

            );

        const refiner = new LLMContextRefiner(client);

        const result =

            await refiner.refine("pregunta", chunks);

        expect(result.map(c => c.id)).toEqual(["c", "a", "b"]);

    });

    it("no descarta fragmentos que la IA omita del orden", async () => {

        const chunks = [

            makeChunk({ id: "a" }),

            makeChunk({ id: "b" }),

            makeChunk({ id: "c" })

        ];

        // La IA solo menciona "b" — "a" y "c" deben seguir
        // presentes, añadidos al final, no perderse.
        const client =

            makeFakeClient(

                JSON.stringify({ order: ["b"] })

            );

        const refiner = new LLMContextRefiner(client);

        const result =

            await refiner.refine("pregunta", chunks);

        expect(result).toHaveLength(3);
        expect(result.map(c => c.id)).toContain("a");
        expect(result.map(c => c.id)).toContain("c");

    });

    it("devuelve el orden original si la respuesta de la IA no es JSON válido", async () => {

        const chunks = [

            makeChunk({ id: "a" }),

            makeChunk({ id: "b" })

        ];

        const client = makeFakeClient("esto no es JSON {{{");

        const refiner = new LLMContextRefiner(client);

        const result =

            await refiner.refine("pregunta", chunks);

        expect(result).toEqual(chunks);

    });

    it("no gasta ninguna llamada de IA con 0 o 1 fragmento", async () => {

        let callCount = 0;

        const client: ILLMClient = {

            supportsEmbeddings: false,

            supportsChat: true,

            generateText: async () => {

                callCount++;

                return "{}";

            },

            generateChat: async () => "{}"

        };

        const refiner = new LLMContextRefiner(client);

        await refiner.refine("pregunta", []);
        await refiner.refine("pregunta", [makeChunk()]);

        expect(callCount).toBe(0);

    });

});
