"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileGameRepository = void 0;
const node_path_1 = __importDefault(require("node:path"));
class FileGameRepository {
    fileSystem;
    constructor(fileSystem) {
        this.fileSystem = fileSystem;
    }
    async list() {
        const directories = await this.fileSystem.listDirectories(node_path_1.default.resolve("games"));
        const games = [];
        for (const directory of directories) {
            const game = await this.findById(directory);
            if (game) {
                games.push(game);
            }
        }
        return games;
    }
    async findById(gameId) {
        const root = node_path_1.default.resolve("games", gameId);
        const metadataPath = node_path_1.default.join(root, "metadata.json");
        console.log("ROOT:", root);
        console.log("METADATA:", metadataPath);
        const exists = await this.fileSystem.exists(metadataPath);
        console.log("EXISTS:", exists);
        if (!exists) {
            return null;
        }
        const metadata = await this.fileSystem.readJson(metadataPath);
        return {
            metadata,
            paths: {
                root,
                metadata: metadataPath,
                source: node_path_1.default.join(root, "source"),
                rulebook: node_path_1.default.join(root, "source", "rulebook.pdf"),
                generated: node_path_1.default.join(root, "generated"),
                chunks: node_path_1.default.join(root, "generated", "chunks.json"),
                knowledge: node_path_1.default.join(root, "generated", "knowledge.json"),
                assets: node_path_1.default.join(root, "assets")
            }
        };
    }
}
exports.FileGameRepository = FileGameRepository;
