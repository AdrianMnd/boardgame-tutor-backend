import { ImportConfiguration } from "../../config/import";
import { KnowledgeIndex } from "../../infrastructure/importer/knowledgeWriter/knowledgeIndex";
import type { IFileSystem } from "../../shared/contracts/IFileSystem";

import type { ValidatedGame } from "../game/types/ValidatedGame";
import type { RetrievedChunk } from "./RetrievedChunk";

export class KeywordRetriever {

    constructor(

        private readonly fileSystem: IFileSystem,

        private readonly configuration: ImportConfiguration

    ) {}

    async retrieve(

        game: ValidatedGame,

        question: string,

        _embedding: number[]

    ): Promise<RetrievedChunk[]> {

        const knowledge =
            await this.fileSystem.readJson<KnowledgeIndex>(
                game.paths.knowledge
            );

        const words =
            question
                .toLowerCase()
                .split(/\W+/)
                .filter(word => word.length > 2);

        const results =
            knowledge.chunks
                .map(chunk => {

                    const text =
                        chunk.text.toLowerCase();

                    let score = 0;

                    for (const word of words) {

                        if (text.includes(word)) {

                            score++;

                        }

                    }

                    return {

                        id: chunk.id,

                        gameId: chunk.gameId,

                        documentId: chunk.documentId,

                        documentName: chunk.documentId,

                        page: chunk.page,

                        text: chunk.text,

                        score

                    };

                })
                .filter(chunk => chunk.score > 0)
                .sort(
                    (a, b) =>
                        b.score - a.score
                )
                .slice(
                    0,
                    this.configuration.maxRetrievedChunks
                );

        return results;

    }

}