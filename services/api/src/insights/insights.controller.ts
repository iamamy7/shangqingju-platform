import { Body, Controller, Delete, Get, Headers, Param, Post, Query } from "@nestjs/common";
import { SessionService } from "../auth/session.service";
import { InsightsService } from "./insights.service";

@Controller()
export class InsightsController {
  constructor(
    private readonly insights: InsightsService,
    private readonly sessions: SessionService
  ) {}

  @Get("insights")
  listPublished(@Query("category") category?: string) {
    return this.insights.listPublished(category);
  }

  @Get("insights/:id")
  getPublished(@Param("id") id: string) {
    return this.insights.getPublished(id);
  }

  @Get("admin/insights")
  listForReview(@Headers("authorization") auth = "", @Query("status") status?: string) {
    this.admin(auth);
    return this.insights.listForAdmin(status);
  }

  @Post("admin/insights/collect")
  collect(
    @Headers("authorization") auth = "",
    @Body() body: { items?: Record<string, unknown>[] } = {}
  ) {
    const operator = this.admin(auth);
    return this.insights.collect(operator, body.items);
  }

  @Post("admin/insights/:id/approve")
  approve(@Headers("authorization") auth = "", @Param("id") id: string) {
    return this.insights.approve(id, this.admin(auth));
  }

  @Post("admin/insights/:id/reject")
  reject(
    @Headers("authorization") auth = "",
    @Param("id") id: string,
    @Body() body: { reason?: string } = {}
  ) {
    return this.insights.reject(id, this.admin(auth), body.reason || "未通过人工审核");
  }

  @Delete("admin/insights/:id")
  remove(@Headers("authorization") auth = "", @Param("id") id: string) {
    return this.insights.remove(id, this.admin(auth));
  }

  private admin(auth: string) {
    return this.sessions.verify(auth.replace(/^Bearer\s+/i, ""), "ADMIN").subject;
  }
}
