"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HybridRetriever = void 0;
const ReciprocalRankFusion_1 = require("./ReciprocalRankFusion");
class HybridRetriever {
    semanticRetriever;
    keywordRetriever;
    fusion = new ReciprocalRankFusion_1.ReciprocalRankFusion();
    constructor(semanticRetriever, keywordRetriever) {
        this.semanticRetriever = semanticRetriever;
        this.keywordRetriever = keywordRetriever;
    }
    async retrieve(game, question, embedding) {
        const semantic = await this.semanticRetriever.retrieve(game, question, embedding);
        const keyword = await this.keywordRetriever.retrieve(game, question, embedding);
        return this.fusion.fuse(semantic, keyword);
    }
}
exports.HybridRetriever = HybridRetriever;
