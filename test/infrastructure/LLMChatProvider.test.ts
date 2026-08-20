import { describe, expect, it } from "vitest";

import { LLMChatProvider } from "../../src/infrastructure/ai/common/LLMChatProvider";

import type { ILLMClient } from "../../src/infrastructure/ai/common/ILLMClient";

function makeFakeClient(

    // Simula un modelo real: si ve la instrucción de responder
    // siempre en español, contesta en español aunque el
    // contexto que recibe esté en inglés. Si no la ve, "se
    // confunde" y contesta en el idioma del contexto — así el
    // test falla de forma clara si la instrucción desaparece
    // del prompt en algún cambio futuro.
    onGenerateText: (prompt: string) => string

): ILLMClient {

    return {

        supportsEmbeddings: false,

        supportsChat: true,

        generateText: async prompt => onGenerateText(prompt)

    };

}

describe("LLMChatProvider", () => {

    it("incluye en el prompt la instrucción de responder siempre en español", async () => {

        let promptRecibido = "";

        const client =

            makeFakeClient(prompt => {

                promptRecibido = prompt;

                return "respuesta de prueba";

            });

        const provider = new LLMChatProvider(client);

        await provider.answer(

            "¿cómo se gana la partida?",

            "Some context in English about winning the game."

        );

        expect(promptRecibido).toContain("Responde SIEMPRE en español");

    });

    it("incluye en el prompt la instrucción para el caso de respuesta relacionada pero no específica", async () => {

        let promptRecibido = "";

        const client =

            makeFakeClient(prompt => {

                promptRecibido = prompt;

                return "respuesta de prueba";

            });

        const provider = new LLMChatProvider(client);

        await provider.answer(

            "¿cuántos puntos necesito para ganar en el modo avanzado?",

            "El juego básico termina al llegar a 10 puntos de victoria."

        );

        expect(promptRecibido).toContain(

            "No se ha encontrado una respuesta específica a tu pregunta, pero esto es lo que se ha encontrado relacionado con el reglamento:"

        );

        // La frase para el caso "sin nada relacionado en absoluto"
        // sigue existiendo — no se ha sustituido, solo se le ha
        // añadido un caso intermedio antes.
        expect(promptRecibido).toContain(

            "No he encontrado esa información en el reglamento."

        );

    });

    it("incluye el historial de la conversación en el prompt cuando se pasa", async () => {

        let promptRecibido = "";

        const client =

            makeFakeClient(prompt => {

                promptRecibido = prompt;

                return "respuesta de prueba";

            });

        const provider = new LLMChatProvider(client);

        await provider.answer(

            "¿y con 5 jugadores?",

            "El juego termina al llegar a 10 puntos.",

            {

                history: [

                    { role: "user", content: "¿cómo se gana la partida?" },

                    { role: "assistant", content: "Se gana al llegar a 10 puntos de victoria." }

                ]

            }

        );

        expect(promptRecibido).toContain("Usuario: ¿cómo se gana la partida?");
        expect(promptRecibido).toContain("Tú: Se gana al llegar a 10 puntos de victoria.");

    });

    it("no añade la sección de historial si no se pasa ninguno", async () => {

        let promptRecibido = "";

        const client =

            makeFakeClient(prompt => {

                promptRecibido = prompt;

                return "respuesta de prueba";

            });

        const provider = new LLMChatProvider(client);

        await provider.answer(

            "¿cómo se gana?",

            "El juego termina al llegar a 10 puntos."

        );

        expect(promptRecibido).not.toContain("Conversación previa");

    });

    it("recorta el historial a los últimos turnos, aunque se manden muchos más", async () => {

        let promptRecibido = "";

        const client =

            makeFakeClient(prompt => {

                promptRecibido = prompt;

                return "respuesta de prueba";

            });

        const provider = new LLMChatProvider(client);

        const historialLargo =

            Array.from({ length: 20 }, (_, i) => ({

                role: (i % 2 === 0 ? "user" : "assistant") as const,

                content: `mensaje-${i}`

            }));

        await provider.answer(

            "pregunta actual",

            "contexto",

            { history: historialLargo }

        );

        // Los mensajes más antiguos no deben llegar al prompt —
        // solo los últimos MAX_HISTORY_TURNS (6).
        expect(promptRecibido).not.toContain("mensaje-0");
        expect(promptRecibido).not.toContain("mensaje-10");

        // Los últimos sí.
        expect(promptRecibido).toContain("mensaje-19");
        expect(promptRecibido).toContain("mensaje-14");

    });

    it("incluye el número de jugadores en el prompt cuando se pasa", async () => {

        let promptRecibido = "";

        const client =

            makeFakeClient(prompt => {

                promptRecibido = prompt;

                return "respuesta de prueba";

            });

        const provider = new LLMChatProvider(client);

        await provider.answer(

            "¿cómo se gana?",

            "El juego termina al llegar a 10 puntos.",

            { playerCount: 5 }

        );

        expect(promptRecibido).toContain("Esta partida se está jugando con 5 jugadores.");

    });

    it("no menciona el número de jugadores si no se pasa", async () => {

        let promptRecibido = "";

        const client =

            makeFakeClient(prompt => {

                promptRecibido = prompt;

                return "respuesta de prueba";

            });

        const provider = new LLMChatProvider(client);

        await provider.answer(

            "¿cómo se gana?",

            "El juego termina al llegar a 10 puntos."

        );

        expect(promptRecibido).not.toContain("jugando con");

    });

    it("simula un contexto en inglés + pregunta en español y comprueba que el prompt se lo indica a la IA", async () => {

        // No podemos ejecutar un modelo de verdad en un test —
        // lo que sí podemos comprobar es que, dado un contexto
        // en inglés, el prompt que recibiría la IA contiene
        // tanto el contexto en inglés COMO la instrucción de
        // responder en español, en el orden correcto (la
        // instrucción antes del contexto, para que la IA la lea
        // primero).
        let promptRecibido = "";

        const client =

            makeFakeClient(prompt => {

                promptRecibido = prompt;

                return "La regla dice que ganas al llegar a 10 puntos.";

            });

        const provider = new LLMChatProvider(client);

        const englishContext =

            "### Fragmento 1\nPage 4\n\nThe game ends when a player " +
            "reaches 10 victory points.";

        const result =

            await provider.answer(

                "¿cómo se gana la partida?",

                englishContext

            );

        const indiceInstruccion =
            promptRecibido.indexOf("Responde SIEMPRE en español");

        const indiceContexto =
            promptRecibido.indexOf(englishContext);

        expect(indiceInstruccion).toBeGreaterThan(-1);
        expect(indiceContexto).toBeGreaterThan(-1);
        expect(indiceInstruccion).toBeLessThan(indiceContexto);

        // La respuesta simulada de la IA (que representa lo que
        // haría un modelo real siguiendo esa instrucción) está
        // en español.
        expect(result).toBe(

            "La regla dice que ganas al llegar a 10 puntos."

        );

    });

    it("answerStream también incluye la instrucción de idioma", async () => {

        let promptRecibido = "";

        const client: ILLMClient = {

            supportsEmbeddings: false,

            supportsChat: true,

            generateText: async () => "",

            generateTextStream: async function* (prompt: string) {

                promptRecibido = prompt;

                yield "respuesta ";
                yield "en streaming";

            }

        };

        const provider = new LLMChatProvider(client);

        const chunks: string[] = [];

        for await (

            const chunk of provider.answerStream(

                "pregunta",

                "context in english"

            )

        ) {

            chunks.push(chunk);

        }

        expect(promptRecibido).toContain("Responde SIEMPRE en español");
        expect(chunks.join("")).toBe("respuesta en streaming");

    });

});
