import "dotenv/config";

import path from "node:path";

import { NodeFileSystem } from "../../infrastructure/filesystem/NodeFileSystem";
import { createPool } from "../../infrastructure/database/pool";
import { loadDatabaseConfiguration } from "../../config/database";
import { loadStorageConfiguration } from "../../config/storage";
import { B2FileStorage } from "../../infrastructure/storage/B2FileStorage";
import { PostgresKnowledgeWriter } from "../../infrastructure/database/PostgresKnowledgeWriter";

import type { IFileSystem } from "../../shared/contracts/IFileSystem";
import type { IFileStorage } from "../../shared/contracts/IFileStorage";
import type { GameMetadata } from "../../domain/game/types/GameMetadata";
import type { EmbeddedChunk } from "../../domain/importer/embeddedChunk";
import type { Pool } from "pg";

/**
 * Formato antiguo de knowledge.json, con dos variantes que hay
 * que soportar:
 *
 * 1. Anterior a multi-documento: sin campo `documents` en
 *    absoluto (solo `chunks`, sin `documentId` en cada uno) —
 *    todo el juego era implícitamente "rulebook.pdf".
 * 2. Con multi-documento: campo `documents` presente, cada
 *    chunk con su `documentId`.
 *
 * `documents` y el `documentId` de cada chunk se tratan como
 * opcionales a propósito, para poder migrar ambas variantes con
 * el mismo código.
 */
interface LegacyDocumentDescriptor {

    id: string;

    filename: string;

    name: string;

}

interface LegacyChunk {

    id: string;

    gameId: string;

    documentId?: string;

    page: number;

    index: number;

    text: string;

    embedding: number[];

}

interface LegacyKnowledgeIndex {

    gameId: string;

    documents?: LegacyDocumentDescriptor[];

    chunks: LegacyChunk[];

}

const DEFAULT_DOCUMENT: LegacyDocumentDescriptor = {

    id: "rulebook",

    filename: "rulebook.pdf",

    name: "Rulebook"

};

interface MigrationResult {

    migrated: string[];

    skipped: { gameId: string; reason: string }[];

    failed: { gameId: string; error: string; stack?: string }[];

}

/**
 * Comprueba que Neon y B2 responden ANTES de tocar ningún
 * juego, con mensajes de error concretos por servicio — un
 * "Invalid URL" a secas durante la migración de un juego
 * concreto no dice nada sobre si el problema es la base de
 * datos, el almacenamiento, o ambos.
 */
async function preflightCheck(

    pool: Pool,

    storage: IFileStorage

): Promise<void> {

    console.log("Comprobando la conexión a Neon...");

    try {

        await pool.query("SELECT 1");

        console.log("   ✔ Neon responde correctamente");

    }
    catch (error) {

        console.error("");
        console.error("   ✘ No se ha podido conectar a Neon.");
        console.error("");
        console.error(

            "   Revisa que DATABASE_URL en tu .env sea EXACTAMENTE la " +
            "cadena que te da el panel de Neon (\"Connection string\"), " +
            "sin comillas ni espacios de más. Debe empezar por " +
            "\"postgres://\" o \"postgresql://\"."

        );
        console.error("");
        console.error("   Error original:", error);
        console.error("");

        process.exit(1);

    }

    console.log("Comprobando que el esquema está aplicado...");

    try {

        await pool.query("SELECT 1 FROM games LIMIT 1");

        console.log("   ✔ Las tablas existen");

    }
    catch {

        console.error("");
        console.error(

            "   ✘ La conexión a Neon funciona, pero la tabla \"games\" no " +
            "existe todavía."

        );
        console.error("");
        console.error(

            "   Te falta aplicar el esquema — ve al panel de Neon → tu " +
            "proyecto → pestaña \"SQL Editor\", pega el contenido de " +
            "db/schema.sql (en la raíz de este backend) y ejecútalo. " +
            "Después vuelve a lanzar este script."

        );
        console.error("");

        process.exit(1);

    }

    console.log("Comprobando la conexión a Backblaze B2...");

    const testKey = "__migration-preflight-test__.txt";

    try {

        await storage.upload(

            testKey,

            Buffer.from("prueba de conexión"),

            "text/plain"

        );

        const exists =
            await storage.exists(testKey);

        if (!exists) {

            throw new Error(

                "El archivo de prueba se subió pero no se encuentra " +
                "al comprobarlo — revisa el nombre del bucket."

            );

        }

        console.log("   ✔ B2 responde correctamente");

    }
    catch (error) {

        console.error("");
        console.error("   ✘ No se ha podido subir un archivo de prueba a B2.");
        console.error("");
        console.error(

            "   Revisa en tu .env:\n" +
            "   - B2_ENDPOINT: debe ser la URL completa con \"https://\" " +
            "(pestaña \"Settings\" del bucket → sección \"S3 API\").\n" +
            "   - B2_BUCKET: el nombre exacto del bucket.\n" +
            "   - B2_ACCESS_KEY_ID / B2_SECRET_ACCESS_KEY: la " +
            "\"Application Key\" que generaste — si la cerraste sin " +
            "copiarla, tendrás que crear una nueva."

        );
        console.error("");
        console.error("   Error original:", error);
        console.error("");

        process.exit(1);

    }

    console.log("");

}

