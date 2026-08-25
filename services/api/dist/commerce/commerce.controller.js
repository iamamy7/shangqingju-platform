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
exports.CommerceController = void 0;
const common_1 = require("@nestjs/common");
const session_service_1 = require("../auth/session.service");
const commerce_service_1 = require("./commerce.service");
const report_catalog_service_1 = require("./report-catalog.service");
let CommerceController = class CommerceController {
    catalog;
    commerce;
    sessions;
    constructor(catalog, commerce, sessions) {
        this.catalog = catalog;
        this.commerce = commerce;
        this.sessions = sessions;
    }
    listProducts() { return this.catalog.list(); }
    quote(body) { return this.catalog.quote(body.moduleCodes || []); }
    balance(auth = "") { return this.commerce.getBalance(this.owner(auth)); }
    recharge(auth = "", body) { return this.commerce.recharge(this.owner(auth), Math.max(0, Number(body.amount || 0))); }
    listOrders(auth = "") { return this.commerce.listOrders(this.owner(auth)); }
    createOrder(auth = "", body) { return this.commerce.createOrder(this.owner(auth), body); }
    getOrder(auth = "", id) { return this.commerce.getOrder(this.owner(auth), id); }
    pay(auth = "", id, body) { return this.commerce.pay(this.owner(auth), id, body.channel || "BALANCE"); }
    task(auth = "", id) { return this.commerce.getTask(this.owner(auth), id); }
    report(auth = "", id) { return this.commerce.getReport(this.owner(auth), id); }
    owner(auth) { return this.sessions.verify(auth.replace(/^Bearer\s+/i, ""), "USER").subject; }
};
exports.CommerceController = CommerceController;
__decorate([
    (0, common_1.Get)("report-products"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommerceController.prototype, "listProducts", null);
__decorate([
    (0, common_1.Post)("report-products/quote"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommerceController.prototype, "quote", null);
__decorate([
    (0, common_1.Get)("account/balance"),
    __param(0, (0, common_1.Headers)("authorization")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommerceController.prototype, "balance", null);
__decorate([
    (0, common_1.Post)("account/recharge"),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CommerceController.prototype, "recharge", null);
__decorate([
    (0, common_1.Get)("orders"),
    __param(0, (0, common_1.Headers)("authorization")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommerceController.prototype, "listOrders", null);
__decorate([
    (0, common_1.Post)("orders"),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CommerceController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Get)("orders/:id"),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CommerceController.prototype, "getOrder", null);
__decorate([
    (0, common_1.Post)("orders/:id/pay"),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], CommerceController.prototype, "pay", null);
__decorate([
    (0, common_1.Get)("report-tasks/:id"),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CommerceController.prototype, "task", null);
__decorate([
    (0, common_1.Get)("reports/:id"),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CommerceController.prototype, "report", null);
exports.CommerceController = CommerceController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [report_catalog_service_1.ReportCatalogService, commerce_service_1.CommerceService, session_service_1.SessionService])
], CommerceController);
