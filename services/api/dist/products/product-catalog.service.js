"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductCatalogService = void 0;
const common_1 = require("@nestjs/common");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
let ProductCatalogService = class ProductCatalogService {
    products = [];
    async onModuleInit() {
        const file = (0, node_path_1.join)(process.cwd(), "fixtures", "api-products.json");
        this.products = JSON.parse(await (0, promises_1.readFile)(file, "utf8"));
    }
    list(category, keyword) {
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
    get(operationId) {
        const product = this.products.find((item) => item.operationId === operationId);
        if (!product)
            throw new common_1.NotFoundException("未找到 API 产品");
        return product;
    }
};
exports.ProductCatalogService = ProductCatalogService;
exports.ProductCatalogService = ProductCatalogService = __decorate([
    (0, common_1.Injectable)()
], ProductCatalogService);
