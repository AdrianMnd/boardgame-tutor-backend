import { loadKnowledge } from "./rag/knowledge.service";
import { findRelevantContext } from "./rag/rag.service";
import type { AIResponse } from "../../types/AIResponse";

import {
    createProvider
} from "./providers/provider.factory";

export async function generateAnswer(
    gameId: number,
    question: string
): Promise<AIResponse> {

    const knowledge =
        await loadKnowledge(gameId);

    const context =
        findRelevantContext(
            knowledge,
            question
        );

    const provider =
        createProvider();

    return await provider.ask(
        question,
        context
    );

}