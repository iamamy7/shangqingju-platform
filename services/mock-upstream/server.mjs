import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
import { createMockAdapter } from "./adapters/mock-adapter.mjs";
import { createRealAdapter } from "./adapters/real-adapter.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const companyFixtureFile = process.env.MOCK_COMPANIES_FILE || "fixtures/companies.json";
const configuredCompanies = JSON.parse(await readFile(join(here, companyFixtureFile), "utf8"));
const baselineCompanies = companyFixtureFile === "fixtures/companies.json"
  ? []
  : JSON.parse(await readFile(join(here, "fixtures/companies.json"), "utf8"));
// Custom bulk fixtures extend the named demo catalog instead of replacing it.
// This keeps Northstar/Atlas examples available while the 100-company dataset is active.
const companies = [...new Map([...baselineCompanies, ...configuredCompanies].map((company) => [company.id, company])).values()];
const companyModulesFixtureFile = process.env.MOCK_COMPANY_MODULES_FILE || null;
const companyModules = companyModulesFixtureFile
  ? JSON.parse(await readFile(join(here, companyModulesFixtureFile), "utf8"))
  : {};
const modules = JSON.parse(await readFile(join(here, "fixtures/modules.json"), "utf8"));
const insightFixture = JSON.parse(await readFile(join(here, "fixtures/insights.json"), "utf8"));
const insights = expandInsightCatalog(insightFixture);
const insightItems = [...(insights.primaryMarket || []), ...(insights.secondaryMarket || [])];

const port = Number(process.env.PORT || 4190);
const host = process.env.HOST || "0.0.0.0";
const upstreamMode = process.env.UPSTREAM_MODE || "mock";
const expectedApiKey = process.env.MOCK_API_KEY || "sqj_test_2026_demo_key";
const taskDurationMs = Number(process.env.MOCK_TASK_DURATION_MS || 2200);
const mockAdapter = createMockAdapter({ companies, modules, companyModules });
const globalMockAdapter = createMockAdapter({ companies: companies.filter((company) => company.country !== "CN"), modules, companyModules });
const domesticMockAdapter = createMockAdapter({ companies: companies.filter((company) => company.country === "CN"), modules, companyModules });
const realAdapter = upstreamMode === "real" ? createRealAdapter({
  baseUrl: process.env.REAL_UPSTREAM_BASE_URL,
  apiKey: process.env.REAL_UPSTREAM_API_KEY
}) : null;

const tasks = new Map();
const reports = new Map();
const idempotency = new Map();
const orders = new Map();
const orderIdempotency = new Map();
const recharges = [];
const invoiceApplications = [];
const apiBalanceOrders = [];
let demoBalance = 568;
let demoApiBalance = 8420;

const apiProducts = [
  [1,"自然人主体信息","自然人参股公司查询","personsShareholdingCompanies","POST","/api/v1/persons/shareholding-companies",35,["直接参股","间接参股"]],
  [2,"自然人主体信息","自然人任职公司查询","personsManagementCompanies","POST","/api/v1/persons/management-companies",20,["任职公司","董事","高管","授权签字人"]],
  [3,"自然人主体信息","自然人身份识别","personsIdentityResolve","POST","/api/v1/persons/identity/resolve",3,["身份识别","企业关联"]],
  [4,"自然人主体信息","企业董监高与管理人员查询","companiesPrincipals","POST","/api/v1/companies/principals",14,["董事","高管","任职角色"]],
  [5,"主体识别与基础信息","企业公开联系方式与触点","companiesWebContactsDetail","POST","/api/v1/companies/web-contacts/detail",8,["联系方式","官方域名","社媒","职能邮箱"]],
  [6,"主体识别与基础信息","企业上市信息与GIIN代码查询M4","queryM4Data","GET","/glov2/modules/M4/data",39,["上市信息","股票代码","上市状态"]],
  [7,"主体识别与基础信息","企业搜索识别","companiesSearchResolve","POST","/api/v1/companies/search/resolve",3,["企业搜索","名称解析","匹配分数"]],
  [8,"主体识别与基础信息","企业基础档案查询","companiesProfile","POST","/api/v1/companies/profile",29,["基础档案","法律状态","业务概览","行业分类","识别编号"]],
  [9,"主体识别与基础信息","企业完整档案查询","companiesProfileFull","POST","/api/v1/companies/profile/full",188,["完整画像","多模块聚合"]],
  [10,"主体识别与基础信息","企业识别编号查询","companiesIdentifiers","POST","/api/v1/companies/identifiers",5,["企业识别编号","VAT编号","贸易登记号"]],
  [11,"主体识别与基础信息","全球实体分布查询M2","queryM2Data","GET","/glov2/modules/M2/data",69,["总部","子公司","分支机构","全球分布"]],
  [12,"主体识别与基础信息","基本信息查询M1","queryM1Data","GET","/glov2/modules/M1/data",0,["基本信息","法律状态","企业概览","行业分类","识别编号"]],
  [13,"股权、组织架构与控制权","企业股权结构查询","companiesOwnershipStructure","POST","/api/v1/companies/ownership/structure",60,["股东结构","GUO","DUO","BO","汇总统计"]],
  [14,"股权、组织架构与控制权","企业股权洞察查询","companiesOwnershipInsight","POST","/api/v1/companies/ownership/insight",45,["一级股东","受益所有人"]],
  [15,"股权、组织架构与控制权","企业关联关系查询","companiesLinkage","POST","/api/v1/companies/linkage",25,["总部","分支","子公司","集团成员"]],
  [16,"股权、组织架构与控制权","公司组织架构概览查询M5","queryM5Data","GET","/glov2/modules/M5/data",59,["管理人信息","高管学历","雇员规模"]],
  [17,"股权、组织架构与控制权","最终所有权与控制结构查询M3","queryM3Data","GET","/glov2/modules/M3/data",99,["股东","实际控制人","最终受益人"]],
  [18,"司法、合规与负面风险","企业司法合规明细","companiesLegalComplianceDetail","POST","/api/v1/companies/legal-compliance/detail",20,["司法案件","监管处罚","合规标签"]],
  [19,"司法、合规与负面风险","企业负面信号明细","companiesNegativeSignalsDetail","POST","/api/v1/companies/negative-signals/detail",25,["负面舆情","高管争议","财务困境","控制权风险"]],
  [20,"司法、合规与负面风险","企业法律事件查询","companiesLegalEvents","POST","/api/v1/companies/legal-events",35,["法律状态","注册事件","名称变更","专利诉讼"]],
  [21,"知识产权与科创资产","企业知识产权创新查询","companiesIpInnovation","POST","/api/v1/companies/ip-innovation",10,["商标","专利","创新指标","专利交易","专利估值"]],
  [22,"知识产权与科创资产","专利价值-交易-诉讼概要查询M10","queryM10Data","GET","/glov2/modules/M10/data",109,["专利信息","专利数量","专利转移","专利诉讼","专利申请人","知识产权"]],
  [23,"经营表现与财务运营","企业实时经营信号","companiesRealtimeOperations","POST","/api/v1/companies/realtime-operations",26,["实时经营画像","互联网信号"]],
  [24,"经营表现与财务运营","企业财务数据查询","companiesFinancials","POST","/api/v1/companies/financials",30,["核心财务","利润表","资产负债表"]],
  [25,"经营表现与财务运营","企业事件时间线","companiesEventsTimeline","POST","/api/v1/companies/events/timeline",15,["企业变更","并购重组","人员变动"]],
  [26,"经营表现与财务运营","企业投资地图","companiesInvestmentMap","POST","/api/v1/companies/investment-map",50,["对外投资","股权层级","并购交易"]],
  [27,"经营表现与财务运营","运营状况与财务详情查询M7","queryM7Data","GET","/glov2/modules/M7/data",129,["关键财务","资产负债表","损益表","业务条线","区域数据"]],
  [28,"经营表现与财务运营","企业招投标与采购记录","companiesTenderProcurement","POST","/api/v1/companies/tender-procurement",20,["招投标","政府采购","中标记录","供应商"]],
  [29,"国际合规与制裁筛查","制裁与相关法律风险详情查询M6","queryM6Data","GET","/glov2/modules/M6/data",129,["制裁详情","法律事件","违约风险","判决风险"]],
  [30,"国际合规与制裁筛查","企业制裁与PEP明细","companiesSanctionsDetail","POST","/api/v1/companies/sanctions/detail",52,["制裁","出口管制","UBO筛查"]],
  [31,"专项风险与交易情报","企业 KYB 尽调","companiesKybScreen","POST","/api/v1/companies/kyb/screen",20,["身份核验","法律状态","业务活动","数字足迹"]],
  [32,"专项风险与交易情报","并购交易概述查询M9","queryM9Data","GET","/glov2/modules/M9/data",89,["并购概览","并购结构","交易估值"]],
  [33,"专项风险与交易情报","网络风险评级与隐含网络威胁概述查询M8","queryM8Data","GET","/glov2/modules/M8/data",79,["网络风险","风险评级","隐含威胁","网络安全"]],
].map(([serial,group,name,code,method,endpoint,price,tags])=>({ serial,apiId:`GC-API-${String(serial).padStart(3,"0")}`,group,name,code,domain:group,method,endpoint,price,priceUnit:"元/次",tags,compatibility:["API"],status:price===0?"FREE":"AVAILABLE",billingUnit:"SUCCESS_CALL" }));

