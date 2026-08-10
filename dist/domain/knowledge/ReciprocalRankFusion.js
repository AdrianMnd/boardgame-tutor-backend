"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReciprocalRankFusion = void 0;
class ReciprocalRankFusion {
    k;
    limit;
    constructor(k = 60, limit = 5) {
        this.k = k;
        this.limit = limit;
    }
    fuse(...lists) {
        const map = new Map();
        const scores = new Map();
        for (const list of lists) {
            list.forEach((chunk, index) => {
                const score = 1 / (this.k +
                    index +
                    1);
                map.set(chunk.id, chunk);
                scores.set(chunk.id, (scores.get(chunk.id) ??
                    0) + score);
            });
        }
        return [...map.values()]
            .sort((a, b) => (scores.get(b.id)) -
            (scores.get(a.id))).slice(0, this.limit);
    }
}
exports.ReciprocalRankFusion = ReciprocalRankFusion;
