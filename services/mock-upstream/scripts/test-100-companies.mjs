import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const companies = JSON.parse(await readFile(join(root, "fixtures/companies-100.json"), "utf8"));
const port = 4192;
const baseUrl = `http://127.0.0.1:${port}`;
const headers = { "X-API-Key":"sqj_test_2026_demo_key" };
const server = spawn(process.execPath, ["server.mjs"], {
  cwd: root,
  env: { ...process.env, PORT:String(port), MOCK_COMPANIES_FILE:"fixtures/companies-100.json", MOCK_COMPANY_MODULES_FILE:"fixtures/company-modules-100.json" },
  stdio:["ignore","pipe","pipe"]
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function waitForHealth() {
  for (let i = 0; i < 50; i += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return response.json();
    } catch {}
    await delay(100);
  }
  throw new Error("100-record test server did not become healthy");
}

try {
  const health = await waitForHealth();
  if (health.fixtureCompanies < 100) throw new Error(`Health expected at least 100 fixtures, got ${health.fixtureCompanies}`);
  let passed = 0;
  let moduleCalls = 0;
  const marketCounts = {};
  for (const company of companies) {
    const scope = company.country === "CN" ? "domestic" : "global";
    const url = new URL(`${baseUrl}/open/v1/${scope}/companies/search`);
    url.searchParams.set("q", company.registrationNumber);
    const response = await fetch(url, { headers });
    const body = await response.json();
    const candidate = body?.data?.candidates?.[0];
    if (!response.ok || body.dataState !== "AVAILABLE" || body.data.total !== 1 || candidate?.id !== company.id) {
      throw new Error(`Search failed for ${company.id}: ${response.status} ${JSON.stringify(body)}`);
    }
    passed += 1;
    marketCounts[company.country] = (marketCounts[company.country] || 0) + 1;
    for (let moduleNumber = 1; moduleNumber <= 10; moduleNumber += 1) {
      const moduleCode = `M${String(moduleNumber).padStart(2, "0")}`;
      const moduleResponse = await fetch(`${baseUrl}/open/v1/companies/${company.id}/modules/${moduleCode}`, { headers });
      const moduleBody = await moduleResponse.json();
      if (!moduleResponse.ok || moduleBody.dataState !== "AVAILABLE" || moduleBody.data?.companyId !== company.id || !moduleBody.data?.result) {
        throw new Error(`Module ${moduleCode} failed for ${company.id}: ${moduleResponse.status} ${JSON.stringify(moduleBody)}`);
      }
      moduleCalls += 1;
    }
  }
  console.log(JSON.stringify({ result:"PASS", fixtureCompanies:companies.length, testedCompanies:passed, testedModules:moduleCalls, marketCounts, companyFixture:health.companyFixtureFile, moduleFixture:health.companyModulesFixtureFile }, null, 2));
} finally {
  server.kill("SIGTERM");
}
