"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeFileSystem = void 0;
const promises_1 = __importStar(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
class NodeFileSystem {
    async exists(filePath) {
        try {
            await promises_1.default.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    async stat(path) {
        const info = await (0, promises_1.stat)(path);
        return {
            size: info.size
        };
    }
    async readText(filePath) {
        return promises_1.default.readFile(filePath, "utf8");
    }
    async writeText(filePath, content) {
        await promises_1.default.mkdir(node_path_1.default.dirname(filePath), {
            recursive: true
        });
        await promises_1.default.writeFile(filePath, content, "utf8");
    }
    async readJson(filePath) {
        const content = await this.readText(filePath);
        return JSON.parse(content);
    }
    async writeJson(filePath, value) {
        await this.writeText(filePath, JSON.stringify(value, null, 2));
    }
    async ensureDirectory(directory) {
        await promises_1.default.mkdir(directory, {
            recursive: true
        });
    }
    async listDirectories(directory) {
        const entries = await promises_1.default.readdir(directory, {
            withFileTypes: true
        });
        return entries
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name);
    }
    async listFiles(directory) {
        const entries = await promises_1.default.readdir(directory, {
            withFileTypes: true
        });
        return entries
            .filter(entry => entry.isFile())
            .map(entry => entry.name);
    }
    async delete(filePath) {
        await promises_1.default.rm(filePath, {
            recursive: true,
            force: true
        });
    }
}
exports.NodeFileSystem = NodeFileSystem;
