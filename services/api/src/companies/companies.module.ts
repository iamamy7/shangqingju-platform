import { Module } from "@nestjs/common";
import { CompaniesController } from "./companies.controller";
import { CompanyFixtureService } from "./company-fixture.service";
import { HomePageModule } from "../home/home-page.module";

@Module({
  imports: [HomePageModule],
  controllers: [CompaniesController],
  providers: [CompanyFixtureService],
  exports: [CompanyFixtureService]
})
export class CompaniesModule {}
