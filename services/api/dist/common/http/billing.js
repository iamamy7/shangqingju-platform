"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decideCharge = decideCharge;
function decideCharge(dataState, unitPrice) {
    if (dataState === "AVAILABLE") {
        return { billable: true, amount: unitPrice, currency: "CNY", reason: "SUCCESS" };
    }
    const reason = dataState === "NO_RECORD" || dataState === "NO_COVERAGE"
        ? "NO_RECORD"
        : dataState === "PROVIDER_ERROR"
            ? "PROVIDER_ERROR"
            : "SYSTEM_ERROR";
    return { billable: false, amount: "0.00", currency: "CNY", reason };
}
