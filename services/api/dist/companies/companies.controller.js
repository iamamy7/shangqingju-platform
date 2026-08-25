"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompaniesController = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const company_fixture_service_1 = require("./company-fixture.service");
let CompaniesController = class CompaniesController {
    fixtures;
    constructor(fixtures) {
        this.fixtures = fixtures;
    }
    search(body) {
        const candidates = this.fixtures.search(body.name || "", body.countryIso2, body.limit || 10);
        return this.response(candidates.length ? "AVAILABLE" : "NO_RECORD", { candidates, total: candidates.length });
    }
    searchGet(query = "", country) {
        const candidates = this.fixtures.search(query, country, 10);
        return this.response(candidates.length ? "AVAILABLE" : "NO_RECORD", { candidates, total: candidates.length });
    }
    detail(id) {
        return this.response("AVAILABLE", this.fixtures.getCompany(id));
    }
    module(id, moduleCode) {
        const result = this.fixtures.getModule(id, moduleCode.toUpperCase());
        return this.response(result.dataState || "NO_RECORD", result.data ?? null);
    }
    count() {
        return { total: this.fixtures.count(), classification: "SQJ_GENERATED_TEST_DATABASE" };
    }
    response(dataState, data) {
        const requestId = (0, node_crypto_1.randomUUID)();
        return {
            requestId,
            traceId: `trace_${requestId}`,
            queriedAt: new Date().toISOString(),
            dataState,
            cacheHit: false,
            billable: false,
            chargedAmount: "0.00",
            currency: "CNY",
            provider: { mode: "DATABASE", code: "SQJ_SQLITE_100" },
            data,
            error: null
        };
    }
};
exports.CompaniesController = CompaniesController;
__decorate([
    (0, common_1.Post)("search/resolve"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "search", null);
__decorate([
    (0, common_1.Get)("search"),
    __param(0, (0, common_1.Query)("q")),
    __param(1, (0, common_1.Query)("country")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "searchGet", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "detail", null);
__decorate([
    (0, common_1.Get)(":id/modules/:moduleCode"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Param)("moduleCode")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "module", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "count", null);
exports.CompaniesController = CompaniesController = __decorate([
    (0, common_1.Controller)("companies"),
    __metadata("design:paramtypes", [company_fixture_service_1.CompanyFixtureService])
], CompaniesController);
