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
export function isRetryableProviderError(

    error: unknown

): boolean {

    const status =
        extractStatus(error);

    if (

        status === 429 ||
        status === 402 ||
        status === 503

    ) {

        return true;

    }

    const message =
        extractMessage(error)
            .toLowerCase();

    return (

        message.includes("quota") ||
        message.includes("resource_exhausted") ||
        message.includes("rate limit") ||
        message.includes("rate_limit") ||
        message.includes("too many requests") ||
        message.includes("insufficient_quota") ||
        message.includes("429") ||
        message.includes("overloaded") ||
        message.includes("temporarily unavailable")

    );

}

function extractStatus(

    error: unknown

): number | undefined {

    if (

        typeof error !== "object" ||
        error === null

    ) {

        return undefined;

    }

    const candidate = error as {

        status?: number;

        code?: number | string;

        response?: { status?: number };

        error?: { code?: number | string };

    };

    const raw =

        candidate.status
        ?? candidate.response?.status
        ?? candidate.code
        ?? candidate.error?.code;

    const parsed =
        typeof raw === "string"
            ? Number(raw)
            : raw;

    return Number.isFinite(parsed)
        ? (parsed as number)
        : undefined;

}

function extractMessage(

    error: unknown

): string {

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
