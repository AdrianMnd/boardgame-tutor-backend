"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryPolicy = void 0;
class RetryPolicy {
    maxRetries;
    initialDelay;
    onRetry;
    constructor(maxRetries = 3, initialDelay = 1000, onRetry) {
        this.maxRetries = maxRetries;
        this.initialDelay = initialDelay;
        this.onRetry = onRetry;
    }
    async execute(action) {
        let attempt = 0;
        while (true) {
            try {
                return await action();
            }
            catch (error) {
                attempt++;
                if (attempt > this.maxRetries ||
                    !this.isRetryable(error)) {
                    throw error;
                }
                const delay = this.initialDelay *
                    Math.pow(2, attempt - 1);
                this.onRetry?.(attempt, delay, error);
                await this.sleep(delay);
            }
        }
    }
    isRetryable(error) {
        const status = error?.status ??
            error?.code;
        return [
            429,
            500,
            502,
            503,
            504
        ].includes(status);
    }
    sleep(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }
}
exports.RetryPolicy = RetryPolicy;
