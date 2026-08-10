"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleOutputSuppressor = void 0;
class ConsoleOutputSuppressor {
    static ignoredMessages = [
        "Setting up fake worker",
        "Warning: TODO:",
        "Warning: Ignoring",
        "Warning: Unknown",
        "Warning: to be implemented:"
    ];
    static async run(action) {
        const originalWrite = process.stderr.write.bind(process.stderr);
        process.stderr.write =
            (chunk, encoding, callback) => {
                const message = String(chunk);
                const ignored = this.ignoredMessages.some(warning => message.includes(warning));
                if (!ignored) {
                    originalWrite(chunk, encoding, callback);
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
exports.ConsoleOutputSuppressor = ConsoleOutputSuppressor;
