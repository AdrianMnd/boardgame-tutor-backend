import { ChatProvider } from "../../../domain/ai/chatProvider";

import type { ChatContextOptions } from "../../../domain/ai/chatProvider";
import type { ChatTurn } from "../../../domain/ai/chatTurn";
import type { ILLMClient } from "./ILLMClient";

// Máximo de turnos previos que se incluyen en el prompt, sin
// importar cuántos mande el cliente — una conversación guardada
// puede llegar a tener hasta 30 mensajes (ver el límite de la
// base de datos), y mandarlos todos en cada pregunta inflaría el
// prompt y el tiempo de respuesta en cada turno nuevo, justo lo
// contrario de lo que se ganó al quitar el paso de refinado.
// 3 intercambios (6 turnos) es de sobra para entender una
// pregunta de seguimiento sin arrastrar toda la conversación.
const MAX_HISTORY_TURNS = 6;

/**
 * ChatProvider genérico: funciona con cualquier ILLMClient,
 * incluyendo FallbackLLMClient (que internamente prueba varios
 * proveedores en orden ante errores de cuota).
 */
export class LLMChatProvider
    implements ChatProvider {

    constructor(

        private readonly client: ILLMClient

    ) {}

    async answer(

        question: string,

        context: string,

        options: ChatContextOptions = {}

    ): Promise<string> {

        return this.client.generateText(

            this.buildPrompt(question, context, options)

        );

    }

    async *answerStream(

        question: string,

        context: string,

        options: ChatContextOptions = {}

    ): AsyncIterable<string> {

        const prompt =

            this.buildPrompt(question, context, options);

        if (this.client.generateTextStream) {

            yield* this.client.generateTextStream(prompt);

            return;

        }

        // El cliente activo no soporta streaming: se entrega la
        // respuesta completa como un único fragmento, para que
        // quien consuma el stream no tenga que distinguir casos.
        const text = await this.client.generateText(prompt);

        if (text) {

            yield text;

        }

    }

    private buildPrompt(

        question: string,

        context: string,

        { history = [], playerCount }: ChatContextOptions

    ): string {

        const recentHistory =

            history.slice(-MAX_HISTORY_TURNS);

        const historySection =

            recentHistory.length === 0

                ? ""

                : `
Conversación previa (solo para entender a qué se refiere una
pregunta de seguimiento, por ejemplo "¿y con 5 jugadores?" — el
contexto de más abajo sigue siendo la ÚNICA fuente de verdad para
las reglas en sí; no des por buena ninguna afirmación de tus
propias respuestas anteriores si no está respaldada por el
contexto actual):

${
    recentHistory

        .map(

            (turn: ChatTurn) =>

                `${turn.role === "user" ? "Usuario" : "Tú"}: ${turn.content}`

        )

        .join("\n")
}
`;

        const playerCountSection =

            !playerCount

                ? ""

                : `
Esta partida se está jugando con ${playerCount} jugadores. Si el
reglamento distingue reglas según el número de jugadores (por
ejemplo, variantes para 2 jugadores, o cambios a partir de cierto
número), aplica específicamente las que correspondan a ${playerCount}
jugadores, y dilo explícitamente si una regla cambia según el
número de jugadores. Si el reglamento no distingue nada según el
número de jugadores para lo que se pregunta, ignora este dato y
responde con normalidad.
`;

        return `
Eres un experto en juegos de mesa.

Tu única fuente de información sobre las reglas es el contexto
proporcionado más abajo.

Normas:

- Responde SIEMPRE en español, sin importar en qué idioma esté
  redactado el contexto (el reglamento puede estar en inglés,
  francés, alemán...). Traduce la información relevante al español
  de forma natural — nunca copies literalmente frases en otro idioma
  ni mezcles idiomas en la respuesta.
- Responde únicamente utilizando la información del contexto.
- No inventes reglas ni añadas datos que no estén en el contexto.
- No utilices conocimientos propios sobre el juego.
- El contexto puede venir de varios fragmentos distintos (reglamento,
  fes de erratas, packs de facción...) — combina la información de
  todos los fragmentos relevantes para dar una respuesta completa,
  igual que haría alguien leyendo el reglamento entero. Un fragmento
  que describa un cambio ("Cambia a:", una fe de erratas) sigue
  siendo información válida y aplicable, no la descartes por no ser
  el texto original completo.
- Si, combinando todos los fragmentos, la pregunta queda
  razonablemente respondida, contesta con esa información — no hace
  falta que un único fragmento por sí solo contenga la respuesta
  completa.
- Si el contexto trata el tema de forma relacionada pero NO responde
  de forma específica o completa a lo que se pregunta exactamente
  (por ejemplo, habla de una situación parecida pero no de este caso
  concreto), no uses el mensaje de "no encontrado" — en su lugar,
  empieza tu respuesta EXACTAMENTE con esta frase, tal cual, sin
  modificarla:

"No se ha encontrado una respuesta específica a tu pregunta, pero esto es lo que se ha encontrado relacionado con el reglamento:"

  Después de esa frase, en un párrafo aparte, resume con tus propias
  palabras la información relacionada que sí aparece en el contexto
  — sin inventar nada que no esté ahí, y dejando claro que es
  información relacionada, no una respuesta directa a la pregunta.
- Solo si el contexto no trata en absoluto el tema preguntado (ni de
  forma directa ni de forma relacionada), responde exactamente:

"No he encontrado esa información en el reglamento."
${historySection}${playerCountSection}
Contexto:

${context}

Pregunta:

${question}

Respuesta:
`;

    }

}