const prototypeApiUnitPrices = {
  personsShareholdingCompanies:0.10, personsManagementCompanies:0.10, personsIdentityResolve:0.05, companiesPrincipals:0.10,
  companiesWebContactsDetail:0.20, queryM4Data:0.30, companiesSearchResolve:0.05, companiesProfile:0.10,
  companiesProfileFull:1.50, companiesIdentifiers:0.05, queryM2Data:0.30, queryM1Data:0,
  companiesOwnershipStructure:0.50, companiesOwnershipInsight:0.30, companiesLinkage:0.20, queryM5Data:0.30,
  queryM3Data:0.50, companiesLegalComplianceDetail:0.30, companiesNegativeSignalsDetail:0.30, companiesLegalEvents:0.20,
  companiesIpInnovation:0.30, queryM10Data:0.80, companiesRealtimeOperations:0.50, companiesFinancials:0.30,
  companiesEventsTimeline:0.20, companiesInvestmentMap:0.50, queryM7Data:0.80, companiesTenderProcurement:0.20,
  queryM6Data:0.80, companiesSanctionsDetail:0.80, companiesKybScreen:0.50, queryM9Data:0.60, queryM8Data:0.60,
};
apiProducts.forEach((product) => { product.price = prototypeApiUnitPrices[product.code] ?? 0.10; product.status = product.price === 0 ? "FREE" : "AVAILABLE"; });

