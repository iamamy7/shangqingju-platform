import { Controller, Get, Param, Query } from "@nestjs/common";
import { ProductCatalogService } from "./product-catalog.service";

@Controller("api-products")
export class ProductsController {
  constructor(private readonly catalog: ProductCatalogService) {}

  @Get()
  list(@Query("category") category?: string, @Query("q") keyword?: string) {
    const items = this.catalog.list(category, keyword);
    return { total: items.length, items };
  }

  @Get("categories")
  categories() {
    return { items: this.catalog.categories() };
  }

  @Get(":operationId")
  detail(@Param("operationId") operationId: string) {
    return this.catalog.get(operationId);
  }
}

