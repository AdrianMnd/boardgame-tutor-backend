export class ConsoleOutputSuppressor {

    private static readonly ignoredMessages = [

        "Setting up fake worker",

        "Warning: TODO:",

        "Warning: Ignoring",

        "Warning: Unknown",

        "Warning: to be implemented:"

    ];

    static async run<T>(
        action: () => Promise<T>
    ): Promise<T> {

        const originalWrite =
            process.stderr.write.bind(process.stderr);

        process.stderr.write =
            (
                chunk: any,
                encoding?: any,
                callback?: any
            ): boolean => {

                const message =
                    String(chunk);

                const ignored =
                    this.ignoredMessages.some(

                        warning =>
                            message.includes(warning)

                    );

                if (!ignored) {

                    originalWrite(

                        chunk,

                        encoding,

                        callback

                    );

                }

                return true;

            };

        try {

            return await action();

        }

        finally {

            process.stderr.write =
                originalWrite;

        }

    }

}