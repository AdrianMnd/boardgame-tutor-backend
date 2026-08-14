import { RetrievedChunk } from "./RetrievedChunk";

/**
 * Reordena los fragmentos recuperados de más a menos relevantes
 * para la pregunta, en una única llamada de IA — sin modificar
 * el texto de ningún fragmento (ver los comentarios de
 * LLMContextRefiner para el porqué).
 */
export interface IContextRefiner {

    refine(

        question: string,

        chunks: RetrievedChunk[]

    ): Promise<RetrievedChunk[]>;

}
