import { Chunk } from "../../infrastructure/importer/chunkGenerator/chunk";

export interface EmbeddedChunk extends Chunk {

    embedding: number[];

}