import { ChatProvider } from "../../../domain/ai/chatProvider";

import type { ILLMClient } from "./ILLMClient";

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

        context: string

    ): Promise<string> {

        return this.client.generateText(

            this.buildPrompt(question, context)

        );

    }

    async *answerStream(

        question: string,

        context: string

    ): AsyncIterable<string> {

        const prompt =

            this.buildPrompt(question, context);

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

        context: string

    ): string {

        return `
Eres un experto en juegos de mesa.

Tu única fuente de información es el contexto proporcionado.

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

Contexto:

${context}

Pregunta:

${question}

Respuesta:
`;

    }

}