function expandInsightCatalog(data) {
  const themes = {
    COMMODITIES: ["能源与综合商品指数的分化", "化工品价格传导", "有色金属库存与需求", "黑色产业链利润变化", "农产品季节性供需", "航运成本与外贸报价", "库存周期与采购节奏", "原材料涨价传导能力", "制造企业套保与采购策略", "大宗商品周度风险清单"],
    INVEST_DAILY: ["AI 大模型的资本效率", "生物科技融资与临床里程碑", "硬科技项目的产业验证", "机器人赛道商业化节奏", "新能源项目的估值重估", "企业服务续费质量", "消费品牌渠道效率", "基金退出与并购窗口", "成长期项目估值纪律", "政策变化下的一级市场机会"],
    FINANCIAL_MARKET: ["利率预期与资产定价", "汇率波动与企业敞口", "权益市场风险偏好", "信用债利差变化", "黄金与避险需求", "波动率与仓位管理", "流动性边际变化", "股债商品跨资产信号", "宏观数据的市场映射", "金融市场周度观察清单"],
    LISTED_COMPANY: ["年报中的收入质量", "经营现金流与利润匹配", "研发投入的商业化效率", "毛利率变化的结构原因", "客户集中度与议价能力", "资产减值与风险暴露", "回购分红与资本配置", "资本开支与产能利用", "治理结构与关联交易", "上市公司年报十项核查"],
    OTHER: ["监管政策与行业边界", "供应链韧性与替代方案", "地缘风险的经营传导", "数据合规与跨境经营", "ESG 披露的业务含义", "专利与技术路线变化", "关键人才与组织稳定", "采购招标的市场信号", "审计意见与信息质量", "市场情绪与事实核验"],
  };
  const sourceByCategory = {
    COMMODITIES: ["生意社", "金十数据"],
    INVEST_DAILY: ["投中网"],
    FINANCIAL_MARKET: ["华尔街见闻", "金十数据"],
    LISTED_COMPANY: ["同花顺", "雪球"],
    OTHER: ["雪球", "同花顺"],
  };
  const primaryMarket = [...(data.primaryMarket || [])];
  const secondaryMarket = [...(data.secondaryMarket || [])];
  const all = () => [...primaryMarket, ...secondaryMarket];
  for (const [category, categoryThemes] of Object.entries(themes)) {
    const current = all().filter((item) => item.category === category);
    const seed = current[0] || all()[0];
    for (let index = current.length; index < 10; index += 1) {
      const theme = categoryThemes[index];
      const channel = category === "COMMODITIES" ? "MARKET_DATA" : category === "INVEST_DAILY" ? "PRIMARY" : "SECONDARY";
      const item = {
        ...seed,
        id: `DEMO-${category}-${String(index + 1).padStart(2, "0")}`,
        channel,
        category,
        discoveredBy: sourceByCategory[category],
        company: `${categoryThemes[0].split("的")[0]}观察`,
        ticker: category === "LISTED_COMPANY" ? "ANNUAL REPORT" : "DAILY BRIEF",
        tag: "Mock editorial sample · Human review required",
        metric: `NO.${String(index + 1).padStart(2, "0")}`,
        title: `${theme}: a structured market-intelligence checklist`,
        titleZh: `${theme}：商情局结构化观察`,
        summary: `A mock editorial brief showing how Shangqingju would verify public signals, separate facts from interpretation and list follow-up indicators for ${theme}.`,
        summaryZh: `这是一条用于联调的内容样稿，围绕“${theme}”展示商情局如何核验公开线索、区分事实与判断，并列出后续观察指标。`,
        thesis: `The value is not a single headline, but a repeatable framework for validating ${theme} with multiple public signals.`,
        thesisZh: `这条内容的价值不在单一标题，而在于用可重复的方法持续验证“${theme}”，避免把孤立信号直接当成结论。`,
        publishedAt: `2026-08-16T${String(8 + Math.floor(index / 6)).padStart(2,"0")}:${String((index * 7) % 60).padStart(2,"0")}:00+08:00`,
        sourcePublishedAt: "2026-08-16",
        keyPoints: ["Mock content for API and pagination testing.", "Public signals require source verification.", "Human review is required before production publication."],
        keyPointsZh: ["本条为 API 与分页联调使用的 Mock 内容。", "公开市场线索必须回溯原始来源核验。", "正式发布前必须由工作人员完成人工复核。"],
        article: [
          { heading:"What is known", body:`This mock article defines the facts that would need verification before drawing a conclusion about ${theme}.` },
          { heading:"How to interpret it", body:"The analysis separates observable signals from assumptions and avoids treating one data point as a complete trend." },
          { heading:"What to watch next", body:"The follow-up checklist covers source updates, cross-validation and the conditions that would invalidate the current view." }
        ],
        articleZh: [
          { heading:"先确认已经知道什么", body:`围绕“${theme}”，正式文章会先列出能够从公开材料确认的事实、数据时点与原始出处，无法核验的内容不会写成确定结论。` },
          { heading:"再解释这些信号意味着什么", body:"分析层会把可观察信号、推断和假设分开，并用其他公开数据进行交叉验证，避免用一条新闻或一个价格点概括完整趋势。" },
          { heading:"接下来应该观察什么", body:"后续观察清单包括来源更新、相反证据、变化阈值与可能推翻当前判断的条件。工作人员复核通过后，内容才会进入正式发布队列。" }
        ]
      };
      if (channel === "PRIMARY") primaryMarket.push(item); else secondaryMarket.push(item);
    }
  }
  return {
    ...data,
    primaryMarket,
    secondaryMarket,
    edition: { ...(data.edition || {}), scannedCount: Math.max(142, data.edition?.scannedCount || 0), selectedCount: primaryMarket.length + secondaryMarket.length, targetCount: 50 }
  };
}

const scenarioCatalog = [
  { code: "default", description: "正常响应，由固定数据决定 dataState" },
  { code: "no-record", description: "200 + NO_RECORD，有效但无记录" },
  { code: "partial", description: "200 + PARTIAL，包含缺失字段" },
  { code: "ambiguous", description: "200 + AMBIGUOUS，需人工确认主体" },
  { code: "no-coverage", description: "422 + NO_COVERAGE，不可售不计费" },
  { code: "provider-error", description: "503 + PROVIDER_ERROR，可重试不计费" },
  { code: "slow", description: "额外等待 1200ms，用于验证 loading 与超时" }
];

