"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOCAL_EMBEDDING = void 0;
exports.LOCAL_EMBEDDING = {
    enabled: (process.env.LOCAL_EMBEDDING_ENABLED ?? "")
        .trim()
        .toLowerCase() === "true",
    model: process.env.LOCAL_EMBEDDING_MODEL
        ?? "Xenova/paraphrase-multilingual-MiniLM-L12-v2"
};
