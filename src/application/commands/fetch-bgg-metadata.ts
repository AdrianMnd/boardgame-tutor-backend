import "dotenv/config";

import fs from "fs/promises";
import path from "path";

import { extractBggId } from "../../infrastructure/bgg/BggParser";
import { fetchBggMetadata } from "../../infrastructure/bgg/BggMetadataFetcher";

import type { GameMetadata } from "../../domain/game/types/GameMetadata";

async function readExistingMetadata(

    metadataPath: string

): Promise<Partial<GameMetadata>> {

    try {

        const raw = await fs.readFile(metadataPath, "utf-8");

        return JSON.parse(raw) as Partial<GameMetadata>;

    }
    catch {

        return {};

    }

}

async function main() {

    const [localId, bggInput] = process.argv.slice(2);

    if (!localId || !bggInput) {

        console.error("");
        console.error("Uso:");
        console.error("");
        console.error("  npm run fetch-bgg <idLocal> <idOrUrlDeBGG>");
        console.error("");
        console.error("Ejemplos:");
        console.error("  npm run fetch-bgg catan 13");
        console.error("  npm run fetch-bgg catan https://boardgamegeek.com/boardgame/13/catan");
        console.error("");

        process.exit(1);

    }

    const bggId = extractBggId(bggInput);

    console.log(`Consultando BoardGameGeek (id ${bggId})...`);

    const bggData = await fetchBggMetadata(bggId);

    const gameDir = path.join("games", localId);

    const metadataPath = path.join(gameDir, "metadata.json");

    await fs.mkdir(path.join(gameDir, "source"), { recursive: true });

    await fs.mkdir(path.join(gameDir, "assets"), { recursive: true });

    const existing =

        await readExistingMetadata(metadataPath);

    const metadata: GameMetadata = {

        id: localId,

        name: existing.name ?? bggData.name,

        language: existing.language ?? "es",

        version: existing.version ?? "1.0",

        minPlayers: existing.minPlayers ?? bggData.minPlayers ?? 1,

        maxPlayers: existing.maxPlayers ?? bggData.maxPlayers ?? 1,

        year: existing.year ?? bggData.year ?? new Date().getFullYear()

    };

    await fs.writeFile(

        metadataPath,

        JSON.stringify(metadata, null, 2) + "\n"

    );

    console.log("");
    console.log(`metadata.json escrito en ${metadataPath}:`);
    console.log("");
    console.log(JSON.stringify(metadata, null, 2));
    console.log("");
    console.log(
        `Revisa los datos (especialmente el idioma "${metadata.language}" ` +
        `y la versión "${metadata.version}", que BGG no conoce) y coloca ` +
        `el PDF del reglamento en ${gameDir}/source/ antes de ejecutar ` +
        `npm run import ${localId}.`
    );

}

main().catch(error => {

    console.error("");
    console.error(`Error: ${error instanceof Error ? error.message : error}`);
    console.error("");

    process.exit(1);

});