function now() { return new Date().toISOString(); }
function normalizeInvoice(input, type = "VAT_ORDINARY") {
  const source = input && typeof input === "object" ? input : {};
  return {
    type: type === "VAT_SPECIAL" ? "VAT_SPECIAL" : "VAT_ORDINARY",
    title: String(source.title || "").trim() || null,
    taxId: String(source.taxId || "").trim() || null,
    registeredAddress: String(source.registeredAddress || "").trim() || null,
    registeredPhone: String(source.registeredPhone || "").trim() || null,
    bankName: String(source.bankName || "").trim() || null,
    bankAccount: String(source.bankAccount || "").trim() || null,
    email: String(source.email || "").trim() || null,
  };
}
function missingInvoiceFields(invoice) {
  const required = invoice.type === "VAT_SPECIAL"
    ? ["title", "taxId", "registeredAddress", "registeredPhone", "bankName", "bankAccount", "email"]
    : ["title", "email"];
  return required.filter((field) => !invoice[field]);
}
function requestMeta(req) {
  const requestId = req.headers["x-request-id"] || randomUUID();
  return { requestId, traceId: `trace_${requestId}`, queryAt: now() };
}
function envelope(meta, result, extra = {}) {
  return {
    ...meta,
    dataState: result.dataState,
    sourceUpdatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    cacheHit: false,
    billable: Boolean(result.billable),
    provider: { mode: upstreamMode.toUpperCase(), code: upstreamMode === "mock" ? "MOCK_PROVIDER" : "REAL_UPSTREAM" },
    data: result.data ?? null,
    ...extra
  };
}
function send(res, status, payload, headers = {}) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "Content-Type, X-API-Key, X-Request-Id, X-Mock-Scenario, Idempotency-Key",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "x-mock-upstream": upstreamMode === "mock" ? "true" : "false",
    ...headers
  });
  res.end(body);
}
function sendError(req, res, status, code, message, dataState = "SYSTEM_ERROR") {
  const meta = requestMeta(req);
  send(res, status, envelope(meta, { dataState, billable: false, data: null }, { error: { code, message } }));
}
async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return null;
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new Error("INVALID_JSON"); }
}
function authenticate(req, res) {
  if (req.headers["x-api-key"] !== expectedApiKey) {
    sendError(req, res, 401, "UNAUTHORIZED", "请通过 HTTPS 请求头 X-API-Key 提交有效的商情局 API Key。");
    return false;
  }
  return true;
}
async function applyScenario(req, res) {
  const scenario = String(req.headers["x-mock-scenario"] || "default");
  if (scenario === "slow") await new Promise((resolve) => setTimeout(resolve, 1200));
  if (scenario === "provider-error") {
    sendError(req, res, 503, "MOCK_PROVIDER_UNAVAILABLE", "演示上游服务不可用，请稍后重试。", "PROVIDER_ERROR");
    return { handled: true, scenario };
  }
  if (scenario === "no-coverage") {
    sendError(req, res, 422, "MOCK_NO_COVERAGE", "当前国家或模块无可靠覆盖。", "NO_COVERAGE");
    return { handled: true, scenario };
  }
  return { handled: false, scenario };
}
function forceScenario(result, scenario) {
  if (scenario === "no-record") return { dataState: "NO_RECORD", billable: true, data: { ...result.data, records: [], forcedScenario: scenario } };
  if (scenario === "partial") return { dataState: "PARTIAL", billable: true, data: { ...result.data, missingFields: ["mock.forced.missingField"], forcedScenario: scenario } };
  if (scenario === "ambiguous") return { dataState: "AMBIGUOUS", billable: false, data: { ...result.data, requiresManualConfirmation: true, forcedScenario: scenario } };
  return result;
}
function taskView(task) {
  const elapsed = Date.now() - task.createdAt;
  const progress = Math.min(100, Math.round(elapsed / taskDurationMs * 100));
  const status = progress >= 100 ? "COMPLETED" : progress < 15 ? "QUEUED" : "RUNNING";
  return {
    taskId: task.id,
    reportId: task.reportId,
    companyId: task.companyId,
    modules: task.moduleCodes,
    status,
    progress,
    createdAt: new Date(task.createdAt).toISOString(),
    completedAt: status === "COMPLETED" ? new Date(task.createdAt + taskDurationMs).toISOString() : null
  };
}
function orderView(order) {
  return {
    orderId: order.id,
    customerId: order.customerId,
    companyId: order.companyId,
    modules: order.moduleCodes,
    amount: order.amount,
    currency: "CNY",
    status: order.status,
    payment: order.payment || null,
    invoice: order.invoice,
    createdAt: order.createdAt,
    paidAt: order.payment?.paidAt || null
  };
}
async function ensureReport(task) {
  if (reports.has(task.reportId)) return reports.get(task.reportId);
  const company = mockAdapter.getCompany(task.companyId);
  const chapters = task.moduleCodes.map((code) => mockAdapter.getModule(task.companyId, code));
  const report = {
    reportId: task.reportId,
    taskId: task.id,
    version: "V1",
    generatedAt: now(),
    company,
    chapters: chapters.map((chapter) => chapter.data),
    chapterStates: Object.fromEntries(chapters.map((chapter) => [chapter.data.module.code, chapter.dataState])),
    executiveSummary: {
      facts: ["主体识别已完成", "报告仅包含已请求模块"],
      attention: chapters.filter((chapter) => ["PARTIAL", "NO_COVERAGE"].includes(chapter.dataState)).map((chapter) => `${chapter.data.module.code} ${chapter.dataState}`),
      disclaimer: "全部内容为合成测试数据。"
    }
  };
  reports.set(task.reportId, report);
  return report;
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, {});
  const url = new URL(req.url, `http://${req.headers.host || `localhost:${port}`}`);

  if (url.pathname === "/" || url.pathname === "/docs") {
    const template = await readFile(join(here, "portal.html"), "utf8");
    const body = template
      .replaceAll("{{MODE}}", upstreamMode.toUpperCase())
      .replaceAll("{{COUNT}}", String(companies.length))
      .replaceAll("{{PORT}}", String(port));
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "content-length": Buffer.byteLength(body) });
    return res.end(body);
  }
  if (url.pathname === "/health") {
    return send(res, 200, {
      status: "UP",
      mode: upstreamMode,
      fixtureCompanies: companies.length,
      companyFixtureFile,
      fixtureCompanyModules: Object.keys(companyModules).length,
      companyModulesFixtureFile,
      providers: {
        global: { code: "MOCK_GLOBAL_PROVIDER", fixtureCompanies: companies.filter((company) => company.country !== "CN").length },
        domestic: { code: "MOCK_DOMESTIC_PROVIDER", fixtureCompanies: companies.filter((company) => company.country === "CN").length }
      },
      startedAt: server.startedAt
    });
  }
  if (url.pathname === "/openapi.yaml") {
    const body = await readFile(join(here, "openapi.yaml"), "utf8");
    res.writeHead(200, { "content-type": "application/yaml; charset=utf-8", "access-control-allow-origin": "*" });
    return res.end(body);
  }
  if (!url.pathname.startsWith("/open/v1/")) return sendError(req, res, 404, "NOT_FOUND", "路径不存在。");
  if (!authenticate(req, res)) return;

  let body = null;
  try { body = await readBody(req); }
  catch { return sendError(req, res, 400, "INVALID_JSON", "请求体不是有效 JSON。"); }

  if (upstreamMode === "real") {
    try {
      const forwarded = await realAdapter.forward({ method: req.method, pathname: url.pathname, search: url.search, body, headers: req.headers });
      return send(res, forwarded.status, forwarded.payload);
    } catch (error) {
      return sendError(req, res, 502, "REAL_UPSTREAM_FAILED", error.message, "PROVIDER_ERROR");
    }
  }

  const scenarioResult = await applyScenario(req, res);
  if (scenarioResult.handled) return;
  const meta = requestMeta(req);

  if (req.method === "GET" && url.pathname === "/open/v1/mock/scenarios") {
    return send(res, 200, envelope(meta, { dataState: "AVAILABLE", billable: false, data: scenarioCatalog }));
  }
  if (req.method === "GET" && url.pathname === "/open/v1/markets") {
    return send(res, 200, envelope(meta, { dataState: "AVAILABLE", billable: false, data: mockAdapter.getMarkets() }));
  }
  if (req.method === "GET" && url.pathname === "/open/v1/insights") {
    return send(res, 200, envelope(meta, { dataState: "AVAILABLE", billable: false, data: insights }, {
      provider: { mode: upstreamMode.toUpperCase(), code: "MOCK_PUBLIC_DISCLOSURE_AGGREGATOR", scope: "PUBLIC_SOURCES" }
    }));
  }
  let insightMatch = url.pathname.match(/^\/open\/v1\/insights\/([^/]+)$/);
  if (req.method === "GET" && insightMatch) {
    const article = insightItems.find((item) => item.id === decodeURIComponent(insightMatch[1]));
    if (!article) return sendError(req, res, 404, "INSIGHT_NOT_FOUND", "资讯文章不存在。", "NO_RECORD");
    return send(res, 200, envelope(meta, { dataState: "AVAILABLE", billable: false, data: article }, {
      provider: { mode: upstreamMode.toUpperCase(), code: "MOCK_EDITORIAL_CONTENT_SERVICE", scope: article.channel }
    }));
  }
  if (req.method === "GET" && url.pathname === "/open/v1/admin/insight-agent") {
    return send(res, 200, envelope(meta, { dataState: "AVAILABLE", billable: false, data: {
      agent: insights.agent,
      edition: insights.edition,
      sources: insights.discoverySources || [],
      queue: insightItems.map((item) => ({ id: item.id, channel: item.channel, category: item.category, discoveredBy: item.discoveredBy || [], title: item.titleZh, source: item.sourceZh, reviewStatus: "HUMAN_APPROVED", publishStatus: "PUBLISHED", publishedAt: item.publishedAt }))
    } }, { provider: { mode: "MOCK", code: "MOCK_MARKET_INTELLIGENCE_AGENT", scope: "EDITORIAL_ADMIN" } }));
  }
  if (req.method === "POST" && url.pathname === "/open/v1/admin/insight-agent/runs") {
    return send(res, 202, envelope(meta, { dataState: "AVAILABLE", billable: false, data: {
      runId: `INSIGHT-RUN-${randomUUID().slice(0, 8).toUpperCase()}`,
      status: "RUNNING",
      targetCount: insights.edition?.targetCount || 5,
      workflow: insights.agent?.workflow || [],
      startedAt: now()
    } }, { provider: { mode: "MOCK", code: "MOCK_MARKET_INTELLIGENCE_AGENT", scope: "EDITORIAL_ADMIN" } }));
  }
  if (req.method === "POST" && url.pathname === "/open/v1/auth/sms-codes") {
    const mobile = String(body?.mobile || "").trim();
    if (!/^1\d{10}$/.test(mobile)) return sendError(req, res, 400, "INVALID_MOBILE", "请输入正确的 11 位手机号。");
    return send(res, 202, envelope(meta, { dataState: "AVAILABLE", billable: false, data: {
      challengeId: `SMS-${randomUUID().slice(0, 8).toUpperCase()}`,
      mobileMasked: `${mobile.slice(0,3)}****${mobile.slice(-4)}`,
      expiresIn: 300,
      demoCode: "123456"
    } }, { provider: { mode: "MOCK", code: "MOCK_AUTH_PROVIDER", scope: "SMS" } }));
  }
  if (req.method === "POST" && url.pathname === "/open/v1/auth/sessions") {
    const method = String(body?.method || "SMS").toUpperCase();
    const smsValid = method === "SMS" && /^1\d{10}$/.test(String(body?.mobile || "")) && String(body?.code || "") === "123456";
    const wechatValid = method === "WECHAT" && body?.qrToken === "demo-wechat-qr";
    if (!smsValid && !wechatValid) return sendError(req, res, 401, "AUTH_FAILED", "验证码不正确或微信二维码已失效。");
    return send(res, 200, envelope(meta, { dataState: "AVAILABLE", billable: false, data: {
      sessionId: `SESSION-${randomUUID().slice(0, 8).toUpperCase()}`,
      accessToken: "mock_access_token_not_for_production",
      loginMethod: method,
      customer: { id: "CUS-DEMO-0001", mobileMasked: "138****8888", wechatBound: method === "WECHAT" },
      expiresIn: 7200
    } }, { provider: { mode: "MOCK", code: "MOCK_AUTH_PROVIDER", scope: method } }));
  }
  if (req.method === "GET" && url.pathname === "/open/v1/api-products") {
    return send(res, 200, envelope(meta, { dataState:"AVAILABLE", billable:false, data:{ items:apiProducts, total:apiProducts.length, pricing:{ currency:"CNY", unit:"元/次", rule:"当前为可配置的原型调用单价，按 isCost 计费标记扣减 API 余额" } } }, {
      provider:{ mode:"MOCK", code:"MOCK_API_CATALOG", scope:"PURCHASE_AND_USE" }
    }));
  }
  const apiProductMatch = url.pathname.match(/^\/open\/v1\/api-products\/([^/]+)$/);
  if (req.method === "GET" && apiProductMatch) {
    const code = decodeURIComponent(apiProductMatch[1]);
    const product = apiProducts.find((item) => item.code === code);
    if (!product) return sendError(req, res, 404, "API_PRODUCT_NOT_FOUND", "API 商品不存在。", "NO_RECORD");
    return send(res, 200, envelope(meta, { dataState:"AVAILABLE", billable:false, data:{ ...product, authentication:"X-API-Key request header over HTTPS", responseFormat:"application/json", commonFields:["code","errorCode","msg","isCost","requestId","data"], trialBalance:200, sourceSystem:"GLOBALCHECK", upstreamAuthentication:"SERVER_SIDE_PROVIDER_ADAPTER" } }, {
      provider:{ mode:"MOCK", code:"MOCK_API_CATALOG", scope:"PRODUCT_DETAIL" }
    }));
  }
  if (req.method === "POST" && url.pathname === "/open/v1/api-balance-orders") {
    const customerId = String(body?.customerId || "");
    const amount = Number(body?.amount);
    const method = String(body?.method || "").toUpperCase();
    const allowedAmounts = new Set([200,800,2500]);
    if (!/^CUS-[A-Z0-9-]+$/.test(customerId)) return sendError(req, res, 400, "INVALID_CUSTOMER", "customerId 必须是有效测试客户。");
    if (!allowedAmounts.has(amount)) return sendError(req, res, 400, "INVALID_API_BALANCE_AMOUNT", "API 充值金额必须是 200、800 或 2500 元。");
    if (!["WECHAT","ALIPAY","BANK_TRANSFER"].includes(method)) return sendError(req, res, 400, "INVALID_PAYMENT_METHOD", "支付方式必须是 WECHAT、ALIPAY 或 BANK_TRANSFER。");
    demoApiBalance += amount;
    const order = { balanceOrderId:`SQJ-API-${randomUUID().slice(0,8).toUpperCase()}`, customerId, apiCode:body?.apiCode || null, amount, creditedAmount:amount, currency:"CNY", method, status:"PAID", balance:demoApiBalance, paidAt:now(), demo:true, integrationMode:"MOCK_EXAMPLE", replaceWithRealProvider:true };
    apiBalanceOrders.push(order);
    return send(res, 201, envelope(meta, { dataState:"AVAILABLE", billable:false, data:order }, {
      provider:{ mode:"MOCK", code:"MOCK_API_BILLING", scope:method }
    }), { location:`/open/v1/api-balance-orders/${order.balanceOrderId}` });
  }
  let apiWalletMatch = url.pathname.match(/^\/open\/v1\/customers\/([^/]+)\/api-wallet$/);
  if (req.method === "GET" && apiWalletMatch) {
    const customerId = decodeURIComponent(apiWalletMatch[1]);
    if (!/^CUS-[A-Z0-9-]+$/.test(customerId)) return sendError(req, res, 404, "CUSTOMER_NOT_FOUND", "客户不存在。", "NO_RECORD");
    return send(res, 200, envelope(meta, { dataState:"AVAILABLE", billable:false, data:{ customerId, balance:demoApiBalance, currency:"CNY", unit:"YUAN", recentOrders:apiBalanceOrders.filter((order)=>order.customerId===customerId).slice(-10).reverse() } }, {
      provider:{ mode:"MOCK", code:"MOCK_API_BILLING", scope:"WALLET" }
    }));
  }
  let walletMatch = url.pathname.match(/^\/open\/v1\/customers\/([^/]+)\/wallet$/);
  if (req.method === "GET" && walletMatch) {
    const customerId = decodeURIComponent(walletMatch[1]);
    if (!/^CUS-[A-Z0-9-]+$/.test(customerId)) return sendError(req, res, 404, "CUSTOMER_NOT_FOUND", "客户不存在。", "NO_RECORD");
    return send(res, 200, envelope(meta, { dataState: "AVAILABLE", billable: false, data: {
      customerId,
      balance: demoBalance,
      currency: "CNY",
      rechargeMethods: ["WECHAT", "ALIPAY", "BANK_TRANSFER"],
      recentTransactions: recharges.slice(-10).reverse()
    } }, { provider: { mode: "MOCK", code: "MOCK_WALLET_SERVICE", scope: "BALANCE" } }));
  }
  walletMatch = url.pathname.match(/^\/open\/v1\/customers\/([^/]+)\/wallet\/recharges$/);
  if (req.method === "POST" && walletMatch) {
    const customerId = decodeURIComponent(walletMatch[1]);
    const amount = Number(body?.amount);
    const method = String(body?.method || "").toUpperCase();
    if (!/^CUS-[A-Z0-9-]+$/.test(customerId)) return sendError(req, res, 404, "CUSTOMER_NOT_FOUND", "客户不存在。", "NO_RECORD");
    if (!Number.isFinite(amount) || amount <= 0 || amount > 10000) return sendError(req, res, 400, "INVALID_RECHARGE_AMOUNT", "充值金额必须大于 0 且不超过 10000 元。");
    if (!["WECHAT", "ALIPAY", "BANK_TRANSFER"].includes(method)) return sendError(req, res, 400, "INVALID_RECHARGE_METHOD", "充值方式必须是 WECHAT、ALIPAY 或 BANK_TRANSFER。");
    demoBalance += amount;
    const recharge = { rechargeId:`SQJ-CHG-${randomUUID().slice(0,8).toUpperCase()}`, customerId, amount, currency:"CNY", method, status:"PAID", paidAt:now(), demo:true, integrationMode:"MOCK_EXAMPLE", replaceWithRealProvider:true };
    recharges.push(recharge);
    return send(res, 200, envelope(meta, { dataState: "AVAILABLE", billable: false, data: { ...recharge, balance: demoBalance } }, {
      provider: { mode: "MOCK", code: "MOCK_WALLET_SERVICE", scope: method }
    }));
  }
  if (req.method === "POST" && url.pathname === "/open/v1/orders") {
    const customerId = String(body?.customerId || "");
    const company = mockAdapter.getCompany(body?.companyId);
    const moduleCodes = Array.isArray(body?.modules) ? [...new Set(body.modules)] : [];
    const amount = Number(body?.amount);
    if (!/^CUS-[A-Z0-9-]+$/.test(customerId) || !company || !moduleCodes.length || moduleCodes.some((code) => !modules[code]) || !Number.isFinite(amount) || amount <= 0) {
      return sendError(req, res, 400, "INVALID_ORDER_REQUEST", "customerId、companyId、modules 和 amount 必须是有效测试值。");
    }
    const uncovered = moduleCodes.filter((code) => mockAdapter.getModule(company.id, code).dataState === "NO_COVERAGE");
    if (uncovered.length) return sendError(req, res, 422, "MODULE_NOT_SELLABLE", `${uncovered.join(", ")} 当前无覆盖，不能创建订单。`, "NO_COVERAGE");
    const idemKey = req.headers["idempotency-key"];
    if (idemKey && orderIdempotency.has(idemKey)) {
      const existing = orders.get(orderIdempotency.get(idemKey));
      return send(res, 200, envelope(meta, { dataState: "AVAILABLE", billable: false, data: orderView(existing) }, { idempotentReplay: true }));
    }
    const invoiceType = body?.invoiceType === "VAT_SPECIAL" ? "VAT_SPECIAL" : "VAT_ORDINARY";
    const normalizedInvoice = normalizeInvoice(body?.invoice, invoiceType);
    const invoiceMissing = body?.invoiceRequested ? missingInvoiceFields(normalizedInvoice) : [];
    if (invoiceMissing.length) {
      return sendError(req, res, 400, invoiceType === "VAT_SPECIAL" ? "INCOMPLETE_SPECIAL_INVOICE_PROFILE" : "INCOMPLETE_INVOICE_PROFILE", `开票资料不完整，缺少：${invoiceMissing.join(", ")}。`);
    }
    const invoice = body?.invoiceRequested
      ? { ...normalizedInvoice, status: "PENDING_PAYMENT" }
      : { type: invoiceType, status: "NOT_REQUESTED" };
    const order = {
      id: `SQJ-ORD-${randomUUID().slice(0, 8).toUpperCase()}`,
      customerId,
      companyId: company.id,
      moduleCodes,
      amount,
      status: "PENDING_PAYMENT",
      invoice,
      createdAt: now()
    };
    orders.set(order.id, order);
    if (idemKey) orderIdempotency.set(idemKey, order.id);
    return send(res, 201, envelope(meta, { dataState: "AVAILABLE", billable: false, data: orderView(order) }, {
      provider: { mode: "MOCK", code: "MOCK_ORDER_SERVICE", scope: "CHECKOUT" }
    }), { location: `/open/v1/orders/${order.id}` });
  }
  let orderMatch = url.pathname.match(/^\/open\/v1\/orders\/([^/]+)$/);
  if (req.method === "GET" && orderMatch) {
    const order = orders.get(decodeURIComponent(orderMatch[1]));
    if (!order) return sendError(req, res, 404, "ORDER_NOT_FOUND", "订单不存在或服务已重启。", "NO_RECORD");
    return send(res, 200, envelope(meta, { dataState: "AVAILABLE", billable: false, data: orderView(order) }, {
      provider: { mode: "MOCK", code: "MOCK_ORDER_SERVICE", scope: "ORDER" }
    }));
  }
  orderMatch = url.pathname.match(/^\/open\/v1\/orders\/([^/]+)\/payments$/);
  if (req.method === "POST" && orderMatch) {
    const order = orders.get(decodeURIComponent(orderMatch[1]));
    const method = String(body?.method || "").toUpperCase();
    const allowedMethods = ["WECHAT", "ALIPAY", "BALANCE", "BANK_TRANSFER"];
    if (!order) return sendError(req, res, 404, "ORDER_NOT_FOUND", "订单不存在或服务已重启。", "NO_RECORD");
    if (!allowedMethods.includes(method)) return sendError(req, res, 400, "INVALID_PAYMENT_METHOD", "支付方式必须是 WECHAT、ALIPAY、BALANCE 或 BANK_TRANSFER。");
    if (method === "BALANCE" && order.amount > demoBalance) return sendError(req, res, 409, "INSUFFICIENT_BALANCE", "演示账户余额不足。");
    if (!order.payment) {
      order.payment = {
        paymentId: `SQJ-PAY-${randomUUID().slice(0, 8).toUpperCase()}`,
        method,
        status: "PAID",
        paidAt: now(),
        demo: true,
        integrationMode: "MOCK_EXAMPLE",
        replaceWithRealProvider: true
      };
      if (method === "BALANCE") demoBalance -= order.amount;
      order.status = "PAID";
    }
    return send(res, 200, envelope(meta, { dataState: "AVAILABLE", billable: false, data: {
      ...order.payment,
      orderId: order.id,
      amount: order.amount,
      currency: "CNY",
      balance: demoBalance,
      invoice: order.invoice
    } }, { provider: { mode: "MOCK", code: "MOCK_PAYMENT_SERVICE", scope: method } }));
  }
  if (req.method === "POST" && url.pathname === "/open/v1/invoice-applications") {
    const customerId = String(body?.customerId || "");
    const orderIds = Array.isArray(body?.orderIds) ? [...new Set(body.orderIds.map((id) => String(id)))] : [];
    const invoiceType = body?.invoiceType === "VAT_SPECIAL" ? "VAT_SPECIAL" : "VAT_ORDINARY";
    const invoice = normalizeInvoice(body?.invoice, invoiceType);
    const missing = missingInvoiceFields(invoice);
    const allowedOrderIds = orderIds.filter((id) => orders.has(id) || /^SQJ-ORD-DEMO-\d+$/.test(id));
    if (!/^CUS-[A-Z0-9-]+$/.test(customerId) || !orderIds.length || allowedOrderIds.length !== orderIds.length) {
      return sendError(req, res, 400, "INVALID_INVOICE_APPLICATION", "customerId 和至少一笔可开票订单必须有效。");
    }
    const alreadyApplied = orderIds.filter((orderId) => invoiceApplications.some((application) => application.orderIds.includes(orderId)));
    if (alreadyApplied.length) return sendError(req, res, 409, "INVOICE_ALREADY_APPLIED", `订单 ${alreadyApplied.join(", ")} 已提交开票申请，不能重复申请。`);
    const unpaid = orderIds.map((id) => orders.get(id)).filter((order) => order && order.status !== "PAID");
    if (unpaid.length) return sendError(req, res, 409, "ORDER_NOT_PAID", "只能对已支付订单申请开票。");
    if (missing.length) return sendError(req, res, 400, invoiceType === "VAT_SPECIAL" ? "INCOMPLETE_SPECIAL_INVOICE_PROFILE" : "INCOMPLETE_INVOICE_PROFILE", `开票资料不完整，缺少：${missing.join(", ")}。`);
    const liveAmount = orderIds.map((id) => orders.get(id)?.amount || 0).reduce((sum, amount) => sum + amount, 0);
    const requestedAmount = Number(body?.amount);
    const application = {
      applicationId: `SQJ-INV-${randomUUID().slice(0, 8).toUpperCase()}`,
      customerId,
      orderIds,
      orderCount: orderIds.length,
      merge: orderIds.length > 1,
      amount: liveAmount || (Number.isFinite(requestedAmount) ? requestedAmount : 0),
      currency: "CNY",
      invoice: { ...invoice, status: "PENDING_ISSUE" },
      source: body?.source === "CHECKOUT" ? "CHECKOUT" : "ACCOUNT_CENTER",
      status: "PENDING_ISSUE",
      submittedAt: now(),
      integrationMode: "MOCK_EXAMPLE",
      replaceWithRealProvider: true,
    };
    invoiceApplications.push(application);
    orderIds.forEach((id) => {
      const order = orders.get(id);
      if (order) {
        order.invoice = application.invoice;
        order.invoiceApplicationId = application.applicationId;
      }
    });
    return send(res, 201, envelope(meta, { dataState: "AVAILABLE", billable: false, data: application }, {
      provider: { mode: "MOCK", code: "MOCK_INVOICE_SERVICE", scope: application.merge ? "MERGED" : application.source }
    }), { location: `/open/v1/invoice-applications/${application.applicationId}` });
  }
  const scopedSearch = url.pathname.match(/^\/open\/v1\/(global|domestic)\/companies\/search$/);
  if (req.method === "GET" && (scopedSearch || url.pathname === "/open/v1/companies/search")) {
    const q = url.searchParams.get("q");
    if (!q) return sendError(req, res, 400, "QUERY_REQUIRED", "q 不能为空。");
    const scope = scopedSearch?.[1] || "global";
    const adapter = scope === "domestic" ? domesticMockAdapter : globalMockAdapter;
    const country = scope === "domestic" ? "CN" : url.searchParams.get("country");
    const result = forceScenario(adapter.searchCompanies({ q, country, dataSource: scope.toUpperCase() }), scenarioResult.scenario);
    const provider = { mode: upstreamMode.toUpperCase(), code: scope === "domestic" ? "MOCK_DOMESTIC_PROVIDER" : "MOCK_GLOBAL_PROVIDER", scope: scope.toUpperCase() };
    return send(res, 200, envelope(meta, result, { provider }));
  }

  let match = url.pathname.match(/^\/open\/v1\/companies\/([^/]+)\/basic$/);
  if (req.method === "GET" && match) {
    const result = mockAdapter.getModule(decodeURIComponent(match[1]), "M01");
    if (!result) return sendError(req, res, 404, "COMPANY_NOT_FOUND", "演示主体不存在。", "NO_RECORD");
    return send(res, 200, envelope(meta, forceScenario(result, scenarioResult.scenario)));
  }
  match = url.pathname.match(/^\/open\/v1\/companies\/([^/]+)\/modules\/(M\d{2})$/);
  if (req.method === "GET" && match) {
    const result = mockAdapter.getModule(decodeURIComponent(match[1]), match[2]);
    if (!result) return sendError(req, res, 404, "COMPANY_OR_MODULE_NOT_FOUND", "演示主体或模块不存在。", "NO_RECORD");
    const forced = forceScenario(result, scenarioResult.scenario);
    const status = forced.dataState === "NO_COVERAGE" ? 422 : 200;
    return send(res, status, envelope(meta, forced));
  }

  if (req.method === "POST" && url.pathname === "/open/v1/report-tasks") {
    const company = mockAdapter.getCompany(body?.companyId);
    const moduleCodes = Array.isArray(body?.modules) ? [...new Set(body.modules)] : [];
    if (!company || !moduleCodes.length || moduleCodes.some((code) => !modules[code])) {
      return sendError(req, res, 400, "INVALID_REPORT_REQUEST", "companyId 和 modules 必须是有效测试值。");
    }
    const uncovered = moduleCodes.filter((code) => mockAdapter.getModule(company.id, code).dataState === "NO_COVERAGE");
    if (uncovered.length) return sendError(req, res, 422, "MODULE_NOT_SELLABLE", `${uncovered.join(", ")} 当前无覆盖，不能创建报告任务。`, "NO_COVERAGE");

    const idemKey = req.headers["idempotency-key"];
    if (idemKey && idempotency.has(idemKey)) {
      const existing = tasks.get(idempotency.get(idemKey));
      return send(res, 200, envelope(meta, { dataState: "AVAILABLE", billable: false, data: taskView(existing) }, { idempotentReplay: true }));
    }
    const id = `SQJ-TASK-${randomUUID().slice(0, 8).toUpperCase()}`;
    const task = { id, reportId: `SQJ-RPT-${randomUUID().slice(0, 8).toUpperCase()}`, companyId: company.id, moduleCodes, createdAt: Date.now() };
    tasks.set(id, task);
    if (idemKey) idempotency.set(idemKey, id);
    return send(res, 202, envelope(meta, { dataState: "AVAILABLE", billable: true, data: taskView(task) }), { location: `/open/v1/report-tasks/${id}` });
  }

  match = url.pathname.match(/^\/open\/v1\/report-tasks\/([^/]+)$/);
  if (req.method === "GET" && match) {
    const task = tasks.get(decodeURIComponent(match[1]));
    if (!task) return sendError(req, res, 404, "TASK_NOT_FOUND", "任务不存在或服务已重启。", "NO_RECORD");
    const view = taskView(task);
    if (view.status === "COMPLETED") await ensureReport(task);
    return send(res, 200, envelope(meta, { dataState: "AVAILABLE", billable: false, data: view }));
  }

  match = url.pathname.match(/^\/open\/v1\/reports\/([^/]+)$/);
  if (req.method === "GET" && match) {
    const report = reports.get(decodeURIComponent(match[1]));
    if (!report) return sendError(req, res, 404, "REPORT_NOT_READY", "报告不存在或尚未生成。", "NO_RECORD");
    return send(res, 200, envelope(meta, { dataState: "AVAILABLE", billable: false, data: report }));
  }

  match = url.pathname.match(/^\/open\/v1\/reports\/([^/]+)\/questions$/);
  if (req.method === "POST" && match) {
    const report = reports.get(decodeURIComponent(match[1]));
    const question = String(body?.question || "").trim();
    if (!report) return sendError(req, res, 404, "REPORT_NOT_FOUND", "报告不存在。", "NO_RECORD");
    if (!question) return sendError(req, res, 400, "QUESTION_REQUIRED", "question 不能为空。");
    let answer = "当前已购报告没有足够证据回答该问题，Mock AI 不会联网或猜测。";
    let citation = { chapter: "00", path: "executiveSummary.disclaimer", quote: "全部内容为合成测试数据" };
    if (/制裁|名单/.test(question)) {
      answer = "M08 的合成筛查结果为 NO_RECORD：在列明的测试名单和查询时点内未发现命中，不代表未来永久无风险。";
      citation = { chapter: "M08", path: "result.conclusion", quote: "NO_MATCH_FOUND_IN_DECLARED_TEST_SCOPE" };
    } else if (/股东|控制|受益/.test(question)) {
      answer = "M03 显示演示直接股东持股 82%，但最终受益人披露不完整，应补充官方登记或合规文件。";
      citation = { chapter: "M03", path: "result.disclosure", quote: "PARTIAL_UBO_DISCLOSURE" };
    }
    return send(res, 200, envelope(meta, { dataState: "AVAILABLE", billable: true, data: { question, answer, citations: [citation], model: "MOCK_RULE_BASED", groundedOnly: true } }));
  }

  return sendError(req, res, 404, "NOT_FOUND", "路径不存在。");
});

server.startedAt = now();
server.listen(port, host, () => {
  console.log(`商情局 Mock API running on ${host}:${port} (local: http://127.0.0.1:${port})`);
  console.log(`mode=${upstreamMode} auth=X-API-Key`);
});
