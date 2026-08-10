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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalEmbeddingClient = void 0;
/**
 * Genera embeddings ejecutando un modelo localmente (ONNX, vía
 * @huggingface/transformers), sin llamar a ningún servicio
 * externo. Gratis, sin límite de peticiones, sin cuota.
 *
 * Pensado sobre todo para el comando `npm run import`, que es
 * el que dispara cientos de peticiones de golpe y por eso
 * agota la cuota gratuita de los proveedores en la nube. Al
 * no depender de red, funciona igual en local que en un
 * servidor desplegado con el proceso siempre activo (ej. Render).
 *
 * El modelo se descarga la primera vez que se usa (unos 90MB
 * para el modelo por defecto) y se cachea en disco; a partir de
 * ahí no hace falta red para generar más embeddings.
 *
 * No genera texto/chat — solo embeddings. `supportsChat` se
 * declara en `false` para que FallbackLLMClient nunca lo
 * intente para responder preguntas.
 */
class LocalEmbeddingClient {
    configuration;
    supportsEmbeddings = true;
    supportsChat = false;
    // Se inicializa una sola vez y se reutiliza entre llamadas
    // (cargar el modelo tiene un coste que no queremos pagar
    // en cada embedding).
    pipelinePromise = null;
    constructor(configuration) {
        this.configuration = configuration;
    }
    async getPipeline() {
        if (!this.pipelinePromise) {
            this.pipelinePromise =
                Promise.resolve().then(() => __importStar(require("@huggingface/transformers"))).then(({ pipeline }) => pipeline("feature-extraction", this.configuration.model));
        }
        return this.pipelinePromise;
    }
    async generateEmbedding(text) {
        const extractor = await this.getPipeline();
        const output = await extractor(text, {
            pooling: "mean",
            normalize: true
        });
        return Array.from(output.data);
    }
    async generateText(_prompt) {
        throw new Error("El modelo local solo genera embeddings, no texto/chat.");
    }
    async generateChat(_messages) {
        throw new Error("El modelo local solo genera embeddings, no texto/chat.");
    }
}
exports.LocalEmbeddingClient = LocalEmbeddingClient;
