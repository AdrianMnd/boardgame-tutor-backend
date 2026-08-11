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
            // Si el checkpoint tiene chunks con dimensiones
            // distintas entre sí (de una ejecución anterior que
            // cambió de proveedor a mitad), solo se conserva el
            // grupo mayoritario — los demás se descartan para
            // que se regeneren con el proveedor que se use en
            // esta ejecución, y así el resultado final nunca
            // queda con dimensiones mezcladas.
            const dominant = this.dominantDimension(saved);
            for (const chunk of saved) {
                if (chunk.embedding.length === dominant) {
                    map.set(chunk.id, chunk);
                }
            }
            if (map.size < saved.length) {
                console.warn(`[Checkpoint] Se han descartado ${saved.length - map.size} ` +
                    `chunks guardados con una dimensión de embedding distinta ` +
                    `a la mayoritaria — se regenerarán con el proveedor actual ` +
                    `para no mezclar dimensiones dentro del mismo juego.`);
            }
        }
        catch {
            // Checkpoint corrupto o ilegible: se ignora y se
            // empieza de cero en lugar de romper la importación.
        }
        return map;
    }
    dominantDimension(chunks) {
        const counts = new Map();
        for (const chunk of chunks) {
            const dimension = chunk.embedding.length;
            counts.set(dimension, (counts.get(dimension) ?? 0) + 1);
        }
        let best = 0;
        let bestCount = -1;
        for (const [dimension, count] of counts) {
            if (count > bestCount) {
                best = dimension;
                bestCount = count;
            }
        }
        return best;
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
