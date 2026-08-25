import { Injectable } from "@nestjs/common";
import type {
  EnterpriseDataProvider,
  ProviderRequest,
  ProviderResult
} from "@sqj/contracts";

@Injectable()
export class MockEnterpriseProvider implements EnterpriseDataProvider {
  readonly mode = "MOCK" as const;

  async execute<TInput, TData>(request: ProviderRequest<TInput>): Promise<ProviderResult<TData>> {
    const response = await fetch(`${process.env.UPSTREAM_BASE_URL}/v1/operations/${request.operationId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.UPSTREAM_API_KEY || "mock-client-key",
        "X-Request-Id": request.requestId
      },
      body: JSON.stringify(request.input)
    });

    if (!response.ok) {
      return {
        dataState: "PROVIDER_ERROR",
        data: null,
        error: { code: "UPSTREAM_HTTP_ERROR", message: `Mock provider returned ${response.status}` },
        providerCode: "MOCK_PROVIDER"
      };
    }

    const body = (await response.json()) as { dataState?: ProviderResult<TData>["dataState"]; data?: TData; error?: ProviderResult<TData>["error"]; sourceUpdatedAt?: string };
    return {
      dataState: body.dataState || "AVAILABLE",
      sourceUpdatedAt: body.sourceUpdatedAt,
      data: body.data ?? null,
      error: body.error ?? null,
      providerCode: "MOCK_PROVIDER"
    };
  }
}

