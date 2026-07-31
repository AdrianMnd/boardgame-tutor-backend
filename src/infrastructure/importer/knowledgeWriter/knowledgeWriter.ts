import path from "node:path";
import { IFileSystem } from "../../../shared/contracts/IFileSystem";
import { EmbeddedChunk } from "../../../domain/importer/embeddedChunk";
import { KnowledgeIndex } from "./knowledgeIndex";



export class KnowledgeWriter {

    constructor(

    private readonly fileSystem: IFileSystem,

    private readonly embeddingModel: string

) {}

    async write(

        gameId: string,

        chunks: EmbeddedChunk[]

    ): Promise<void> {

        const knowledgeIndex: KnowledgeIndex = {

            gameId,

            createdAt: new Date().toISOString(),

            totalChunks: chunks.length,

            embeddingModel: this.embeddingModel,

            chunks

        };

        const outputPath = path.join(

            process.cwd(),

            "knowledge",

            "games",

            gameId,

            "generated",

            "embeddings.json"

        );

        await this.fileSystem.writeJson(

            outputPath,

            knowledgeIndex

        );

    }

}