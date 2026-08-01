export class RetryPolicy {

    constructor(

    private readonly maxRetries = 3,

    private readonly initialDelay = 1000,

    private readonly onRetry?:

        (

            attempt: number,

            delay: number,

            error: unknown

        ) => void

) {}

    async execute<T>(

        action: () => Promise<T>

    ): Promise<T> {

        let attempt = 0;

        while (true) {

            try {

                return await action();

            } catch (error: any) {

                attempt++;

                if (

                    attempt > this.maxRetries ||

                    !this.isRetryable(error)

                ) {

                    throw error;

                }

                const delay =

                    this.initialDelay *

                    Math.pow(2, attempt - 1);

                this.onRetry?.(

                    attempt,

                    delay,

                    error

                );

                await this.sleep(delay);

            }

        }

    }

    private isRetryable(

        error: any

    ): boolean {

        const status =

            error?.status ??

            error?.code;

        return [

            429,

            500,

            502,

            503,

            504

        ].includes(status);

    }

    private sleep(

        milliseconds: number

    ): Promise<void> {

        return new Promise(

            resolve =>

                setTimeout(

                    resolve,

                    milliseconds

                )

        );

    }

}