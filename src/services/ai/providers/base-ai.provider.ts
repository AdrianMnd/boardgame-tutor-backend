import type { AIResponse } from "../../../types/ai/AIResponse";

export abstract class BaseAIProvider {

    protected getEnv(name: string): string {

        const value = process.env[name];

        if (!value) {
            throw new Error(`La variable ${name} no está definida.`);
        }

        return value;

    }

    protected getOptionalEnv(
        name: string,
        defaultValue: string
    ): string {

        return process.env[name] ?? defaultValue;

    }

    protected async measure<T>(
        operation: () => Promise<T>
    ): Promise<{
        result: T;
        durationMs: number;
    }> {

        const start = performance.now();

        const result = await operation();

        return {

            result,

            durationMs: Math.round(
                performance.now() - start
            )

        };

    }

}