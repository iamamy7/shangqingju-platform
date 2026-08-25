import { Body, Controller, Get, Headers, Param, Post } from "@nestjs/common";
import { SessionService } from "../auth/session.service";
import { CommerceService } from "./commerce.service";
import { ReportCatalogService } from "./report-catalog.service";

@Controller()
export class CommerceController {
  constructor(private readonly catalog: ReportCatalogService, private readonly commerce: CommerceService, private readonly sessions: SessionService) {}
  @Get("report-products") listProducts() { return this.catalog.list(); }
  @Post("report-products/quote") quote(@Body() body: { moduleCodes?: string[] }) { return this.catalog.quote(body.moduleCodes || []); }
  @Get("account/balance") balance(@Headers("authorization") auth = "") { return this.commerce.getBalance(this.owner(auth)); }
  @Post("account/recharge") recharge(@Headers("authorization") auth = "", @Body() body: { amount?: number }) { return this.commerce.recharge(this.owner(auth), Math.max(0, Number(body.amount || 0))); }
  @Get("orders") listOrders(@Headers("authorization") auth = "") { return this.commerce.listOrders(this.owner(auth)); }
  @Post("orders") createOrder(@Headers("authorization") auth = "", @Body() body: { companyId: string; moduleCodes: string[]; invoiceRequested?: boolean }) { return this.commerce.createOrder(this.owner(auth), body); }
  @Get("orders/:id") getOrder(@Headers("authorization") auth = "", @Param("id") id: string) { return this.commerce.getOrder(this.owner(auth), id); }
  @Post("orders/:id/pay") pay(@Headers("authorization") auth = "", @Param("id") id: string, @Body() body: { channel?: "BALANCE" | "WECHAT" | "ALIPAY" | "BANK_TRANSFER" | "WECHAT_MOCK" | "ALIPAY_MOCK" }) { return this.commerce.pay(this.owner(auth), id, body.channel || "BALANCE"); }
  @Get("report-tasks/:id") task(@Headers("authorization") auth = "", @Param("id") id: string) { return this.commerce.getTask(this.owner(auth), id); }
  @Get("reports/:id") report(@Headers("authorization") auth = "", @Param("id") id: string) { return this.commerce.getReport(this.owner(auth), id); }
  private owner(auth: string) { return this.sessions.verify(auth.replace(/^Bearer\s+/i, ""), "USER").subject; }
}
