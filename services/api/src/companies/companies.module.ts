import { Module } from "@nestjs/common";
import { CompaniesController } from "./companies.controller";
import { CompanyFixtureService } from "./company-fixture.service";

@Module({
  controllers: [CompaniesController],
  providers: [CompanyFixtureService],
  exports: [CompanyFixtureService]
})
export class CompaniesModule {}
