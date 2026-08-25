export type DataState =
  | "AVAILABLE"
  | "NO_RECORD"
  | "NO_COVERAGE"
  | "PROVIDER_ERROR"
  | "SYSTEM_ERROR";

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ProviderMeta {
  mode: "MOCK" | "LIVE";
  code: string;
}

export interface SqjApiResponse<T> {
  requestId: string;
  traceId: string;
  queriedAt: string;
  dataState: DataState;
  sourceUpdatedAt?: string;
  cacheHit: boolean;
  billable: boolean;
  chargedAmount: string;
  currency: "CNY";
  provider: ProviderMeta;
  data: T | null;
  error: ApiError | null;
}

export interface ApiProduct {
  operationId: string;
  categoryCode: string;
  nameZh: string;
  nameEn: string;
  method: "GET" | "POST";
  path: string;
  unitPrice: string;
  currency: "CNY";
  billingRule: "SUCCESS_ONLY";
  enabled: boolean;
}

export interface ChargeDecision {
  billable: boolean;
  amount: string;
  currency: "CNY";
  reason: "SUCCESS" | "NO_RECORD" | "PROVIDER_ERROR" | "SYSTEM_ERROR";
}

export interface ProviderRequest<TInput = unknown> {
  operationId: string;
  input: TInput;
  requestId: string;
  traceId: string;
}

export interface ProviderResult<TData = unknown> {
  dataState: DataState;
  sourceUpdatedAt?: string;
  data: TData | null;
  error: ApiError | null;
  providerCode: string;
}

export interface EnterpriseDataProvider {
  readonly mode: "MOCK" | "LIVE";
  execute<TInput, TData>(request: ProviderRequest<TInput>): Promise<ProviderResult<TData>>;
}

