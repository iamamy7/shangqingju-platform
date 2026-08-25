import { Module } from "@nestjs/common";
import { ProductsController } from "./products.controller";
import { ProductCatalogService } from "./product-catalog.service";

@Module({
  controllers: [ProductsController],
  providers: [ProductCatalogService]
})
export class ProductsModule {}

