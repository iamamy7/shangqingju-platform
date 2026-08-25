import { Module } from "@nestjs/common";
import { HealthController } from "./health/health.controller";
import { ProviderModule } from "./providers/provider.module";
import { AuthModule } from "./auth/auth.module";
import { CompaniesModule } from "./companies/companies.module";
import { ProductsModule } from "./products/products.module";
import { CommerceModule } from "./commerce/commerce.module";
import { DatabaseModule } from "./database/database.module";

@Module({
  imports: [DatabaseModule, ProviderModule, AuthModule, CompaniesModule, ProductsModule, CommerceModule],
  controllers: [HealthController]
})
export class AppModule {}
