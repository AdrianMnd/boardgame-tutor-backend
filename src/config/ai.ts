const ALL_PROVIDERS = [

    "local",

    "gemini",

    "openrouter",

    "mistral",

    "openai",

    "deepinfra",

    "together"

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

    // Sin AI_PROVIDER_ORDER explícito: "local" siempre va primero
    // (es gratis e ilimitado, conviene intentarlo antes que
    // nada), luego se respeta el AI_PROVIDER legado, y se añaden
    // el resto de proveedores como red de seguridad ante fallos
    // de cuota.
    const legacy =

        (process.env.AI_PROVIDER ?? "gemini")
            .trim()
            .toLowerCase() as AIProviderName;

    const primary =

        (ALL_PROVIDERS as readonly string[]).includes(legacy)
            ? legacy
            : "gemini";

    const order = [

        "local",

        primary,

        ...ALL_PROVIDERS

    ] as AIProviderName[];

    return order.filter(

        (provider, index) =>

            order.indexOf(provider) === index

    );

}

export const AI_CONFIGURATION = {

    // Se mantiene por compatibilidad / logging.
    provider:

        process.env.AI_PROVIDER
        ?? "gemini",

    /**
     * Orden en el que se prueban los proveedores de IA para
     * CHAT (responder preguntas, reordenar/recortar contexto).
     * Ante un error de cuota agotada o rate-limit, se pasa
     * automáticamente al siguiente de la lista. Aquí SÍ es
     * seguro usar varios proveedores intercambiables, porque
     * cada respuesta de chat es independiente — no se guarda ni
     * se compara contra nada.
     *
     * Se puede forzar explícitamente con la variable de entorno
     * AI_PROVIDER_ORDER (ej. "openrouter,gemini,mistral").
     * Por defecto: [AI_PROVIDER, ...resto de proveedores].
     */
    providerOrder:

        parseProviderOrder(
            process.env.AI_PROVIDER_ORDER
        ),

    /**
     * Proveedor ÚNICO para generar EMBEDDINGS — tanto al
     * importar un juego (npm run import) como al responder
     * preguntas en vivo. A diferencia del chat, aquí NUNCA debe
     * haber fallback entre varios proveedores: cada proveedor
     * genera vectores en un espacio distinto, así que mezclar
     * embeddings de proveedores distintos rompe la búsqueda por
     * similitud (produce errores 500 impredecibles).
     *
     * Debe tener EXACTAMENTE el mismo valor en todos los sitios
     * donde importes juegos o sirvas preguntas en producción
     * (tu máquina local Y el servidor desplegado) — si no,
     * los juegos importados en un sitio no funcionarán en el
     * otro.
     *
     * Sin valor por defecto a propósito: es mejor que falle
     * alto y claro al arrancar si falta, que arriesgarse a que
     * "adivine" un proveedor distinto en cada entorno.
     */
    embeddingProvider:

        (process.env.AI_EMBEDDING_PROVIDER ?? "")
            .trim()
            .toLowerCase() as AIProviderName

} as const;
