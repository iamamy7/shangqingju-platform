import { Injectable, OnModuleInit } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { DatabaseService } from "../database/database.service";

type LocalizedText = { zh: string; en: string };
type HomeConfig = {
  hero: {
    badge: LocalizedText; title: LocalizedText; description: LocalizedText;
    scopeTitle: LocalizedText; scopeNote: LocalizedText; advancedLabel: LocalizedText;
    searchButton: LocalizedText; hotLabel: LocalizedText; newsLabel: LocalizedText;
    placeholders: { GLOBAL: LocalizedText; CN: LocalizedText };
    suggestions: { GLOBAL: string[]; CN: string[] };
  };
  metrics: Array<{ value: string; label: LocalizedText }>;
  discovery: {
    kicker: string; title: LocalizedText; newsCta: LocalizedText;
    trendingTitle: LocalizedText; trendingNote: LocalizedText;
    industryTitle: LocalizedText; industryNote: LocalizedText;
    insightTitle: LocalizedText; insightNote: LocalizedText;
  };
  featuredCompanyIds: string[];
  industries: Array<{ label: LocalizedText; companyId: string; note: LocalizedText; symbol: string }>;
  scenarios: {
    kicker: string; title: LocalizedText; description: LocalizedText;
    items: Array<{ tag: LocalizedText; title: LocalizedText; note: LocalizedText; icon: string; companyId: string; action: LocalizedText }>;
  };
};

type CompanyPayload = Record<string, unknown> & {
  id: string; name: string; localName?: string; country?: string; countryName?: string;
  industry?: string; status?: string;
};

