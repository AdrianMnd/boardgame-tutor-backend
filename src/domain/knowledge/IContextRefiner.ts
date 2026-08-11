import { RetrievedChunk } from "./RetrievedChunk";

/**
 * Combina en un solo paso lo que antes eran dos pasos
 * independientes (reordenar por relevancia + recortar el
 * texto irrelevante de cada fragmento). Fusionarlos en una
 * única llamada al modelo reduce de 3 a 2 las peticiones de IA
 * necesarias para responder una pregunta.
 */
export interface IContextRefiner {

    refine(

        question: string,

        chunks: RetrievedChunk[]

    ): Promise<RetrievedChunk[]>;

}
