import { ForbiddenException, Injectable, NotFoundException, NotImplementedException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { CompanyFixtureService } from "../companies/company-fixture.service";
import { DatabaseService } from "../database/database.service";
import { ReportCatalogService } from "./report-catalog.service";

type PaymentChannel = "BALANCE" | "WECHAT" | "ALIPAY" | "BANK_TRANSFER" | "WECHAT_MOCK" | "ALIPAY_MOCK";
type OrderRow = {
  id: string; owner: string; company_id: string; module_codes_json: string; amount: number;
  status: "PENDING_PAYMENT" | "PAID"; created_at: string; paid_at: string | null;
  task_id: string | null; report_id: string | null; payment_channel: string | null; invoice_requested: number;
};

@Injectable()
export class CommerceService {
  private readonly initialBalance = 20_000;

  constructor(
    private readonly catalog: ReportCatalogService,
    private readonly companies: CompanyFixtureService,
    private readonly database: DatabaseService
  ) {}

  getBalance(owner: string) {
    this.ensureAccount(owner);
    const row = this.database.connection.prepare("SELECT balance, currency, updated_at FROM accounts WHERE owner = ?").get(owner) as { balance: number; currency: string; updated_at: string };
    return { available: Number(row.balance), currency: row.currency, updatedAt: row.updated_at, classification: "TEST_ACCOUNT_BALANCE" };
  }

  recharge(_owner: string, _amount: number) {
    throw new NotImplementedException("第三方充值暂未开发");
  }

  createOrder(owner: string, input: { companyId: string; moduleCodes: string[]; invoiceRequested?: boolean }) {
    this.companies.getCompany(input.companyId);
    const quote = this.catalog.quote(input.moduleCodes);
    if (!quote.products.length) throw new ForbiddenException("请至少选择一个报告模块");
    const order = {
      id: `ORD-${Date.now()}-${randomUUID().slice(0, 6)}`,
      owner, companyId: input.companyId, moduleCodes: quote.products.map((item) => item.code),
      amount: quote.total, status: "PENDING_PAYMENT" as const, createdAt: new Date().toISOString(),
      invoiceRequested: Boolean(input.invoiceRequested)
    };
    this.database.connection.prepare(`INSERT INTO orders
      (id, owner, company_id, module_codes_json, amount, status, created_at, invoice_requested)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(order.id, owner, order.companyId, JSON.stringify(order.moduleCodes), order.amount, order.status, order.createdAt, order.invoiceRequested ? 1 : 0);
    return { ...order, quote };
  }

  pay(owner: string, id: string, channel: PaymentChannel) {
    if (channel !== "BALANCE") throw new NotImplementedException("该支付方式暂未开发，请使用账户余额支付");
    const order = this.requireOrder(owner, id);
    if (order.status === "PAID") return this.orderView(order);
    this.ensureAccount(owner);
    const balance = this.getBalance(owner).available;
    if (balance < order.amount) throw new ForbiddenException("账户余额不足");

    const paidAt = new Date().toISOString();
    const taskId = `TASK-${randomUUID().slice(0, 10)}`;
    const reportId = `RPT-${randomUUID().slice(0, 10)}`;
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
        .run(`LED-${randomUUID().slice(0, 12)}`, owner, id, order.amount, remaining, paidAt);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
    return { ...this.getOrder(owner, id), balance: remaining, paymentProvider: "INTERNAL_BALANCE" };
  }

  listOrders(owner: string) {
    return (this.database.connection.prepare("SELECT * FROM orders WHERE owner = ? ORDER BY created_at DESC").all(owner) as unknown as OrderRow[])
      .map((order) => this.orderView(order));
  }

  getOrder(owner: string, id: string) { return this.orderView(this.requireOrder(owner, id)); }

  getTask(owner: string, taskId: string) {
    const order = this.database.connection.prepare("SELECT * FROM orders WHERE owner = ? AND task_id = ?").get(owner, taskId) as OrderRow | undefined;
    if (!order || order.status !== "PAID") throw new NotFoundException("报告任务不存在或无权访问");
    const elapsed = Date.now() - new Date(order.paid_at || order.created_at).getTime();
    return { id: taskId, orderId: order.id, reportId: order.report_id, status: "COMPLETED", progress: 100, elapsedMs: Math.max(0, elapsed), steps: ["主体确认", "数据库查询", "模块分析", "报告生成"] };
  }

  getReport(owner: string, reportId: string) {
    const row = this.database.connection.prepare("SELECT payload_json FROM reports WHERE owner = ? AND id = ?").get(owner, reportId) as { payload_json: string } | undefined;
    if (!row) throw new NotFoundException("报告不存在、尚未支付或无权访问");
    return JSON.parse(row.payload_json) as unknown;
  }

  private buildReportPayload(owner: string, reportId: string, order: OrderRow, generatedAt: string) {
    const moduleCodes = JSON.parse(order.module_codes_json) as string[];
    const company = this.companies.getCompany(order.company_id);
    const products = this.catalog.resolve(moduleCodes);
    const sections = products.map((product) => ({ product, sourceState: this.companies.getModule(order.company_id, product.code) }));
    return { id: reportId, orderId: order.id, owner, generatedAt, company, products, sections, dataSource: "SQJ_SQLITE_100", shareable: false, download: { pdf: true, fontPolicy: "EMBED_CJK", completeness: "FULL_REPORT" } };
  }

  private ensureAccount(owner: string) {
    const exists = this.database.connection.prepare("SELECT owner FROM accounts WHERE owner = ?").get(owner);
    if (exists) return;
    const now = new Date().toISOString();
    this.database.connection.prepare("INSERT INTO accounts(owner, balance, currency, updated_at) VALUES (?, ?, 'CNY', ?)").run(owner, this.initialBalance, now);
    this.database.connection.prepare(`INSERT INTO account_ledger(id, owner, direction, amount, balance_after, created_at) VALUES (?, ?, 'CREDIT', ?, ?, ?)`)
      .run(`LED-${randomUUID().slice(0, 12)}`, owner, this.initialBalance, this.initialBalance, now);
  }

  private requireOrder(owner: string, id: string) {
    const order = this.database.connection.prepare("SELECT * FROM orders WHERE id = ? AND owner = ?").get(id, owner) as OrderRow | undefined;
    if (!order) throw new NotFoundException("订单不存在或无权访问");
    return order;
  }

  private orderView(order: OrderRow) {
    const moduleCodes = JSON.parse(order.module_codes_json) as string[];
    return {
      id: order.id, orderId: order.id, owner: order.owner, companyId: order.company_id, moduleCodes,
      amount: Number(order.amount), status: order.status, createdAt: order.created_at, paidAt: order.paid_at,
      taskId: order.task_id, reportId: order.report_id, paymentChannel: order.payment_channel,
      invoiceRequested: Boolean(order.invoice_requested), quote: this.catalog.quote(moduleCodes)
    };
  }
}
