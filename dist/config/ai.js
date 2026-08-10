"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI_CONFIGURATION = void 0;
const ALL_PROVIDERS = [
    "local",
    "gemini",
    "openrouter",
    "mistral",
    "openai",
    "deepinfra",
    "together"
];
function parseProviderOrder(raw) {
    if (raw) {
        const parsed = raw
            .split(",")
            .map(value => value.trim().toLowerCase())
            .filter((value) => ALL_PROVIDERS.includes(value));
        if (parsed.length > 0) {
            return parsed;
        }
    }
    // Sin AI_PROVIDER_ORDER explícito: "local" siempre va primero
    // (es gratis e ilimitado, conviene intentarlo antes que
    // nada), luego se respeta el AI_PROVIDER legado, y se añaden
    // el resto de proveedores como red de seguridad ante fallos
    // de cuota.
    const legacy = (process.env.AI_PROVIDER ?? "gemini")
        .trim()
        .toLowerCase();
    const primary = ALL_PROVIDERS.includes(legacy)
        ? legacy
        : "gemini";
    const order = [
        "local",
        primary,
        ...ALL_PROVIDERS
    ];
    return order.filter((provider, index) => order.indexOf(provider) === index);
}
exports.AI_CONFIGURATION = {
    // Se mantiene por compatibilidad / logging.
    provider: process.env.AI_PROVIDER
        ?? "gemini",
    /**
     * Orden en el que se prueban los proveedores de IA.
     * Ante un error de cuota agotada o rate-limit, se pasa
     * automáticamente al siguiente de la lista.
     *
     * Se puede forzar explícitamente con la variable de entorno
     * AI_PROVIDER_ORDER (ej. "openrouter,gemini,mistral").
     * Por defecto: [AI_PROVIDER, ...resto de proveedores].
     */
    providerOrder: parseProviderOrder(process.env.AI_PROVIDER_ORDER)
};
