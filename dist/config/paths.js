"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PATHS = void 0;
const path_1 = __importDefault(require("path"));
const ROOT = process.cwd();
exports.PATHS = {
    ROOT,
    KNOWLEDGE: path_1.default.join(ROOT, "knowledge"),
    GAMES: path_1.default.join(ROOT, "knowledge", "games")
};
