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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommerceService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const company_fixture_service_1 = require("../companies/company-fixture.service");
const database_service_1 = require("../database/database.service");
const report_catalog_service_1 = require("./report-catalog.service");
let CommerceService = class CommerceService {
    catalog;
    companies;
    database;
    initialBalance = 20_000;
    constructor(catalog, companies, database) {
        this.catalog = catalog;
        this.companies = companies;
        this.database = database;
    }
    getBalance(owner) {
        this.ensureAccount(owner);
        const row = this.database.connection.prepare("SELECT balance, currency, updated_at FROM accounts WHERE owner = ?").get(owner);
        return { available: Number(row.balance), currency: row.currency, updatedAt: row.updated_at, classification: "TEST_ACCOUNT_BALANCE" };
    }
    recharge(_owner, _amount) {
        throw new common_1.NotImplementedException("第三方充值暂未开发");
    }
    createOrder(owner, input) {
        this.companies.getCompany(input.companyId);
        const quote = this.catalog.quote(input.moduleCodes);
        if (!quote.products.length)
            throw new common_1.ForbiddenException("请至少选择一个报告模块");
        const order = {
            id: `ORD-${Date.now()}-${(0, node_crypto_1.randomUUID)().slice(0, 6)}`,
            owner, companyId: input.companyId, moduleCodes: quote.products.map((item) => item.code),
            amount: quote.total, status: "PENDING_PAYMENT", createdAt: new Date().toISOString(),
            invoiceRequested: Boolean(input.invoiceRequested)
        };
        this.database.connection.prepare(`INSERT INTO orders
      (id, owner, company_id, module_codes_json, amount, status, created_at, invoice_requested)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
            .run(order.id, owner, order.companyId, JSON.stringify(order.moduleCodes), order.amount, order.status, order.createdAt, order.invoiceRequested ? 1 : 0);
        return { ...order, quote };
    }
    pay(owner, id, channel) {
        if (channel !== "BALANCE")
            throw new common_1.NotImplementedException("该支付方式暂未开发，请使用账户余额支付");
        const order = this.requireOrder(owner, id);
        if (order.status === "PAID")
            return this.orderView(order);
        this.ensureAccount(owner);
        const balance = this.getBalance(owner).available;
        if (balance < order.amount)
            throw new common_1.ForbiddenException("账户余额不足");
        const paidAt = new Date().toISOString();
        const taskId = `TASK-${(0, node_crypto_1.randomUUID)().slice(0, 10)}`;
        const reportId = `RPT-${(0, node_crypto_1.randomUUID)().slice(0, 10)}`;
        const remaining = Number((balance - Number(order.amount)).toFixed(2));
        const report = this.buildReportPayload(owner, reportId, order, paidAt);
        const db = this.database.connection;
        db.exec("BEGIN IMMEDIATE");
        try {
            db.prepare("UPDATE accounts SET balance = ?, updated_at = ? WHERE owner = ?").run(remaining, paidAt, owner);
            db.prepare(`UPDATE orders SET status='PAID', paid_at=?, task_id=?, report_id=?, payment_channel='BALANCE' WHERE id=?`)
                .run(paidAt, taskId, reportId, id);
            db.prepare(`INSERT INTO reports(id, order_id, owner, company_id, generated_at, payload_json) VALUES (?, ?, ?, ?, ?, ?)`)
                .run(reportId, id, owner, order.company_id, paidAt, JSON.stringify(report));
            db.prepare(`INSERT INTO account_ledger(id, owner, order_id, direction, amount, balance_after, created_at) VALUES (?, ?, ?, 'DEBIT', ?, ?, ?)`)
                .run(`LED-${(0, node_crypto_1.randomUUID)().slice(0, 12)}`, owner, id, order.amount, remaining, paidAt);
            db.exec("COMMIT");
        }
        catch (error) {
            db.exec("ROLLBACK");
            throw error;
        }
        return { ...this.getOrder(owner, id), balance: remaining, paymentProvider: "INTERNAL_BALANCE" };
    }
    listOrders(owner) {
        return this.database.connection.prepare("SELECT * FROM orders WHERE owner = ? ORDER BY created_at DESC").all(owner)
            .map((order) => this.orderView(order));
    }
    getOrder(owner, id) { return this.orderView(this.requireOrder(owner, id)); }
    getTask(owner, taskId) {
        const order = this.database.connection.prepare("SELECT * FROM orders WHERE owner = ? AND task_id = ?").get(owner, taskId);
        if (!order || order.status !== "PAID")
            throw new common_1.NotFoundException("报告任务不存在或无权访问");
        const elapsed = Date.now() - new Date(order.paid_at || order.created_at).getTime();
        return { id: taskId, orderId: order.id, reportId: order.report_id, status: "COMPLETED", progress: 100, elapsedMs: Math.max(0, elapsed), steps: ["主体确认", "数据库查询", "模块分析", "报告生成"] };
    }
    getReport(owner, reportId) {
        const row = this.database.connection.prepare("SELECT payload_json FROM reports WHERE owner = ? AND id = ?").get(owner, reportId);
        if (!row)
            throw new common_1.NotFoundException("报告不存在、尚未支付或无权访问");
        return JSON.parse(row.payload_json);
    }
    buildReportPayload(owner, reportId, order, generatedAt) {
        const moduleCodes = JSON.parse(order.module_codes_json);
        const company = this.companies.getCompany(order.company_id);
        const products = this.catalog.resolve(moduleCodes);
        const sections = products.map((product) => ({ product, sourceState: this.companies.getModule(order.company_id, product.code) }));
        return { id: reportId, orderId: order.id, owner, generatedAt, company, products, sections, dataSource: "SQJ_SQLITE_100", shareable: false, download: { pdf: true, fontPolicy: "EMBED_CJK", completeness: "FULL_REPORT" } };
    }
    ensureAccount(owner) {
        const exists = this.database.connection.prepare("SELECT owner FROM accounts WHERE owner = ?").get(owner);
        if (exists)
            return;
        const now = new Date().toISOString();
        this.database.connection.prepare("INSERT INTO accounts(owner, balance, currency, updated_at) VALUES (?, ?, 'CNY', ?)").run(owner, this.initialBalance, now);
        this.database.connection.prepare(`INSERT INTO account_ledger(id, owner, direction, amount, balance_after, created_at) VALUES (?, ?, 'CREDIT', ?, ?, ?)`)
            .run(`LED-${(0, node_crypto_1.randomUUID)().slice(0, 12)}`, owner, this.initialBalance, this.initialBalance, now);
    }
    requireOrder(owner, id) {
        const order = this.database.connection.prepare("SELECT * FROM orders WHERE id = ? AND owner = ?").get(id, owner);
        if (!order)
            throw new common_1.NotFoundException("订单不存在或无权访问");
        return order;
    }
    orderView(order) {
        const moduleCodes = JSON.parse(order.module_codes_json);
        return {
            id: order.id, orderId: order.id, owner: order.owner, companyId: order.company_id, moduleCodes,
            amount: Number(order.amount), status: order.status, createdAt: order.created_at, paidAt: order.paid_at,
            taskId: order.task_id, reportId: order.report_id, paymentChannel: order.payment_channel,
            invoiceRequested: Boolean(order.invoice_requested), quote: this.catalog.quote(moduleCodes)
        };
    }
};
exports.CommerceService = CommerceService;
exports.CommerceService = CommerceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [report_catalog_service_1.ReportCatalogService,
        company_fixture_service_1.CompanyFixtureService,
        database_service_1.DatabaseService])
], CommerceService);
