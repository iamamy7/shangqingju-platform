import type { ChargeDecision, DataState } from "@sqj/contracts";

export function decideCharge(dataState: DataState, unitPrice: string): ChargeDecision {
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

