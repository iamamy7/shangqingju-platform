import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { CompanyFixtureService } from "./company-fixture.service";
import { HomePageService } from "../home/home-page.service";

@Controller("companies")
export class CompaniesController {
  constructor(private readonly fixtures: CompanyFixtureService, private readonly home: HomePageService) {}

  @Post("search/resolve")
  search(@Body() body: { name?: string; countryIso2?: string; limit?: number }) {
    const candidates = this.fixtures.search(body.name || "", body.countryIso2, body.limit || 10);
    this.home.recordSearch(body.name || "", body.countryIso2 || "GLOBAL", candidates[0]);
    return this.response(candidates.length ? "AVAILABLE" : "NO_RECORD", { candidates, total: candidates.length });
  }

  @Get("search")
  searchGet(@Query("q") query = "", @Query("country") country?: string) {
    const candidates = this.fixtures.search(query, country, 10);
    this.home.recordSearch(query, country || "GLOBAL", candidates[0]);
    return this.response(candidates.length ? "AVAILABLE" : "NO_RECORD", { candidates, total: candidates.length });
  }

  @Get(":id")
  detail(@Param("id") id: string) {
    return this.response("AVAILABLE", this.fixtures.getCompany(id));
  }

  @Get(":id/modules/:moduleCode")
  module(@Param("id") id: string, @Param("moduleCode") moduleCode: string) {
    const result = this.fixtures.getModule(id, moduleCode.toUpperCase()) as { dataState?: string; data?: unknown };
    return this.response(result.dataState || "NO_RECORD", result.data ?? null);
  }

  @Get()
  count() {
    return { total: this.fixtures.count(), classification: "SQJ_GENERATED_TEST_DATABASE" };
  }

  private response(dataState: string, data: unknown) {
    const requestId = randomUUID();
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
}
