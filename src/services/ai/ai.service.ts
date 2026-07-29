import { loadKnowledge } from "./knowlegde.service";
import { findRelevantContext } from "./rag.service";

export async function generateAnswer(
    gameId: number,
    question: string
): Promise<string> {

    const knowledge =
        await loadKnowledge(gameId);

    const context =
        findRelevantContext(
            knowledge,
            question
        );

    return `
=== CONTEXTO ENCONTRADO ===

${context}

===========================

Pregunta:
${question}

(De momento todavía no estamos usando IA.)
`;

}