async function migrateGame(

    gameId: string,

    fileSystem: IFileSystem,

    storage: IFileStorage,

    writer: PostgresKnowledgeWriter

): Promise<{ skippedReason?: string }> {

    const root =
        path.resolve("games", gameId);

    const metadataPath =
        path.join(root, "metadata.json");

    const knowledgePath =
        path.join(root, "generated", "knowledge.json");

    if (!(await fileSystem.exists(metadataPath))) {

        return { skippedReason: "no tiene metadata.json" };

    }

    if (!(await fileSystem.exists(knowledgePath))) {

        return {

            skippedReason:

                "no tiene generated/knowledge.json — este juego nunca " +
                `se importó del todo. Usa "npm run import ${gameId}" ` +
                "en su lugar (eso sí gastará cuota de IA, al no haber " +
                "ningún embedding previo que reutilizar)."

        };

    }

    const metadata =
        await fileSystem.readJson<GameMetadata>(metadataPath);

    const knowledge =
        await fileSystem.readJson<LegacyKnowledgeIndex>(knowledgePath);

    // Compatibilidad con el formato anterior a multi-documento:
    // si no hay `documents`, se asume un único "rulebook.pdf"
    // implícito — el comportamiento que tenía la app antes de
    // que existiera el concepto de varios documentos por juego.
    const documents =

        knowledge.documents && knowledge.documents.length > 0

            ? knowledge.documents

            : [DEFAULT_DOCUMENT];

    const usedLegacyFormat =
        !knowledge.documents || knowledge.documents.length === 0;

    if (usedLegacyFormat) {

        console.log(

            "   (formato anterior a multi-documento — se asume un " +
            "único documento \"rulebook.pdf\")"

        );

    }

    console.log(

        `   ${documents.length} documento(s), ` +
        `${knowledge.chunks.length} fragmentos con embedding`

    );

    const documentsToWrite: {

        id: string;

        name: string;

        storagePath: string;

    }[] = [];

    for (const document of documents) {

        const documentPath =
            path.join(root, "source", document.filename);

        if (!(await fileSystem.exists(documentPath))) {

            console.warn(

                `   ⚠ ${document.filename} no está en disco — se omite ` +
                "este documento (sus fragmentos tampoco se migrarán)."

            );

            continue;

        }

        const content =
            await fileSystem.readBuffer(documentPath);

        const storagePath =
            `${gameId}/source/${document.filename}`;

        await storage.upload(storagePath, content, "application/pdf");

        documentsToWrite.push({

            id: document.id,

            name: document.name,

            storagePath

        });

    }

    const coverLocalPath =
        path.join(root, "assets", "cover.png");

    let coverPath: string | undefined;

    if (await fileSystem.exists(coverLocalPath)) {

        const content =
            await fileSystem.readBuffer(coverLocalPath);

        coverPath = `${gameId}/assets/cover.png`;

        await storage.upload(coverPath, content, "image/png");

    }

    await writer.upsertGame(metadata, coverPath);

    for (const document of documentsToWrite) {

        await writer.upsertDocument(gameId, document);

    }

    const migratableDocumentIds =
        new Set(documentsToWrite.map(document => document.id));

    // Los chunks del formato antiguo no tienen documentId — se
    // asignan al documento por defecto ("rulebook"), igual que
    // se asumió al leer `documents` más arriba.
    const chunksToWrite: EmbeddedChunk[] =

        knowledge.chunks

            .map(chunk => ({

                ...chunk,

                documentId: chunk.documentId ?? "rulebook"

            }))

            .filter(

                chunk =>

                    migratableDocumentIds.has(chunk.documentId)

            );

    await writer.replaceChunks(gameId, chunksToWrite);

    return {};

}

