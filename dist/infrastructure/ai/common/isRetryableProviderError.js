"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRetryableProviderError = isRetryableProviderError;
/**
 * Detecta si un error de un proveedor de IA corresponde a una
 * cuota agotada, límite de peticiones, o el proveedor estando
 * temporalmente no disponible — casos en los que tiene sentido
 * probar con el siguiente proveedor de la cadena de fallback.
 *
 * Deliberadamente NO se usa para errores de programación
 * (parámetros inválidos, JSON malformado, etc.), que deben
 * propagarse tal cual para no ocultar bugs reales.
 */
function isRetryableProviderError(error) {
    const status = extractStatus(error);
    if (status === 429 ||
        status === 402 ||
        status === 503) {
        return true;
    }
    const message = extractMessage(error)
        .toLowerCase();
    return (message.includes("quota") ||
        message.includes("resource_exhausted") ||
        message.includes("rate limit") ||
        message.includes("rate_limit") ||
        message.includes("too many requests") ||
        message.includes("insufficient_quota") ||
        message.includes("429") ||
        message.includes("overloaded") ||
        message.includes("temporarily unavailable"));
}
function extractStatus(error) {
    if (typeof error !== "object" ||
        error === null) {
        return undefined;
    }
    const candidate = error;
    const raw = candidate.status
        ?? candidate.response?.status
        ?? candidate.code
        ?? candidate.error?.code;
    const parsed = typeof raw === "string"
        ? Number(raw)
        : raw;
    return Number.isFinite(parsed)
        ? parsed
        : undefined;
}
function extractMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === "string") {
        return error;
    }
    try {
        return JSON.stringify(error);
    }
    catch {
        return String(error);
    }
}
