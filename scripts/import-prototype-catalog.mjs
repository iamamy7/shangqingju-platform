import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.resolve(root, "../商情局_可交互原型_v1.0/app.js");
const outputPath = path.resolve(root, "services/api/fixtures/api-products.json");
const source = fs.readFileSync(sourcePath, "utf8");

function extractBetween(startToken, endToken) {
  const start = source.indexOf(startToken);
  if (start < 0) throw new Error(`Missing ${startToken}`);
  const contentStart = start + startToken.length;
  const end = source.indexOf(endToken, contentStart);
  if (end < 0) throw new Error(`Missing ${endToken}`);
  return source.slice(contentStart, end);
}

const productArraySource = `[${extractBetween("const apiProducts = [", "].map((item)=>")}]`;
const priceMapSource = `{${extractBetween("const prototypeApiUnitPrices = {", "};\napiProducts.forEach")}}`;
const products = Function(`"use strict"; return (${productArraySource});`)();
const prices = Function(`"use strict"; return (${priceMapSource});`)();

const catalog = products.map((item) => ({
  apiId: `GC-API-${String(item.serial).padStart(3, "0")}`,
  serial: item.serial,
  operationId: item.code,
  category: item.group,
  nameZh: item.name,
  nameEn: item.code,
  description: item.desc,
  method: item.method,
  path: item.endpoint,
  tags: item.tags,
  request: item.request,
  responseFieldCount: item.responseCount,
  unitPrice: (prices[item.code] ?? 0.1).toFixed(2),
  currency: "CNY",
  billingRule: "SUCCESS_ONLY",
  enabled: true
}));

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Imported ${catalog.length} API products to ${outputPath}`);

