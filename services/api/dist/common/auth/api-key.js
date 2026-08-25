"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_KEY_HEADER = void 0;
exports.readApiKey = readApiKey;
exports.API_KEY_HEADER = "x-api-key";
function readApiKey(headers) {
    const value = headers[exports.API_KEY_HEADER];
    if (Array.isArray(value))
        return value[0]?.trim() || null;
    return value?.trim() || null;
}
