import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CompaniesModule } from "../companies/companies.module";
import { CommerceController } from "./commerce.controller";
import { CommerceService } from "./commerce.service";
import { ReportCatalogService } from "./report-catalog.service";

@Module({ imports: [AuthModule, CompaniesModule], controllers: [CommerceController], providers: [CommerceService, ReportCatalogService] })
export class CommerceModule {}
