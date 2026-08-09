export interface RetryOptions {

    retries?: number;

    delays?: number[];

    /**
     * Si devuelve false, se deja de reintentar inmediatamente
     * y se propaga el error (útil para errores de cuota, donde
     * insistir contra el mismo proveedor es inútil).
     * Por defecto siempre reintenta.
     */
    shouldRetry?: (error: unknown) => boolean;

}

export async function retry<T>(

    operation: () => Promise<T>,

    options: RetryOptions = {}

): Promise<T> {

    const {

        retries = 4,

        delays = [0, 1000, 2000, 4000],

        shouldRetry = () => true

    } = options;

    let lastError: unknown;

    for (let attempt = 0; attempt < retries; attempt++) {

        try {

            return await operation();

        }
        catch (error) {

            lastError = error;

            if (

                attempt === retries - 1 ||
                !shouldRetry(error)

            ) {

                break;

            }

            const delay = delays[attempt + 1] ?? 4000;

            await sleep(delay);

        }

    }

    throw lastError;

}

function sleep(ms: number): Promise<void> {

    return new Promise(

        resolve => setTimeout(resolve, ms)

    );

}
