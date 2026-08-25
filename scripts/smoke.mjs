import assert from "node:assert/strict";

const api = process.env.SQJ_API_BASE || "http://127.0.0.1:4000/api/v1";

async function json(path, init) {
  const response = await fetch(`${api}${path}`, init);
  const body = await response.json();
  assert.ok(response.ok, `${path} returned ${response.status}: ${JSON.stringify(body)}`);
  return body;
}

const health = await json("/health");
assert.equal(health.status, "ok");

const companies = await json("/companies");
assert.ok(companies.total >= 100);

const northstar = await json("/companies/search/resolve", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Northstar Components", countryIso2: "US" })
});
assert.equal(northstar.dataState, "AVAILABLE");
assert.ok(northstar.data.candidates.some((item) => item.name === "Northstar Components Inc."));

const synthetic = await json("/companies/search/resolve", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "星桥数据科技有限公司", countryIso2: "CN" })
});
assert.equal(synthetic.data.candidates[0].id, "SQJ-SYN-CN-0001");

const ownership = await json("/companies/SQJ-SYN-CN-0001/modules/M03");
assert.equal(ownership.dataState, "AVAILABLE");
assert.ok(ownership.data.shareholders.length >= 1);

const products = await json("/api-products");
assert.equal(products.total, 33);
assert.ok(products.items.every((item) => Number(item.unitPrice) <= 1.5));

const categories = await json("/api-products/categories");
assert.equal(categories.items.length, 8);

const user = await json("/auth/login/phone", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ phone: "13800138888", code: "123456" })
});
assert.equal(user.session.role, "USER");

const admin = await json("/auth/admin/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: "operator", password: "123456" })
});
assert.equal(admin.session.role, "ADMIN");

for (const [name, url, expected] of [
  ["web", process.env.SQJ_WEB_BASE || "http://localhost:3000", "商情局"],
  ["admin", process.env.SQJ_ADMIN_BASE || "http://localhost:3001/admin/", "官方运营后台"]
]) {
  const response = await fetch(url);
  const html = await response.text();
  assert.ok(response.ok, `${name} returned ${response.status}`);
  assert.ok(html.includes(expected), `${name} did not render ${expected}`);
}

console.log(JSON.stringify({
  result: "PASS",
  companyFixtures: companies.total,
  apiProducts: products.total,
  apiCategories: categories.items.length,
  sampleCompany: northstar.data.candidates[0].name,
  userSession: user.session.role,
  adminSession: admin.session.role
}, null, 2));
