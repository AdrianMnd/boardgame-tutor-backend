export async function retry<T>(

    operation: () => Promise<T>,

    retries = 4,

    delays = [0, 1000, 2000, 4000]

): Promise<T> {

    let lastError: unknown;

    for (let attempt = 0; attempt < retries; attempt++) {

        try {

            return await operation();

        }

        catch (error) {

            lastError = error;

            if (attempt === retries - 1) {

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