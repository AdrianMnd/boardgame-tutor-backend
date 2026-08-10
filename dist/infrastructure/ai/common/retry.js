"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retry = retry;
async function retry(operation, options = {}) {
    const { retries = 4, delays = [0, 1000, 2000, 4000], shouldRetry = () => true } = options;
    let lastError;
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error;
            if (attempt === retries - 1 ||
                !shouldRetry(error)) {
                break;
            }
            const delay = delays[attempt + 1] ?? 4000;
            await sleep(delay);
        }
    }
    throw lastError;
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
