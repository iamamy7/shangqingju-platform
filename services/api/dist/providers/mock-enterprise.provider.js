"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockEnterpriseProvider = void 0;
const common_1 = require("@nestjs/common");
let MockEnterpriseProvider = class MockEnterpriseProvider {
    mode = "MOCK";
    async execute(request) {
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
        const body = (await response.json());
        return {
            dataState: body.dataState || "AVAILABLE",
            sourceUpdatedAt: body.sourceUpdatedAt,
            data: body.data ?? null,
            error: body.error ?? null,
            providerCode: "MOCK_PROVIDER"
        };
    }
};
exports.MockEnterpriseProvider = MockEnterpriseProvider;
exports.MockEnterpriseProvider = MockEnterpriseProvider = __decorate([
    (0, common_1.Injectable)()
], MockEnterpriseProvider);
