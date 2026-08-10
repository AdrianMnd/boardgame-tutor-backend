"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingCheckpoint = void 0;
/**
 * Guarda el progreso de la generación de embeddings en disco
 * para que, si la importación falla a mitad de camino (por
 * ejemplo, porque se agota la cuota de todos los proveedores
 * de IA configurados), la siguiente ejecución de
 * `npm run import <gameId>` pueda retomar donde se quedó en
 * vez de volver a generar embeddings ya conseguidos —
 * evitando gastar cuota dos veces por el mismo chunk.
 *
 * El checkpoint se identifica por `chunk.id`, que es estable
 * entre ejecuciones mientras no cambie el PDF de origen ni la
 * configuración de chunking (tamaño/solape).
 */
class EmbeddingCheckpoint {
    fileSystem;
    path;
    constructor(fileSystem, path) {
        this.fileSystem = fileSystem;
        this.path = path;
    }
    async load() {
        const map = new Map();
        if (!(await this.fileSystem.exists(this.path))) {
            return map;
        }
        try {
            const saved = await this.fileSystem.readJson(this.path);
            for (const chunk of saved) {
                map.set(chunk.id, chunk);
            }
        }
        catch {
            // Checkpoint corrupto o ilegible: se ignora y se
            // empieza de cero en lugar de romper la importación.
        }
        return map;
    }
    async save(chunks) {
        await this.fileSystem.writeJson(this.path, chunks);
    }
    async clear() {
        if (await this.fileSystem.exists(this.path)) {
            await this.fileSystem.delete(this.path);
        }
    }
}
exports.EmbeddingCheckpoint = EmbeddingCheckpoint;
