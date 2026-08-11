import type { AskQuestionResult } from "../../../application/use-cases/ask-question/askQuestionResult";

import type {
    AskQuestionResponse
} from "../dto/askQuestionResponse";

import type { RetrievedChunk } from "../../../domain/knowledge/RetrievedChunk";

export class ChatMapper {

    static toResponse(
        result: AskQuestionResult
    ): AskQuestionResponse {

        return {

            answer: result.answer,

            sources:

                this.toSources(result.sources)

        };

    }

    static toSources(

        sources: RetrievedChunk[]

    ): AskQuestionResponse["sources"] {

        return sources.map(source => ({

            id: source.id,

            gameId: source.gameId,

            page: source.page,

            text: source.text,

            score: Number(
                source.score.toFixed(3)
            )

        }));

    }

}