const defaultConfig: HomeConfig = {
  hero: {
    badge: { zh: "全球企业情报 · 一查即明", en: "Global company intelligence · Clear at a glance" },
    title: { zh: "做生意之前，先把企业查明白", en: "Before you do business, know the company." },
    description: {
      zh: "查身份、穿透股权、识别风险、读懂经营。全球企业情报一次汇集，让合作、投资与采购更有底气。",
      en: "Verify identity, trace ownership, identify risk and understand operations—all in one place for more confident decisions."
    },
    scopeTitle: { zh: "选择数据范围", en: "Choose a database" },
    scopeNote: { zh: "全球库与国内库独立查询", en: "Global and Mainland China databases are searched independently" },
    advancedLabel: { zh: "高级筛选", en: "Advanced filters" },
    searchButton: { zh: "查一下", en: "Search" },
    hotLabel: { zh: "热门", en: "Trending" },
    newsLabel: { zh: "今日商业热闻", en: "Today's market intelligence" },
    placeholders: {
      GLOBAL: { zh: "请输入全球企业名称（中英文均可）、注册号、品牌、地址或经营范围", en: "Search global companies by name, registration number, brand, address, or business scope" },
      CN: { zh: "请输入企业名称、统一社会信用代码、品牌、地址或经营范围", en: "Search Mainland China companies by name, registration number, brand, address, or business scope" }
    },
    suggestions: {
      GLOBAL: ["Northstar Components", "Asterbridge Analytics", "Blueharbor Analytics"],
      CN: ["星桥数据科技有限公司", "蓝港数据科技有限公司", "云杉数据科技有限公司"]
    }
  },
  metrics: [
    { value: "DATABASE_COMPANY_COUNT", label: { zh: "当前测试企业主体", en: "Test company entities" } },
    { value: "33", label: { zh: "同源数据 API", en: "Data APIs" } },
    { value: "10", label: { zh: "企业调查模块", en: "Research modules" } },
    { value: "可追溯", label: { zh: "来源与数据日期", en: "Sources and data dates" } }
  ],
  discovery: {
    kicker: "BUSINESS DISCOVERY",
    title: { zh: "从热门企业，进入真实商业场景", en: "Explore real business contexts through trending companies" },
    newsCta: { zh: "阅读今日商业热闻", en: "Read today's intelligence" },
    trendingTitle: { zh: "近期热查企业", en: "Trending companies" },
    trendingNote: { zh: "根据近 30 天真实检索次数动态排序", en: "Ranked by actual searches in the last 30 days" },
    industryTitle: { zh: "热门行业与代表企业", en: "Industries and example companies" },
    industryNote: { zh: "每个入口都关联数据库中的真实测试主体", en: "Every shortcut is linked to a database entity" },
    insightTitle: { zh: "每天精选值得关注的市场信号", en: "Daily selection of consequential market signals" },
    insightNote: { zh: "公开来源核验 · 商情局独立解读 · 人工审核发布", en: "Verified sources · Independent analysis · Human reviewed" }
  },
  featuredCompanyIds: ["SQJ-DEMO-US-0001", "SQJ-SYN-CN-0001", "SQJ-SYN-CN-0002", "SQJ-SYN-CN-0003"],
  industries: [
    { label: { zh: "人工智能", en: "Artificial Intelligence" }, companyId: "SQJ-SYN-CN-0001", note: { zh: "国内测试主体", en: "Mainland China test entity" }, symbol: "AI" },
    { label: { zh: "先进制造", en: "Advanced Manufacturing" }, companyId: "SQJ-DEMO-US-0001", note: { zh: "美国测试主体", en: "United States test entity" }, symbol: "MFG" },
    { label: { zh: "企业服务", en: "Business Services" }, companyId: "SQJ-SYN-CN-0002", note: { zh: "国内测试主体", en: "Mainland China test entity" }, symbol: "B2B" },
    { label: { zh: "数据科技", en: "Data Technology" }, companyId: "SQJ-SYN-CN-0003", note: { zh: "国内测试主体", en: "Mainland China test entity" }, symbol: "DATA" }
  ],
  scenarios: {
    kicker: "DECISION SCENARIOS",
    title: { zh: "你在做什么决定？", en: "What decision are you making?" },
    description: { zh: "选择场景后，系统会带入对应企业主体并进入调查流程。", en: "Choose a scenario to start a database-backed company investigation." },
    items: [
      { tag: { zh: "跨境合作", en: "Partnership" }, title: { zh: "确认主体、股权和合规风险", en: "Verify identity, ownership and compliance" }, note: { zh: "合作前先查清对方是谁", en: "Know your counterparty before partnering" }, icon: "shield", companyId: "SQJ-DEMO-US-0001", action: { zh: "开始查询", en: "Start search" } },
      { tag: { zh: "采购准入", en: "Procurement" }, title: { zh: "核查经营、司法与履约能力", en: "Review operations, legal risk and delivery" }, note: { zh: "减少供应链合作盲区", en: "Reduce supply-chain blind spots" }, icon: "database", companyId: "SQJ-SYN-CN-0002", action: { zh: "开始查询", en: "Start search" } },
      { tag: { zh: "投资研究", en: "Investment" }, title: { zh: "串联融资、财务与控制关系", en: "Connect financing, financials and control" }, note: { zh: "从数据库信息形成投资判断", en: "Build judgment from traceable data" }, icon: "spark", companyId: "SQJ-DEMO-US-0001", action: { zh: "开始查询", en: "Start search" } },
      { tag: { zh: "求职背调", en: "Employment" }, title: { zh: "了解企业状态与经营风险", en: "Understand status and operating risk" }, note: { zh: "入职前多看一层真实情况", en: "Look one layer deeper before joining" }, icon: "user", companyId: "SQJ-SYN-CN-0001", action: { zh: "开始查询", en: "Start search" } }
    ]
  }
};

@Injectable()
export class HomePageService implements OnModuleInit {
  constructor(private readonly database: DatabaseService) {}

  onModuleInit() {
    const exists = this.database.connection.prepare("SELECT content_key FROM homepage_content WHERE content_key = 'HOME_V1'").get();
    if (!exists) {
      this.database.connection.prepare(`INSERT INTO homepage_content
        (content_key, payload_json, updated_at, updated_by) VALUES ('HOME_V1', ?, ?, 'SYSTEM_SEED')`)
        .run(JSON.stringify(defaultConfig), new Date().toISOString());
    }
  }

