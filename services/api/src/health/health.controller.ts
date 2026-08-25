import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  getHealth() {
    return {
      service: "sqj-api",
      status: "ok",
      provider: process.env.UPSTREAM_PROVIDER || "mock",
      time: new Date().toISOString()
    };
  }
}

