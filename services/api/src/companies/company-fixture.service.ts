import { Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DatabaseService } from "../database/database.service";

export interface CompanyFixture {
  id: string; name: string; localName?: string; aliases?: string[]; country: string;
  countryName?: string; registrationNumber: string; status: string; address?: string;
  [key: string]: unknown;
}

type CompanyRow = { payload_json: string };
type ModuleRow = { data_state: string; payload_json: string | null };

@Injectable()
export class CompanyFixtureService implements OnModuleInit {
  constructor(private readonly database: DatabaseService) {}

  async onModuleInit() {
    const db = this.database.connection;
    const version = db.prepare("SELECT value FROM system_meta WHERE key = 'company_seed_version'").get() as { value?: string } | undefined;
    const count = Number((db.prepare("SELECT COUNT(*) AS count FROM companies").get() as { count: number }).count);
    if (version?.value === "SQJ-100-V2" && count === 100) return;

    const fixtureDir = join(process.cwd(), "fixtures");
    const [samples, synthetic, moduleFixtures] = await Promise.all([
      this.readJson<CompanyFixture[]>(join(fixtureDir, "companies.json")),
      this.readJson<CompanyFixture[]>(join(fixtureDir, "companies-100.json")),
      this.readJson<Record<string, Record<string, { dataState?: string; data?: unknown }>>>(join(fixtureDir, "company-modules-100.json"))
    ]);
    // Exactly 100 complete test subjects: Northstar plus 99 generated companies.
    const companies = [samples[0], ...synthetic.slice(0, 99)];
    const insertCompany = db.prepare(`INSERT INTO companies
      (id, name, local_name, country, registration_number, status, search_text, payload_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    const insertModule = db.prepare(`INSERT INTO company_modules
      (company_id, module_code, data_state, payload_json) VALUES (?, ?, ?, ?)`);
    db.exec("BEGIN IMMEDIATE");
    try {
      db.exec("DELETE FROM reports; DELETE FROM orders; DELETE FROM company_modules; DELETE FROM companies;");
      for (const company of companies) {
        const searchText = [company.name, company.localName, company.registrationNumber, ...(company.aliases || [])]
          .filter(Boolean).join(" ").toLocaleLowerCase();
        insertCompany.run(company.id, company.name, company.localName || "", company.country, company.registrationNumber, company.status, searchText, JSON.stringify(company));
        for (const moduleCode of ["M01","M02","M03","M04","M05","M06","M07","M08","M09","M10"]) {
          const source = moduleFixtures[company.id]?.[moduleCode] ?? this.buildCompleteModule(company, moduleCode);
          insertModule.run(company.id, moduleCode, source.dataState || "AVAILABLE", JSON.stringify(source.data ?? null));
        }
      }
      db.prepare("INSERT OR REPLACE INTO system_meta(key, value) VALUES ('company_seed_version', 'SQJ-100-V2')").run();
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  search(query: string, country?: string, limit = 10) {
    const keyword = this.normalize(query);
    if (!keyword) return [];
    const rows = this.database.connection.prepare(
      country ? "SELECT payload_json FROM companies WHERE country = ?" : "SELECT payload_json FROM companies"
    ).all(...(country ? [country.toUpperCase()] : [])) as unknown as CompanyRow[];
    return rows.map((row) => JSON.parse(row.payload_json) as CompanyFixture)
      .map((company) => ({ company, score: this.score(company, keyword) }))
      .filter(({ score }) => score > 0).sort((a, b) => b.score - a.score)
      .slice(0, Math.min(Math.max(limit, 1), 50))
      .map(({ company, score }) => ({ ...company, matchScore: score / 100 }));
  }

  getCompany(id: string) {
    const row = this.database.connection.prepare("SELECT payload_json FROM companies WHERE id = ?").get(id) as CompanyRow | undefined;
    if (!row) throw new NotFoundException("未找到企业主体");
    return JSON.parse(row.payload_json) as CompanyFixture;
  }

  getModule(id: string, moduleCode: string) {
    this.getCompany(id);
    const row = this.database.connection.prepare("SELECT data_state, payload_json FROM company_modules WHERE company_id = ? AND module_code = ?").get(id, moduleCode) as ModuleRow | undefined;
    if (!row) return { dataState: "NO_RECORD", data: null };
    return { dataState: row.data_state, data: row.payload_json ? JSON.parse(row.payload_json) : null };
  }

  count() {
    return Number((this.database.connection.prepare("SELECT COUNT(*) AS count FROM companies").get() as { count: number }).count);
  }

  private score(company: CompanyFixture, keyword: string) {
    const values = [company.name, company.localName, company.registrationNumber, ...(company.aliases || [])]
      .filter(Boolean).map((value) => this.normalize(String(value)));
    if (values.some((value) => value === keyword)) return 100;
    if (values.some((value) => value.startsWith(keyword))) return 92;
    if (values.some((value) => value.includes(keyword))) return 84;
    const words = keyword.split(/\s+/).filter(Boolean);
    return words.length && values.some((value) => words.every((word) => value.includes(word))) ? 72 : 0;
  }

  private normalize(value: string) {
    return value.trim().toLocaleLowerCase().replace(/[.,()（）·]/g, " ").replace(/\s+/g, " ");
  }

  private buildCompleteModule(company: CompanyFixture, moduleCode: string) {
    const name = company.name;
    const common = { sourceType: "SQJ_GENERATED_TEST_DATABASE", sourceUpdatedAt: "2026-08-24T00:00:00Z" };
    const data: Record<string, unknown> = {
      M01: { identity: { legalName: name, localName: company.localName, registrationNumber: company.registrationNumber, country: company.country, legalForm: company.legalForm, status: company.status, foundedAt: company.foundedAt, registeredCapital: company.registeredCapital, registeredAddress: company.address, industry: company.industry } },
      M02: { contacts: [{ type: "WEBSITE", value: "https://northstar-components.example.test", confidence: 0.94 }, { type: "EMAIL", value: "compliance@northstar-components.example.test", confidence: 0.86 }], operatingAddresses: [{ address: company.address, isRegisteredAddress: true }] },
      M03: { shareholders: [{ name: "Northstar Industrial Holdings LLC", type: "COMPANY", ownershipPct: 62 }, { name: "Meridian Growth Fund II", type: "FUND", ownershipPct: 28 }, { name: "Employee Equity Pool", type: "OTHER", ownershipPct: 10 }], ultimateBeneficialOwners: [{ name: "Alex Morgan（测试数据）", ownershipPct: 31, nationality: "US" }] },
      M04: { officers: [{ name: "Emily Carter（测试数据）", role: "Chief Executive Officer", status: "ACTIVE" }, { name: "Michael Ross（测试数据）", role: "Chief Financial Officer", status: "ACTIVE" }, { name: "Daniel Lee（测试数据）", role: "Director", status: "ACTIVE" }] },
      M05: { parent: { name: "Northstar Industrial Holdings LLC", country: "US", relationship: "DIRECT_PARENT", ownershipPct: 62 }, affiliates: [{ name: "Northstar Components Asia Pte. Ltd.", country: "SG", relationship: "SUBSIDIARY", ownershipPct: 100 }, { name: "Northstar Components Europe GmbH", country: "DE", relationship: "SUBSIDIARY", ownershipPct: 80 }] },
      M06: { currency: "USD", periods: [{ year: 2025, revenue: 48200000, netIncome: 4160000, totalAssets: 35700000, totalLiabilities: 14800000 }, { year: 2024, revenue: 43900000, netIncome: 3610000, totalAssets: 32900000, totalLiabilities: 14200000 }, { year: 2023, revenue: 39800000, netIncome: 3040000, totalAssets: 30100000, totalLiabilities: 13700000 }], auditOpinion: "UNQUALIFIED" },
      M07: { summary: { courtCases: 1, enforcementRecords: 0, administrativePenalties: 0 }, records: [{ type: "COMMERCIAL_DISPUTE", filedAt: "2024-03-18", status: "CLOSED", conclusion: "SETTLED" }], complianceFlags: [] },
      M08: { screenedAt: "2026-08-24T00:00:00Z", lists: ["UN", "OFAC", "EU", "UK"], matches: [], conclusion: "NO_MATCH_FOUND_IN_TEST_SCOPE" },
      M09: { listing: null, financingRounds: [{ round: "Growth Round", announcedAt: "2022-09-12", amount: 8500000, currency: "USD", investors: ["Meridian Growth Fund II"] }], mergersAndAcquisitions: [] },
      M10: { patents: { applications: 18, grants: 11, active: 9 }, trademarks: { registered: 6, active: 6 }, domains: ["northstar-components.example.test"], cyberRisk: { rating: "LOW", exposedServices: 0 } }
    };
    return { dataState: "AVAILABLE", data: { ...common, ...(data[moduleCode] as object) } };
  }

  private async readJson<T>(file: string): Promise<T> {
    return JSON.parse(await readFile(file, "utf8")) as T;
  }
}
