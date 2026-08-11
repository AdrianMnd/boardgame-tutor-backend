import type { RetrievedChunk } from "../../../domain/knowledge/RetrievedChunk";

/**
 * Eventos que emite AskQuestionUseCase.executeStream(), en
 * este orden: primero "sources" (una vez, en cuanto se conoce
 * el contexto), luego varios "chunk" (a medida que el modelo
 * genera la respuesta), y finalmente "done".
 *
 * Si algo falla a mitad de la respuesta, el generador lanza la
 * excepción tal cual — quien lo consuma decide cómo mostrarlo
 * (ej. seguir mostrando lo ya recibido + un aviso).
 */
export type AskQuestionStreamEvent =

    | { type: "sources"; sources: RetrievedChunk[] }
    | { type: "chunk"; text: string }
    | { type: "done" };
