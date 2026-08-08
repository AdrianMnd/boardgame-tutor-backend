const ALL_PROVIDERS = [

    "gemini",

    "openrouter",

    "mistral"

] as const;

export type AIProviderName = typeof ALL_PROVIDERS[number];

function parseProviderOrder(

    raw: string | undefined

): AIProviderName[] {

    if (raw) {

        const parsed =

            raw

                .split(",")

                .map(value => value.trim().toLowerCase())

                .filter(

                    (value): value is AIProviderName =>

                        (ALL_PROVIDERS as readonly string[]).includes(value)

                );

        if (parsed.length > 0) {

            return parsed;

        }

    }

    // Sin AI_PROVIDER_ORDER explícito: se respeta el AI_PROVIDER
    // legado como primero de la cadena, y se añaden el resto de
    // proveedores como red de seguridad ante fallos de cuota.
    const legacy =

        (process.env.AI_PROVIDER ?? "gemini")
            .trim()
            .toLowerCase() as AIProviderName;

    const primary =

        (ALL_PROVIDERS as readonly string[]).includes(legacy)
            ? legacy
            : "gemini";

    return [

        primary,

        ...ALL_PROVIDERS.filter(

            provider => provider !== primary

        )

    ];

}

export const AI_CONFIGURATION = {

    // Se mantiene por compatibilidad / logging.
    provider:

        process.env.AI_PROVIDER
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
    providerOrder:

        parseProviderOrder(
            process.env.AI_PROVIDER_ORDER
        )

} as const;