async function main() {

    const gameArgument =

        process.argv

            .find(arg => arg.startsWith("--game="))

            ?.split("=")[1];

    const gamesRoot =
        path.resolve("games");

    const fileSystem =
        new NodeFileSystem();

    if (!(await fileSystem.exists(gamesRoot))) {

        console.error("");
        console.error(`No se ha encontrado la carpeta games/ en ${gamesRoot}.`);
        console.error(

            "Este script espera la carpeta que guardaste localmente " +
            "antes de sacarla de git — colócala en la raíz del " +
            "backend antes de ejecutar la migración."

        );
        console.error("");

        process.exit(1);

    }

    const allGameIds =
        await fileSystem.listDirectories(gamesRoot);

    const gameIds =
        gameArgument ? [gameArgument] : allGameIds;

    const pool =
        createPool(loadDatabaseConfiguration());

    const storage =
        new B2FileStorage(loadStorageConfiguration());

    const writer =
        new PostgresKnowledgeWriter(pool);

    await preflightCheck(pool, storage);

    console.log(`Migrando ${gameIds.length} juego(s) a Postgres + B2...`);
    console.log("");

    const result: MigrationResult = {

        migrated: [],

        skipped: [],

        failed: []

    };

    for (const gameId of gameIds) {

        console.log(`→ ${gameId}`);

        try {

            const { skippedReason } =
                await migrateGame(gameId, fileSystem, storage, writer);

            if (skippedReason) {

                console.log(`   omitido: ${skippedReason}`);

                result.skipped.push({ gameId, reason: skippedReason });

            }
            else {

                console.log("   ✔ migrado");

                result.migrated.push(gameId);

            }

        }
        catch (error) {

            const message =
                error instanceof Error ? error.message : String(error);

            const stack =
                error instanceof Error ? error.stack : undefined;

            console.error(`   ✘ fallo: ${message}`);

            if (stack) {

                console.error(stack);

            }

            result.failed.push({ gameId, error: message, stack });

        }

        console.log("");

    }

    await pool.end();

    console.log("======================================");
    console.log(`Migrados:  ${result.migrated.length}`);
    console.log(`Omitidos:  ${result.skipped.length}`);
    console.log(`Fallidos:  ${result.failed.length}`);
    console.log("======================================");

    if (result.failed.length > 0) {

        console.log("");
        console.log(

            "Juegos con fallo (puedes reintentar solo esos con " +
            "--game=<id>):"

        );

        for (const failure of result.failed) {

            console.log(`  - ${failure.gameId}: ${failure.error}`);

        }

    }

    process.exit(result.failed.length > 0 ? 1 : 0);

}

main().catch(error => {

    console.error("");
    console.error("Error inesperado durante la migración:");
    console.error(error);
    console.error("");

    process.exit(1);

});
