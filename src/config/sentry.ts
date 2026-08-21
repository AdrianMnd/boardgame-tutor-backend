import * as Sentry from "@sentry/node";

/**
 * Monitorización de errores en producción — opcional del todo.
 * Sin SENTRY_DSN configurada, esta función no hace nada y la
 * aplicación funciona exactamente igual que sin Sentry instalado.
 *
 * Se llama ANTES de crear la app de Express (así Sentry puede
 * capturar errores incluso durante el propio arranque), y
 * `getSentryErrorHandler()` se monta como middleware justo
 * antes del manejador de errores propio de la app, para que
 * Sentry vea el error primero y luego la respuesta JSON al
 * cliente siga funcionando exactamente igual que hasta ahora.
 */
export function initSentry(): void {

    const dsn = process.env.SENTRY_DSN;

    if (!dsn) {

        return;

    }

    Sentry.init({

        dsn,

        environment: process.env.NODE_ENV ?? "development",

        // Trazas de rendimiento desactivadas a propósito — con
        // el volumen de esta app, el valor real está en saber
        // que algo se ha roto, no en perfilar cada petición.
        // Se puede activar más adelante sin más cambios que
        // esta línea, si hiciera falta.
        tracesSampleRate: 0

    });

}

export function attachSentryErrorHandler(

    app: { use: (middleware: unknown) => unknown }

): void {

    if (!isSentryEnabled()) {

        return;

    }

    Sentry.setupExpressErrorHandler(app);

}

export function isSentryEnabled(): boolean {

    return Boolean(process.env.SENTRY_DSN);

}
