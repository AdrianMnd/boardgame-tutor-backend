import type { AskQuestionResult } from "../../../application/use-cases/ask-question/askQuestionResult";

import type {

    AskQuestionResponse

} from "../dto/askQuestionResponse";

export class ChatMapper {

    static toResponse(

        result: AskQuestionResult

    ): AskQuestionResponse {

        return {

            answer: result.answer,

            sources:

                result.sources.map(

                    source => ({

                        page: source.page,

                        score: Number(

                            source.score.toFixed(3)

                        )

                    })

                )

        };

    }

}