  getPublicPage() {
    const row = this.getConfigRow();
    const config = JSON.parse(row.payload_json) as HomeConfig;
    const companyCount = Number((this.database.connection.prepare("SELECT COUNT(*) AS count FROM companies").get() as { count: number }).count);
    const companies = this.companyMap();
    const trending = this.trendingCompanies(config.featuredCompanyIds, companies);
    return {
      ...config,
      metrics: config.metrics.map((metric) => ({ ...metric, value: metric.value === "DATABASE_COMPANY_COUNT" ? String(companyCount) : metric.value })),
      trendingCompanies: trending,
      industries: config.industries.map((item) => ({ ...item, company: companies.get(item.companyId) || null })),
      scenarios: { ...config.scenarios, items: config.scenarios.items.map((item) => ({ ...item, company: companies.get(item.companyId) || null })) },
      meta: { source: "SQLITE", updatedAt: row.updated_at, liveSearchWindowDays: 30 }
    };
  }

  getAdminPage() {
    const row = this.getConfigRow();
    return { content: JSON.parse(row.payload_json), updatedAt: row.updated_at, updatedBy: row.updated_by };
  }

  updatePage(content: HomeConfig, operator: string) {
    const now = new Date().toISOString();
    this.database.connection.prepare(`INSERT INTO homepage_content(content_key, payload_json, updated_at, updated_by)
      VALUES ('HOME_V1', ?, ?, ?) ON CONFLICT(content_key) DO UPDATE SET
      payload_json=excluded.payload_json, updated_at=excluded.updated_at, updated_by=excluded.updated_by`)
      .run(JSON.stringify(content), now, operator);
    return this.getAdminPage();
  }

  recordSearch(query: string, scope: string, candidate?: Record<string, unknown>) {
    this.database.connection.prepare(`INSERT INTO company_search_events
      (id, query_text, search_scope, company_id, company_name, match_score, queried_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(randomUUID(), query.trim(), scope, candidate?.id ? String(candidate.id) : null, candidate?.name ? String(candidate.name) : null,
        Number(candidate?.matchScore || 0), new Date().toISOString());
  }

  private getConfigRow() {
    return this.database.connection.prepare("SELECT payload_json, updated_at, updated_by FROM homepage_content WHERE content_key = 'HOME_V1'")
      .get() as { payload_json: string; updated_at: string; updated_by: string };
  }

  private companyMap() {
    const rows = this.database.connection.prepare("SELECT payload_json FROM companies").all() as unknown as Array<{ payload_json: string }>;
    return new Map(rows.map((row) => {
      const company = JSON.parse(row.payload_json) as CompanyPayload;
      return [company.id, company];
    }));
  }

  private trendingCompanies(featuredIds: string[], companies: Map<string, CompanyPayload>) {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const searched = this.database.connection.prepare(`SELECT company_id, COUNT(*) AS search_count, MAX(queried_at) AS last_searched_at
      FROM company_search_events WHERE queried_at >= ? AND company_id IS NOT NULL
      GROUP BY company_id ORDER BY search_count DESC, last_searched_at DESC LIMIT 8`).all(since) as unknown as Array<{ company_id: string; search_count: number; last_searched_at: string }>;
    const countById = new Map(searched.map((row) => [row.company_id, row]));
    const ids = [...searched.map((row) => row.company_id), ...featuredIds].filter((id, index, all) => all.indexOf(id) === index).slice(0, 4);
    return ids.map((id) => {
      const company = companies.get(id);
      if (!company) return null;
      const activity = countById.get(id);
      return { company, searchCount: Number(activity?.search_count || 0), lastSearchedAt: activity?.last_searched_at || null };
    }).filter(Boolean);
  }
}
