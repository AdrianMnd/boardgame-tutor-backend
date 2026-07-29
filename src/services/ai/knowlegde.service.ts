import fs from "fs/promises";
import path from "path";

const GAME_FILES: Record<number, string> = {
    1: "catan.txt",
    2: "carcassonne.txt",
    3: "terraforming-mars.txt"
};

export async function loadKnowledge(
    gameId: number
): Promise<string> {

    const fileName = GAME_FILES[gameId];

    if (!fileName) {
        throw new Error("Juego no encontrado.");
    }

    const filePath = path.join(
        __dirname,
        "../../knowledge",
        fileName
    );

    return await fs.readFile(
        filePath,
        "utf8"
    );

}