"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = void 0;
const ApiError_1 = require("./ApiError");
class NotFoundError extends ApiError_1.ApiError {
    constructor(message) {
        super(404, "NOT_FOUND", message);
    }
}
exports.NotFoundError = NotFoundError;
