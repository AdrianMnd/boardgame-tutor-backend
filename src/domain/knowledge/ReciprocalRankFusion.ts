import { RetrievedChunk } from "./RetrievedChunk";

export class ReciprocalRankFusion {

    constructor(

        private readonly k = 60,

        private readonly limit = 5

    ) {}

    fuse(

        ...lists: RetrievedChunk[][]

    ): RetrievedChunk[] {

        const map =

            new Map<string, RetrievedChunk>();

        const scores =

            new Map<string, number>();

        for (const list of lists) {

            list.forEach(

                (

                    chunk,

                    index

                ) => {

                    const score =

                        1 / (

                            this.k +

                            index +

                            1

                        );

                    map.set(

                        chunk.id,

                        chunk

                    );

                    scores.set(

                        chunk.id,

                        (

                            scores.get(

                                chunk.id

                            ) ??

                            0

                        ) + score

                    );

                }

            );

        }

        return [...map.values()]

            .sort(

                (

                    a,

                    b

                ) =>

                    (

                        scores.get(

                            b.id

                        )!

                    ) -

                    (

                        scores.get(

                            a.id

                        )!

                    )

            ).slice(

        0,

        this.limit

    );

    }

}