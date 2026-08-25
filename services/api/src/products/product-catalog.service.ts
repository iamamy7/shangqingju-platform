import { Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export interface ApiCatalogItem {
  operationId: string;
  category: string;
  nameZh: string;
  method: "GET" | "POST";
  path: string;
  unitPrice: string;
  enabled: boolean;
  [key: string]: unknown;
}

@Injectable()
export class ProductCatalogService implements OnModuleInit {
  private products: ApiCatalogItem[] = [];

  async onModuleInit() {
    const file = join(process.cwd(), "fixtures", "api-products.json");
    this.products = JSON.parse(await readFile(file, "utf8")) as ApiCatalogItem[];
  }

  list(category?: string, keyword?: string) {
    const query = keyword?.trim().toLocaleLowerCase();
    return this.products.filter((item) => {
      const inCategory = !category || item.category === category;
      const haystack = `${item.nameZh} ${item.operationId} ${item.path} ${item.category}`.toLocaleLowerCase();
      return inCategory && (!query || haystack.includes(query));
    });
  }

  categories() {
    return [...new Set(this.products.map((item) => item.category))].map((name) => ({
      name,
      count: this.products.filter((item) => item.category === name).length
    }));
  }

  get(operationId: string) {
    const product = this.products.find((item) => item.operationId === operationId);
    if (!product) throw new NotFoundException("未找到 API 产品");
    return product;
  }
}

