const app = document.querySelector("#app");
const toastRegion = document.querySelector("#toast-region");

const modules = [
  {
    code: "M01",
    name: "企业基础与注册",
    short: "确认主体是谁、是否仍在经营",
    price: 39,
    state: "AVAILABLE",
    coverage: "完整",
    fields: ["当地语言名称", "注册号", "法律形式", "经营状态", "注册地址"],
    source: "basicInfo.nameLocalLanguage · basicInfo.status",
    tone: "teal",
  },
  {
    code: "M02",
    name: "联系与经营信息",
    short: "了解官网、经营地址与主营业务",
    price: 29,
    state: "PARTIAL",
    coverage: "部分",
    fields: ["官方网站", "经营地址", "主营业务", "员工规模", "主要市场"],
    source: "contact_information · industry_and_activities",
    tone: "blue",
  },
  {
    code: "M03",
    name: "股东与控制权",
    short: "识别股东、控制链与最终受益人",
    price: 89,
    state: "AVAILABLE",
    coverage: "完整",
    fields: ["直接股东", "持股比例", "控制路径", "最终所有者", "实际受益人"],
    source: "share_holders · subsidiariesandpe_ownership",
    tone: "amber",
  },
  {
    code: "M04",
    name: "董事与管理层",
    short: "核对董事、高管和治理结构",
    price: 49,
    state: "AVAILABLE",
    coverage: "完整",
    fields: ["董事", "高管", "法定代表人", "任职状态", "任职变化"],
    source: "directors_and_managers",
    tone: "violet",
  },
  {
    code: "M05",
    name: "集团与关联企业",
    short: "梳理总部、分支与全球关联网络",
    price: 69,
    state: "AVAILABLE",
    coverage: "完整",
    fields: ["总部", "分支机构", "母子公司", "集团成员", "全球实体"],
    source: "branchesandhqs · segment_data",
    tone: "blue",
  },
  {
    code: "M06",
    name: "财务与经营表现",
    short: "观察营收、利润、负债和趋势",
    price: 79,
    state: "PARTIAL",
    coverage: "部分",
    fields: ["营业收入", "利润", "资产", "负债", "员工趋势"],
    source: "financial_data-corp",
    tone: "teal",
  },
  {
    code: "M07",
    name: "司法与经营风险",
    short: "核查诉讼、处罚、破产与异常记录",
    price: 89,
    state: "NO_RECORD",
    coverage: "已核查",
    fields: ["诉讼", "执行", "行政处罚", "破产", "经营异常"],
    source: "Sanctions And Legal Risk Summary（待拆分映射）",
    tone: "red",
  },
  {
    code: "M08",
    name: "制裁与合规",
    short: "筛查国际制裁与限制名单",
    price: 99,
    state: "AVAILABLE",
    coverage: "完整",
    fields: ["制裁名单", "命中主体", "名单来源", "命中时间", "关联说明"],
    source: "Sanctions And Legal Risk Summary（待拆分映射）",
    tone: "red",
  },
  {
    code: "M09",
    name: "上市、融资与并购",
    short: "查看上市状态、融资与交易活动",
    price: 59,
    state: "PARTIAL",
    coverage: "部分",
    fields: ["上市状态", "证券代码", "融资事件", "并购交易", "GIIN"],
    source: "listingsAndGiin · maTransactions",
    tone: "amber",
  },
  {
    code: "M10",
    name: "知识产权与网络风险",
    short: "评估专利、商标和网络暴露",
    price: 69,
    state: "NO_COVERAGE",
    coverage: "暂不支持",
    fields: ["专利", "商标", "专利价值", "域名", "网络安全风险"],
    source: "patentSummary · cyberRisk（待组合映射）",
    tone: "violet",
  },
];

const companies = [
  {
    id: "SQJ-DEMO-US-0001",
    name: "Northstar Components Inc.",
    localName: "Northstar Components Inc.",
    country: "美国",
    code: "US",
    flag: "🇺🇸",
    registration: "C0478921（演示）",
    region: "Delaware",
    status: "在营",
    address: "1200 Market Street, Wilmington, DE（演示地址）",
    updated: "2026-08-16 09:40 UTC",
    confidence: "高",
  },
  {
    id: "SQJ-DEMO-SG-0007",
    name: "Northstar Components Pte. Ltd.",
    localName: "Northstar Components Pte. Ltd.",
    country: "新加坡",
    code: "SG",
    flag: "🇸🇬",
    registration: "2019XXXXXXN（演示）",
    region: "Singapore",
    status: "在营",
    address: "Raffles Place, Singapore（演示地址）",
    updated: "2026-08-16 08:15 UTC",
    confidence: "中",
  },
  {
    id: "SQJ-DEMO-HK-0021",
    name: "North Star Components Limited",
    localName: "北辰零部件有限公司（演示）",
    country: "中国香港",
    code: "HK",
    flag: "🇭🇰",
    registration: "31XXXXX（演示）",
    region: "Hong Kong",
    status: "已注销",
    address: "Wan Chai, Hong Kong（演示地址）",
    updated: "2026-08-15 23:30 UTC",
    confidence: "中",
  },
];

const mockApi = {
  baseUrl: window.SQJ_RUNTIME?.mockBase || "http://127.0.0.1:4190",
  headers: {
    "X-API-Key": "sqj_test_2026_demo_key",
  },
};

const countryMeta = {
  CN: ["中国大陆", "🇨🇳"], HK: ["中国香港", "🇭🇰"], US: ["美国", "🇺🇸"], SG: ["新加坡", "🇸🇬"],
  GB: ["英国", "🇬🇧"], DE: ["德国", "🇩🇪"], FR: ["法国", "🇫🇷"], NL: ["荷兰", "🇳🇱"],
  JP: ["日本", "🇯🇵"], KR: ["韩国", "🇰🇷"],
};

function mapMockCompany(company, index = 0) {
  const [country, flag] = countryMeta[company.country] || [company.country, "🌐"];
  return {
    id: company.id,
    name: company.englishName || company.name,
    englishName: company.englishName || company.name,
    localName: company.localName || company.chineseName || company.name,
    country,
    code: company.country,
    flag,
    registration: `${company.registrationNumber}（Mock）`,
    region: company.country,
    status: company.status === "ACTIVE" ? "在营" : "已注销",
    address: `${company.address}（Mock）`,
    updated: new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC",
    confidence: company.matchScore >= 0.9 ? "高" : company.matchScore >= 0.8 ? "中" : index === 0 ? "高" : "中",
    matchScore: company.matchScore,
  };
}

function reportCompanyNames(company = state.selectedCompany) {
  const english = String(company?.englishName || company?.name || "").trim();
  const local = String(company?.localName || company?.chineseName || "").trim();
  const chinese = /[\u3400-\u9fff]/.test(local) && local !== english ? local : "";
  return { english, chinese };
}

async function callMockApi(path, options = {}) {
  const response = await fetch(mockApi.baseUrl + path, {
    ...options,
    headers: { ...mockApi.headers, "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error?.message || `Mock API ${response.status}`);
  return payload;
}

async function submitInvoiceApplication(orderIds, amount, source) {
  const payload = await callMockApi("/open/v1/invoice-applications", {
    method: "POST",
    body: JSON.stringify({
      customerId: state.customer?.id || "CUS-DEMO-0001",
      orderIds,
      amount,
      invoiceType: state.invoiceType,
      invoice: state.invoiceProfile,
      source,
    }),
  });
  state.lastInvoiceApplication = {
    ...payload.data,
    amount,
    typeLabel: invoiceTypeLabel(),
  };
  return payload.data;
}

async function searchViaMockApi(query) {
  state.mockStatus = "connecting";
  const sourceRoute = state.searchScope === "CN" ? "domestic" : "global";
  const payload = await callMockApi(`/open/v1/${sourceRoute}/companies/search?q=${encodeURIComponent(query)}`);
  state.mockStatus = "online";
  state.mockRequestId = payload.requestId;
  state.searchProvider = payload.provider?.code || null;
  state.searchQuery = query;
  state.searchDataState = payload.dataState;
  state.searchResults = payload.data.candidates.map(mapMockCompany);
  return payload;
}

async function loadInsights() {
  try {
    const payload = await callMockApi("/open/v1/insights");
    state.insights = payload.data;
    state.insightsStatus = "online";
    if (["insights", "insight", "admin-insights"].includes(route().name)) render();
  } catch {
    state.insights = fallbackInsights;
    state.insightsStatus = "fallback";
  }
}

async function loadWallet() {
  try {
    const payload = await callMockApi(`/open/v1/customers/${state.customer?.id || "CUS-DEMO-0001"}/wallet`);
    state.accountBalance = payload.data.balance;
    if (["account", "checkout"].includes(route().name)) render();
  } catch {
    // 保留内置演示余额，确保 Mock 服务暂不可用时页面仍可测试。
  }
}

// 与《全球查API接口清单_33个接口》逐项一致。商情局与全球查属于同一业务主体，
// 共用同一套数据源与接口；这里只改变面向中小企业和个人用户的购买体验，
// 不改接口名称、OperationId、路径和单价。
const apiProducts = [
  {name:"自然人参股公司查询",group:"自然人主体信息",desc:"根据 PID 查询个人直接和间接参股的公司。",method:"POST",endpoint:"/api/v1/persons/shareholding-companies",code:"personsShareholdingCompanies",price:35,tags:["直接参股","间接参股"],request:[["pid","string","否","-","body"],["includeHistorical","boolean","否","-","body"],["maxLevel","integer(int32)","否","-","body"],["limit","integer(int32)","否","-","body"]],responseCount:56,serial:1},
  {name:"自然人任职公司查询",group:"自然人主体信息",desc:"根据 PID 查询该个人现任或历史董事、高管、经理、授权签字人等任职公司。",method:"POST",endpoint:"/api/v1/persons/management-companies",code:"personsManagementCompanies",price:20,tags:["任职公司","董事","高管","授权签字人"],request:[["pid","string","否","-","body"],["includeHistorical","boolean","否","-","body"],["limit","integer(int32)","否","-","body"]],responseCount:55,serial:2},
  {name:"自然人身份识别",group:"自然人主体信息",desc:"先按公司名搜索前 10 个企业候选，再按姓名和可选性别查询并合并相关人员和企业关系。",method:"POST",endpoint:"/api/v1/persons/identity/resolve",code:"personsIdentityResolve",price:3,tags:["身份识别","企业关联"],request:[["companyName","string","否","-","body"],["personName","string","否","-","body"],["gender","string","否","-","body"],["limit","integer(int32)","否","-","body"]],responseCount:27,serial:3},
  {name:"企业董监高与管理人员查询",group:"自然人主体信息",desc:"根据企业 EID 获取董事及高管关系，按 PID 合并同一人员的多个任职角色。",method:"POST",endpoint:"/api/v1/companies/principals",code:"companiesPrincipals",price:14,tags:["董事","高管","任职角色"],request:[["eid","string","否","-","body"],["currentOnly","boolean","否","-","body"],["limit","integer(int32)","否","-","body"],["purpose","string","否","-","body"]],responseCount:25,serial:4},
  {name:"企业公开联系方式与触点",group:"主体识别与基础信息",desc:"通过 LLM 实时搜索企业公开联系方式、官方域名、社媒、职能邮箱、邮箱模式和公开职业触点。",method:"POST",endpoint:"/api/v1/companies/web-contacts/detail",code:"companiesWebContactsDetail",price:8,tags:["联系方式","官方域名","社媒","职能邮箱"],request:[["eid","string","否","-","body"],["website","string","否","-","body"]],responseCount:36,serial:5},
  {name:"企业上市信息与GIIN代码查询M4",group:"主体识别与基础信息",desc:"获取企业在全球交易所的上市信息、股票代码、ISIN及GIIN代码。",method:"GET",endpoint:"/glov2/modules/M4/data",code:"queryM4Data",price:39,tags:["上市信息","股票代码","上市状态"],request:[["eid","string","是","-","query"]],responseCount:9,serial:6},
  {name:"企业搜索识别",group:"主体识别与基础信息",desc:"按企业名称或注册号搜索并返回去重名称和规范化匹配分数的企业候选。",method:"POST",endpoint:"/api/v1/companies/search/resolve",code:"companiesSearchResolve",price:3,tags:["企业搜索","名称解析","匹配分数"],request:[["name","string","否","-","body"],["countryIso2","string","否","-","body"],["registrationNumber","string","否","-","body"],["includeBranch","boolean","否","-","body"],["includeInactive","boolean","否","-","body"],["searchType","string","否","-","body"],["limit","integer(int32)","否","-","body"]],responseCount:22,serial:7},
  {name:"企业基础档案查询",group:"主体识别与基础信息",desc:"获取去重后的企业基础档案、法律状态、业务概览、行业和识别编号。",method:"POST",endpoint:"/api/v1/companies/profile",code:"companiesProfile",price:29,tags:["基础档案","法律状态","业务概览","行业分类","识别编号"],request:[["eid","string","否","-","body"]],responseCount:82,serial:8},
  {name:"企业完整档案查询",group:"主体识别与基础信息",desc:"按 EID 输出去重、分模块且字段契约完整的公司画像。",method:"POST",endpoint:"/api/v1/companies/profile/full",code:"companiesProfileFull",price:188,tags:["完整画像","多模块聚合"],request:[["eid","string","否","-","body"]],responseCount:620,serial:9},
  {name:"企业识别编号查询",group:"主体识别与基础信息",desc:"获取企业注册号、VAT、LEI、ISIN、贸易登记号、CAGE、UEI 等识别编号。",method:"POST",endpoint:"/api/v1/companies/identifiers",code:"companiesIdentifiers",price:5,tags:["企业识别编号","VAT编号","贸易登记号"],request:[["eid","string","否","-","body"]],responseCount:55,serial:10},
  {name:"全球实体分布查询M2",group:"主体识别与基础信息",desc:"获取企业总部、子公司及分支机构在全球的分布情况。",method:"GET",endpoint:"/glov2/modules/M2/data",code:"queryM2Data",price:69,tags:["总部","子公司","分支机构","全球分布"],request:[["eid","string","是","-","query"]],responseCount:9,serial:11},
  {name:"基本信息查询M1",group:"主体识别与基础信息",desc:"可查询企业基本信息、法律状态、工商信息、企业概览、行业和识别编号等。",method:"GET",endpoint:"/glov2/modules/M1/data",code:"queryM1Data",price:0,tags:["基本信息","法律状态","企业概览","行业分类","识别编号"],request:[["eid","string","是","-","query"]],responseCount:9,serial:12},
  {name:"企业股权结构查询",group:"股权、组织架构与控制权",desc:"输出去重后的完整股权结构，包括股东路径、GUO、DUO、BO 和汇总统计。",method:"POST",endpoint:"/api/v1/companies/ownership/structure",code:"companiesOwnershipStructure",price:60,tags:["股东结构","GUO","DUO","BO","汇总统计"],request:[["eid","string","否","-","body"],["includeShareholders","boolean","否","-","body"],["includeGuo","boolean","否","-","body"],["includeDuo","boolean","否","-","body"],["includeBo","boolean","否","-","body"],["includeHistorical","boolean","否","-","body"],["maxLevel","integer(int32)","否","-","body"],["purpose","string","否","-","body"]],responseCount:56,serial:13},
  {name:"企业股权洞察查询",group:"股权、组织架构与控制权",desc:"获取企业一级股东和受益所有人快照，不递归展开股权链。",method:"POST",endpoint:"/api/v1/companies/ownership/insight",code:"companiesOwnershipInsight",price:45,tags:["一级股东","受益所有人"],request:[["eid","string","否","-","body"],["includeHistorical","boolean","否","-","body"],["shareholderLimit","integer(int32)","否","-","body"],["beneficialOwnerLimit","integer(int32)","否","-","body"]],responseCount:56,serial:14},
  {name:"企业关联关系查询",group:"股权、组织架构与控制权",desc:"获取企业总部、分支、子公司及集团成员关系。",method:"POST",endpoint:"/api/v1/companies/linkage",code:"companiesLinkage",price:25,tags:["总部","分支","子公司","集团成员"],request:[["eid","string","否","-","body"],["includeBranch","boolean","否","-","body"],["includeSubsidiaries","boolean","否","-","body"],["includeGroup","boolean","否","-","body"],["currentOnly","boolean","否","-","body"],["maxLevel","integer(int32)","否","-","body"],["branchLimit","integer(int32)","否","-","body"],["subsidiaryLimit","integer(int32)","否","-","body"],["groupLimit","integer(int32)","否","-","body"]],responseCount:104,serial:15},
  {name:"公司组织架构概览查询M5",group:"股权、组织架构与控制权",desc:"获取企业管理人个人信息、角色、高管教育程度等。",method:"GET",endpoint:"/glov2/modules/M5/data",code:"queryM5Data",price:59,tags:["管理人信息","高管学历","雇员规模"],request:[["eid","string","是","-","query"]],responseCount:9,serial:16},
  {name:"最终所有权与控制结构查询M3",group:"股权、组织架构与控制权",desc:"获取企业股东信息、全球及国内实际控制人、最终受益人。",method:"GET",endpoint:"/glov2/modules/M3/data",code:"queryM3Data",price:99,tags:["股东","实际控制人","最终受益人"],request:[["eid","string","是","-","query"]],responseCount:9,serial:17},
  {name:"企业司法合规明细",group:"司法、合规与负面风险",desc:"通过 LLM 搜索并结构化最近 24 个月的企业司法案件、监管处罚和已确认合规违规标签。",method:"POST",endpoint:"/api/v1/companies/legal-compliance/detail",code:"companiesLegalComplianceDetail",price:20,tags:["司法案件","监管处罚","合规标签"],request:[["eid","string","否","-","body"]],responseCount:108,serial:18},
  {name:"企业负面信号明细",group:"司法、合规与负面风险",desc:"检索最近 24 个月的企业负面舆情、高管争议、财务困境、付款投诉、劳资供应链争议及重大控制权或领导层风险信号。",method:"POST",endpoint:"/api/v1/companies/negative-signals/detail",code:"companiesNegativeSignalsDetail",price:25,tags:["负面舆情","高管争议","财务困境","控制权风险"],request:[["eid","string","否","-","body"]],responseCount:65,serial:19},
  {name:"企业法律事件查询",group:"司法、合规与负面风险",desc:"获取数据库中的法律状态、注册事件、名称变更和专利诉讼。",method:"POST",endpoint:"/api/v1/companies/legal-events",code:"companiesLegalEvents",price:35,tags:["法律状态","注册事件","名称变更","专利诉讼"],request:[["eid","string","否","-","body"],["eventTypes","Array<string>","否","-","body"],["dateFrom","string","否","-","body"],["dateTo","string","否","-","body"],["limit","integer(int32)","否","-","body"],["purpose","string","否","-","body"]],responseCount:69,serial:20},
  {name:"企业知识产权创新查询",group:"知识产权与科创资产",desc:"获取企业商标统计、两种专利统计口径、年度创新指标、专利清单、交易和美元估值。",method:"POST",endpoint:"/api/v1/companies/ip-innovation",code:"companiesIpInnovation",price:10,tags:["商标","专利","创新指标","专利交易","专利估值"],request:[["eid","string","否","-","body"],["years","integer(int32)","否","-","body"],["includePatentList","boolean","否","-","body"],["limit","integer(int32)","否","-","body"]],responseCount:115,serial:21},
  {name:"专利价值-交易-诉讼概要查询M10",group:"知识产权与科创资产",desc:"获取企业专利数量、创新价值、专利转移、专利诉讼等知识产权数据。",method:"GET",endpoint:"/glov2/modules/M10/data",code:"queryM10Data",price:109,tags:["专利信息","专利数量","专利转移","专利诉讼","专利申请人","知识产权"],request:[["eid","string","是","-","query"]],responseCount:9,serial:22},
  {name:"企业实时经营信号",group:"经营表现与财务运营",desc:"通过 LLM 实时搜索生成按模块分组、去除静态说明与空占位的企业互联网经营画像。",method:"POST",endpoint:"/api/v1/companies/realtime-operations",code:"companiesRealtimeOperations",price:26,tags:["实时经营画像","互联网信号"],request:[["eid","string","否","-","body"],["website","string","否","-","body"]],responseCount:32,serial:23},
  {name:"企业财务数据查询",group:"经营表现与财务运营",desc:"获取最近财年的核心财务、利润表和资产负债表原始数据。",method:"POST",endpoint:"/api/v1/companies/financials",code:"companiesFinancials",price:30,tags:["核心财务","利润表","资产负债表"],request:[["eid","string","否","-","body"],["years","integer(int32)","否","-","body"]],responseCount:57,serial:24},
  {name:"企业事件时间线",group:"经营表现与财务运营",desc:"按业务日期聚合并去重企业注册、状态、名称、工商、处罚、制裁、并购、诉讼、股权及管理层变化。",method:"POST",endpoint:"/api/v1/companies/events/timeline",code:"companiesEventsTimeline",price:15,tags:["企业变更","并购重组","人员变动"],request:[["eid","string","否","-","body"],["eventTypes","Array<string>","否","-","body"],["dateFrom","string","否","-","body"],["dateTo","string","否","-","body"],["limit","integer(int32)","否","-","body"]],responseCount:26,serial:25},
  {name:"企业投资地图",group:"经营表现与财务运营",desc:"企业投资地图，展示企业对外投资、参股、控股、层级、国家地区分布和相关并购交易。",method:"POST",endpoint:"/api/v1/companies/investment-map",code:"companiesInvestmentMap",price:50,tags:["对外投资","股权层级","并购交易"],request:[["eid","string","否","-","body"],["includeDirect","boolean","否","-","body"],["includeIndirect","boolean","否","-","body"],["maxLevel","integer(int32)","否","-","body"]],responseCount:75,serial:26},
  {name:"运营状况与财务详情查询M7",group:"经营表现与财务运营",desc:"获取企业关键财务数据、资产负债表、经营活动等运营财务状况。",method:"GET",endpoint:"/glov2/modules/M7/data",code:"queryM7Data",price:129,tags:["关键财务","资产负债表","损益表","业务条线","区域数据"],request:[["eid","string","是","-","query"]],responseCount:9,serial:27},
  {name:"企业招投标与采购记录",group:"经营表现与财务运营",desc:"根据企业 EID 双向查询已确认中标和政府合同中的采购方与供应商。",method:"POST",endpoint:"/api/v1/companies/tender-procurement",code:"companiesTenderProcurement",price:20,tags:["招投标","政府采购","中标记录","供应商"],request:[["eid","string","否","-","body"],["dateFrom","string","否","-","body"],["dateTo","string","否","-","body"],["countryIso2s","Array<string>","否","-","body"],["contractTypes","Array<string>","否","-","body"],["procedureTypes","Array<string>","否","-","body"],["limit","integer(int32)","否","-","body"]],responseCount:92,serial:28},
  {name:"制裁与相关法律风险详情查询M6",group:"国际合规与制裁筛查",desc:"获取企业制裁信息、法律事件、违约风险及判决风险等法律风险详情。",method:"GET",endpoint:"/glov2/modules/M6/data",code:"queryM6Data",price:129,tags:["制裁详情","法律事件","违约风险","判决风险"],request:[["eid","string","是","-","query"]],responseCount:9,serial:29},
  {name:"企业制裁与PEP明细",group:"国际合规与制裁筛查",desc:"对企业及其关键股东、UBO、控制人、董事和高管进行公开信息制裁、出口管制、PEP、RCA、SIP及所有权延伸筛查。",method:"POST",endpoint:"/api/v1/companies/sanctions/detail",code:"companiesSanctionsDetail",price:52,tags:["制裁","出口管制","UBO筛查"],request:[["eid","string","否","-","body"]],responseCount:111,serial:30},
  {name:"企业 KYB 尽调",group:"专项风险与交易情报",desc:"通过 LLM 核验企业身份、注册识别、法律状态、地址、负责人、业务活动和官方网络信息，并输出非风险型数据质量与数字足迹评估。",method:"POST",endpoint:"/api/v1/companies/kyb/screen",code:"companiesKybScreen",price:20,tags:["身份核验","法律状态","业务活动","数字足迹"],request:[["eid","string","否","-","body"]],responseCount:112,serial:31},
  {name:"并购交易概述查询M9",group:"专项风险与交易情报",desc:"获取企业并购概览、并购结构及日期、并购交易估值等并购交易数据。",method:"GET",endpoint:"/glov2/modules/M9/data",code:"queryM9Data",price:89,tags:["并购概览","并购结构","交易估值"],request:[["eid","string","是","-","query"]],responseCount:9,serial:32},
  {name:"网络风险评级与隐含网络威胁概述查询M8",group:"专项风险与交易情报",desc:"获取企业行业网络风险、网络风险评级及隐含网络威胁等网络安全评估数据。",method:"GET",endpoint:"/glov2/modules/M8/data",code:"queryM8Data",price:79,tags:["网络风险","风险评级","隐含威胁","网络安全"],request:[["eid","string","是","-","query"]],responseCount:9,serial:33},
].map((item)=>({ ...item, apiId:`GC-API-${String(item.serial).padStart(3,"0")}`, domain:item.group, priceUnit:"元/次", status:item.price===0?"免费":"可购买", compatibility:["API"] }));

const apiGroups = [...new Set(apiProducts.map((item)=>item.group))];

const defaultAdminModels = [
  { id:"MODEL-QWEN", name:"通义千问 Qwen3", provider:"阿里云", modelCode:"qwen3-32b", enabled:true, publicFree:true, dailyQuota:30, isDefault:true },
  { id:"MODEL-DEEPSEEK", name:"DeepSeek V3", provider:"DeepSeek", modelCode:"deepseek-chat", enabled:true, publicFree:true, dailyQuota:20, isDefault:false },
  { id:"MODEL-HUNYUAN", name:"腾讯混元 Lite", provider:"腾讯云", modelCode:"hunyuan-lite", enabled:true, publicFree:true, dailyQuota:15, isDefault:false },
  { id:"MODEL-GPT", name:"GPT 高级模型", provider:"OpenAI", modelCode:"gpt-premium", enabled:false, publicFree:false, dailyQuota:0, isDefault:false },
];

// API uses low-value per-call billing. These prices are independent from the
// tens-of-yuan report-module catalog above and remain configurable before launch.
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

const defaultAdminSources = [
  { id:"SRC-1001", name:"生意社", url:"https://www.100ppi.com", focus:"大宗商品价格与产业链信号", modules:"大宗数据", weight:90, enabled:true },
  { id:"SRC-JIN10", name:"金十数据", url:"https://www.jin10.com", focus:"宏观事件与金融市场快讯", modules:"金融市场", weight:88, enabled:true },
  { id:"SRC-CHINAVENTURE", name:"投中网", url:"https://www.chinaventure.com.cn", focus:"一级市场融资与投资机构", modules:"投资日报", weight:86, enabled:true },
  { id:"SRC-WALLSTREETCN", name:"华尔街见闻", url:"https://wallstreetcn.com", focus:"宏观、市场与上市公司线索", modules:"金融市场 · 上市企业", weight:85, enabled:true },
  { id:"SRC-10JQKA", name:"同花顺", url:"https://www.10jqka.com.cn", focus:"上市公司公告与行情线索", modules:"上市企业", weight:84, enabled:true },
  { id:"SRC-XUEQIU", name:"雪球", url:"https://xueqiu.com", focus:"投资者关注度与市场讨论", modules:"上市企业 · 其他", weight:72, enabled:true },
];

const demoInvoiceOrders = [
  { id: "SQJ-ORD-DEMO-2408", company: "Northstar Components Inc.", paidAt: "2026-08-12", amount: 176, status: "可开票" },
  { id: "SQJ-ORD-DEMO-2381", company: "Atlas Medical Trading GmbH", paidAt: "2026-08-08", amount: 264, status: "可开票" },
  { id: "SQJ-ORD-DEMO-2316", company: "Harborline Supply Pte. Ltd.", paidAt: "2026-07-29", amount: 88, status: "可开票" },
];

const fallbackInsights = {
  capturedAt: "2026-08-16T12:00:00+08:00",
  disclaimer: "公开信息聚合快照。原始披露优先，商情局摘要不构成投资建议。",
  primaryMarket: [
    { id:"PM-OPENAI", company:"OpenAI Group PBC", tag:"AI · Late Stage", metric:"US$30B", title:"SoftBank announces follow-on investment in OpenAI", titleZh:"软银宣布对 OpenAI 追加 300 亿美元投资", summary:"The official announcement states a US$730B pre-money valuation and three planned tranches in 2026.", summaryZh:"官方公告披露投前估值为 7,300 亿美元，计划在 2026 年分三期完成投资。", source:"SoftBank Group official announcement", sourceZh:"软银集团官方公告", sourceType:"COMPANY_ANNOUNCEMENT", publishedAt:"2026-02-27", sourceUrl:"https://group.softbank/en/news/press/20260227" },
    { id:"PM-SEMAFOR", company:"Semafor, Inc.", tag:"Media Tech · Form D", metric:"US$63.6M", title:"Semafor files completed equity offering notice", titleZh:"Semafor 披露 6,360 万美元股权融资备案", summary:"SEC Form D records US$63.6M sold to 28 investors; US$33.6M relates to SAFE conversions.", summaryZh:"SEC Form D 记录已向 28 名投资者售出 6,360 万美元，其中 3,360 万美元来自 SAFE 转股。", source:"U.S. SEC EDGAR Form D", sourceZh:"美国 SEC EDGAR Form D", sourceType:"REGULATORY_FILING", publishedAt:"2026-01-09", sourceUrl:"https://www.sec.gov/Archives/edgar/data/1919453/000191945326000001/xslFormDX01/primary_doc.xml" }
  ],
  annualReports: [
    { id:"AR-NVDA", company:"NVIDIA", ticker:"NASDAQ: NVDA", metric:"US$215.9B", title:"FY2026 revenue rises 65%; Data Center revenue rises 68%", titleZh:"FY2026 营收增长 65%，数据中心业务增长 68%", summary:"R&D reached US$18.5B, while gross margin fell to 71.1%; customer concentration remains a key watch item.", summaryZh:"研发投入达到 185 亿美元，毛利率降至 71.1%；客户集中度仍是值得持续观察的风险项。", source:"U.S. SEC 10-K", sourceZh:"美国 SEC 10-K", sourceType:"ANNUAL_REPORT", publishedAt:"2026-02-25", sourceUrl:"https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm" },
    { id:"AR-UBTECH", company:"UBTECH Robotics", ticker:"HKEX: 09880", metric:"+53.3%", title:"2025 revenue reaches RMB2.0B; humanoid robot revenue becomes largest segment", titleZh:"2025 年营收达 20 亿元，人形机器人收入成为最大板块", summary:"Humanoid robot revenue increased about 2,203.7% to RMB820.6M and gross margin improved to 37.7%.", summaryZh:"全尺寸人形机器人收入增长约 2,203.7% 至 8.206 亿元，毛利率提升至 37.7%。", source:"HKEX annual results announcement", sourceZh:"港交所年度业绩公告", sourceType:"EXCHANGE_FILING", publishedAt:"2026-03-31", sourceUrl:"https://www1.hkexnews.hk/listedco/listconews/sehk/2026/0331/2026033102607.pdf" },
    { id:"AR-QIPAI", company:"Qipai Technology", ticker:"SSE: 688216", metric:"AI + Chiplet", title:"Annual report highlights advanced packaging and AI visual inspection", titleZh:"年报聚焦先进封装、Chiplet 与 AI 视觉检测", summary:"The company plans to expand high-value packaging applications and accelerate digital quality management in 2026.", summaryZh:"公司计划在 2026 年拓展高附加值封装应用，并加速质量管理数字化建设。", source:"Shanghai Stock Exchange annual report", sourceZh:"上交所上市公司年报", sourceType:"ANNUAL_REPORT", publishedAt:"2026-04-02", sourceUrl:"https://big5.sse.com.cn/disclosure/listedinfo/announcement/c/new/2026-04-02/688216_20260402_XAZJ.pdf" }
  ]
};

const state = {
  mode: "web",
  locale: "zh",
  loggedIn: false,
  adminLoggedIn: false,
  adminReturnAfterLogin: null,
  customer: null,
  returnAfterLogin: null,
  pendingPurchase: null,
  checkoutAttemptId: null,
  paymentMethod: "WECHAT",
  invoiceRequested: false,
  invoiceType: "VAT_ORDINARY",
  invoiceProfile: {
    title: "",
    taxId: "",
    registeredAddress: "",
    registeredPhone: "",
    bankName: "",
    bankAccount: "",
    email: "",
  },
  invoiceApplicationOpen: false,
  invoiceApplicationOrders: new Set(["SQJ-ORD-DEMO-2408"]),
  invoicedOrderIds: new Set(),
  lastInvoiceApplication: null,
  accountBalance: 568,
  rechargeOpen: false,
  rechargeAmount: 100,
  rechargeMethod: "WECHAT",
  paymentBusy: false,
  lastOrder: null,
  selectedCompany: companies[0],
  selectedModules: new Set(["M01", "M03", "M08"]),
  progressStep: 0,
  progressTimerActive: false,
  annotationOpen: false,
  apiFilter: "ALL",
  apiSearch: "",
  apiPage: 1,
  apiBalance: 8420,
  apiPurchaseOpen: false,
  apiPurchaseProduct: null,
  apiRechargeAmount: 800,
  apiPaymentMethod: "WECHAT",
  apiPurchaseBusy: false,
  apiLastPurchase: null,
  apiKeys: [
    { id:"KEY-DEMO-01", name:"默认开发应用", prefix:"sqj_test_M8K2", status:"ACTIVE", lastUsed:"今天 13:41" },
    { id:"KEY-DEMO-02", name:"本地联调", prefix:"sqj_test_D7P4", status:"ACTIVE", lastUsed:"2026-08-19 15:22" },
  ],
  apiKeyReveal: null,
  adminModels: defaultAdminModels.map((item)=>({...item})),
  adminModelFormOpen: false,
  adminModelEditingId: null,
  adminSources: defaultAdminSources.map((item)=>({...item})),
  adminSourceFormOpen: false,
  adminSourceEditingId: null,
  adminSubtabByRoute: {},
  adminAuditFilter: "all",
  adminDrawer: null,
  adminWorkflowModal: null,
  adminCollectionRunning: false,
  adminReviewItems: [
    {id:"NEWS-240824-01",category:"大宗数据",title:"焦煤价格波动背后的供需拐点",source:"生意社 / 交易所公告",status:"待审核",time:"08:30",summary:"近期焦煤价格回升并非单一情绪驱动。文章结合港口库存、钢厂开工率与主产区供给变化，判断价格修复仍需观察终端需求能否持续。",body:"过去两周，焦煤现货价格出现阶段性回升。公开数据表明，港口库存下降、部分主产区安全检查趋严，共同改善了短期供需结构。但从钢厂利润和终端订单看，需求端尚未形成全面上行。本文认为，当前更接近库存周期驱动的修复，而非新一轮趋势性上涨。运营审核时应重点核对库存口径、数据日期以及交易所公告原文。"},
    {id:"NEWS-240824-02",category:"投资日报",title:"OpenAI 新一轮融资信号与产业影响",source:"投中网 / 公司披露",status:"待审核",time:"09:10",summary:"从公开披露梳理融资节奏、估值变化及其对模型、算力和应用层公司的影响。",body:"文章从官方公告与监管备案出发，梳理融资主体、投资方与资金用途，并将市场传闻与已确认事实分开呈现。核心结论是：大额融资仍将进一步抬高基础模型竞争门槛，同时为算力基础设施和垂直应用带来新的订单机会。"},
    {id:"NEWS-240824-03",category:"金融市场",title:"美债收益率变化如何影响成长资产",source:"金十数据 / 央行数据",status:"待审核",time:"09:40",summary:"以利率预期、实际收益率与风险偏好三个变量解释成长资产近期波动。",body:"文章使用公开利率数据和政策表述，解释实际收益率变化如何通过估值折现率影响成长型资产。文章不提供投资建议，只呈现变量、传导路径与需要持续关注的数据。"},
    {id:"NEWS-240824-04",category:"上市企业",title:"上市公司年报中的现金流质量信号",source:"同花顺 / 年报原文",status:"需补来源",time:"10:20",summary:"对比利润、经营现金流与应收账款变化，识别年报中值得继续核验的经营信号。",body:"文章以多家上市公司年报为样本，比较净利润、经营活动现金流和应收账款的变化。当前草稿引用了二次整理数据，审核前需要补充交易所年报原文链接。"},
    {id:"NEWS-240824-05",category:"其他",title:"全球供应链重构下的企业风险地图",source:"华尔街见闻 / 公开披露",status:"待审核",time:"11:00",summary:"从制裁、物流、关税和供应商集中度四个维度观察企业供应链风险。",body:"文章将公开政策文件、企业公告与物流数据进行交叉核验，形成可复核的风险观察框架。结论仅描述公开信息所支持的风险信号，不对企业作未经证实的定性判断。"}
  ],
  adminReportPrices: modules.slice(0,8).map((module,index)=>({id:module.code,name:module.name,list:module.price,discount:[100,90,85,88,92,80,95,90][index],enabled:index<7})),
  adminApiPrices: [
    {id:"companiesSearchResolve",name:"企业搜索识别",list:0.10,discount:100},
    {id:"companiesProfile",name:"企业基础档案查询",list:0.30,discount:90},
    {id:"personsShareholdingCompanies",name:"自然人参股公司查询",list:0.50,discount:80},
    {id:"companiesOwnershipStructure",name:"企业股权结构查询",list:0.80,discount:85},
    {id:"companiesSanctionsDetail",name:"企业制裁与 PEP 明细",list:1.20,discount:90}
  ],
  searchScope: "GLOBAL",
  searchQuery: "Northstar Components",
  searchResults: companies,
  searchDataState: "AMBIGUOUS",
  mockStatus: "unknown",
  mockRequestId: null,
  searchProvider: null,
  insights: fallbackInsights,
  insightsStatus: "fallback",
  insightChannel: "ALL",
  insightPage: 1,
  loginMode: "sms",
  agentRunState: "scheduled",
  mockTask: null,
  mockReportId: null,
  aiMessages: [
    {
      role: "assistant",
      text: "我只读取当前报告已购章节。你可以问我主体身份、控制权、制裁命中或后续核查建议。",
    },
  ],
};

const sessionStateKey = "sqj-formal-session-v1";

function restoreSessionState() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(sessionStateKey) || "null");
    if (!saved || typeof saved !== "object") return;
    Object.assign(state, saved);
    state.selectedModules = new Set(saved.selectedModules || ["M01", "M03", "M08"]);
    state.invoiceApplicationOrders = new Set(saved.invoiceApplicationOrders || ["SQJ-ORD-DEMO-2408"]);
    state.invoicedOrderIds = new Set(saved.invoicedOrderIds || []);
    state.selectedCompany = companies.find((company) => company.id === saved.selectedCompanyId) || companies[0];
  } catch (_) {
    sessionStorage.removeItem(sessionStateKey);
  }
}

function persistSessionState() {
  try {
    sessionStorage.setItem(sessionStateKey, JSON.stringify({
      loggedIn: state.loggedIn,
      adminLoggedIn: state.adminLoggedIn,
      customer: state.customer,
      locale: state.locale,
      lastOrder: state.lastOrder,
      mockTask: state.mockTask,
      mockReportId: state.mockReportId,
      selectedCompanyId: state.selectedCompany?.id,
      selectedModules: [...state.selectedModules],
      invoiceApplicationOrders: [...state.invoiceApplicationOrders],
      invoicedOrderIds: [...state.invoicedOrderIds],
      invoiceProfile: state.invoiceProfile,
      accountBalance: state.accountBalance,
      apiBalance: state.apiBalance,
      apiKeys: state.apiKeys,
      adminModels: state.adminModels,
      adminSources: state.adminSources,
      adminReviewItems: state.adminReviewItems,
      adminReportPrices: state.adminReportPrices,
      adminApiPrices: state.adminApiPrices,
    }));
  } catch (_) {
    // Mock 联调阶段即使浏览器禁用会话存储，当前页面仍可正常使用。
  }
}

restoreSessionState();

let apiDetailScrollCleanup = null;

function initApiDetailScrollSpy() {
  apiDetailScrollCleanup?.();
  const sections = [...document.querySelectorAll(".api-detail-content-v3 > .api-doc-section-v3[id]")];
  const buttons = [...document.querySelectorAll(".api-detail-anchor [data-section]")];
  if (!sections.length || !buttons.length) return;
  let frame = null;
  const setActive = (id) => buttons.forEach((button) => {
    const active = button.dataset.section === id;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "true");
    else button.removeAttribute("aria-current");
  });
  const update = () => {
    frame = null;
    const marker = Math.min(190, Math.max(112, window.innerHeight * .22));
    let activeId = sections[0].id;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= marker) activeId = section.id;
      else break;
    }
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) activeId = sections.at(-1).id;
    setActive(activeId);
  };
  const onScroll = () => {
    if (frame === null) frame = requestAnimationFrame(update);
  };
  window.addEventListener("scroll", onScroll, { passive:true });
  update();
  apiDetailScrollCleanup = () => {
    window.removeEventListener("scroll", onScroll);
    if (frame !== null) cancelAnimationFrame(frame);
  };
}

function tr(zh, en) { return state.locale === "en" ? en : zh; }
function localized(item, key) { return state.locale === "en" ? item[key] : (item[`${key}Zh`] || item[key]); }

const englishReplacements = [
  ["做生意之前，先把企业查明白","Before you do business, know the company."],["全球企业情报 · 一查即明","Global company intelligence · Clear at a glance"],["查身份、穿透股权、识别风险、读懂经营。全球企业情报一次汇集，让合作、投资与采购更有底气。","Verify identity, trace ownership, identify risk and understand operations—all in one place for more confident partnerships, investments and procurement."],
  ["选择数据范围","Choose a database"],["全球库与国内库独立查询","Global and Mainland China databases are searched independently"],["全球企业库","Global Database"],["海外及港澳台企业","International, Hong Kong, Macao and Taiwan entities"],["国内企业库","Mainland China Database"],["中国大陆工商主体","Mainland China registered entities"],["高级筛选","Advanced filters"],["查一下","Search"],["热门","Trending"],["今日商业热闻","Today's market intelligence"],
  ["查企业","Companies"],["查股东","Shareholders"],["查风险","Risk"],["查行业","Industries"],["查投资","Investment"],
  ["查股权","Ownership"],["查年报","Annual Reports"],["查知识产权","Intellectual Property"],["生成报告","Build a Report"],["企业身份、工商状态与注册地址","Corporate identity, registration status and registered address"],["股东、控制链与最终受益人","Shareholders, control chains and ultimate beneficial owners"],["司法、处罚、制裁与经营异常","Litigation, penalties, sanctions and operating exceptions"],["上市公司年报与财务重点","Public-company filings and financial highlights"],["一级市场融资与投资日报","Private-market funding and daily investment signals"],["商标、专利与著作权资产","Trademarks, patents and copyright assets"],["按模块购买并自动交付报告","Purchase selected modules and receive an automated report"],["33 个全球查同源接口","33 APIs powered by the same GlobalCheck source"],
  ["正在被关注的企业与行业","Trending companies and industries"],["查看今日热门资讯","View today's market intelligence"],["企业热度榜","Trending companies"],["近 24 小时查询趋势 · 演示数据","Search activity in the last 24 hours · Demo data"],["实时更新","Live"],["热门行业导航","Explore industries"],["按行业发现公司与商业机会","Discover companies and opportunities by industry"],["全部行业","All industries"],
  ["电子元件 · 美国","Electronic Components · United States"],["医疗贸易 · 德国","Medical Trading · Germany"],["供应链 · 新加坡","Supply Chain · Singapore"],["机器人 · 中国香港","Robotics · Hong Kong"],["人工智能 · 上海","Artificial Intelligence · Shanghai"],["国内库","Mainland China"],["全球库","Global"],["热度","Score"],["每天读懂 5–10 个市场热点","Understand 5–10 major market signals every day"],["商情局 Agent 从公开市场筛选线索，核验原始披露并写成免费深度文章。","The Shangqingju Agent discovers public-market signals, verifies primary disclosures and produces free in-depth analysis."],["进入热闻资讯","Explore market intelligence"],
  ["你在做什么决定？","What decision are you making?"],["不需要先理解复杂字段，选择场景后按需购买调查模块。","Choose a business scenario first, then purchase only the research modules you need."],["信息不只要多，更要能帮助你判断","More data is not enough. It must support a decision."],
  ["跨境合作","Cross-border partnership"],["确认主体、股权和合规风险","Verify identity, ownership and compliance risk"],["合作前先查清对方是谁","Know your counterparty before you commit"],["采购准入","Supplier onboarding"],["核查经营、司法与履约能力","Review operations, litigation and delivery capacity"],["减少供应链合作盲区","Reduce blind spots in supplier decisions"],["投资研究","Investment research"],["串联融资、年报与控制关系","Connect funding, filings and control relationships"],["从公开信息形成投资判断","Build an investment view from public evidence"],["求职背调","Employer research"],["了解企业状态与经营风险","Understand company status and operating risk"],["入职前多看一层真实情况","Look one layer deeper before joining"],["开始查询","Start research"],
  ["全球库与国内库独立切换，同一企业主体贯穿搜索、购买、报告、API 与 AI 问答。","Switch independently between Global and Mainland China databases while one entity ID connects search, purchases, reports, APIs and AI Q&A."],["主体不混淆","No entity confusion"],["名称、国家、注册号、地址交叉确认","Cross-check name, jurisdiction, registration number and address"],["结果有边界","Clear result boundaries"],["区分未发现记录、无覆盖与系统异常","Distinguish no record, no coverage and system errors"],["结论可追溯","Traceable conclusions"],["重要信息保留来源、日期和版本","Keep the source, date and version for material facts"],["按需再付费","Pay only when needed"],["10 类模块自由组合，不强制购买整包","Combine 10 modules freely without purchasing a full bundle"],["企业主体","Company Entity"],["海外及港澳台","International, Hong Kong, Macao and Taiwan"],["调查报告","Research Report"],["来源可复核","Verifiable sources"],["AI 助手","AI Assistant"],["只读已购报告","Reads purchased reports only"],
  ["需要系统接入？直接使用同源 API","Need system integration? Use the same-source APIs."],["商情局与全球查属于同一业务主体，接口名称、路径、参数、返回契约和价格完全一致。","Shangqingju and GlobalCheck share the same business entity, API names, paths, parameters, response contracts and pricing."],["浏览 API 市场","Browse API Marketplace"],["管理 API 账户","Manage API Account"],
  ["自然人参股公司查询","Individual Shareholding Companies Search"],["自然人任职公司查询","Individual Management Roles Search"],["自然人身份识别","Individual Identity Resolution"],["企业董监高与管理人员查询","Company Directors and Executives Search"],["自然人主体信息","Individual Profiles"],["根据 PID 查询个人直接和间接参股的公司。","Find companies directly or indirectly held by an individual using a PID."],["根据 PID 查询该个人现任或历史董事、高管、经理、授权签字人等任职公司。","Find companies where an individual currently or historically served as a director, executive, manager or authorized signatory."],["先按公司名搜索前 10 个企业候选，再按姓名和可选性别查询并合并相关人员和企业关系。","Search up to ten company candidates, then resolve the person and related company relationships by name and optional gender."],["根据企业 EID 获取董事及高管关系，按 PID 合并同一人员的多个任职角色。","Retrieve directors and executives by company EID and merge multiple roles for the same PID."],
  ["返回数据 API 市场","Back to Data API Marketplace"],["请求方式","Method"],["接口地址","Endpoint"],["免费试用","Free trial"],["立即购买","Buy now"],["免费开通","Enable free"],["查看文档","View documentation"],["收藏 API","Save API"],["接口文档","API documentation"],["概览","Overview"],["接口说明","Endpoint details"],["请求参数","Request parameters"],["返回结果","Response"],["字段解释","Field reference"],["调用示例","Code examples"],["计费说明","Billing"],["相关 API","Related APIs"],["参数名","Parameter"],["必填","Required"],["位置","Location"],["说明 / 示例","Description / example"],
  ["经营与交付概览","Operations and Delivery Overview"],["所有指标均为演示数据","All metrics are demo data"],["今日 5 篇市场深度文章已发布","Five in-depth market articles published today"],["46 条公开信号已完成筛选、生成和人工复核","46 public signals were screened, drafted and manually reviewed"],["今日搜索","Searches today"],["付费转化","Paid conversion"],["报告成功率","Report success rate"],["今日资讯","Insights today"],["待人工复核","Pending review"],["近 7 日内容发布","Content published in the last 7 days"],["内容 Agent 健康度","Content Agent health"],["运营后台","Operations Console"],["超级运营员","Operations Administrator"],["全模块演示权限","Full demo access"],
  ["开发者工作台","Developer Workspace"],["统一管理应用、密钥、调用、文档和多种接入方式。","Manage apps, credentials, usage, documentation and every integration channel in one place."],["API Key 管理","API Key Management"],["创建、停用和轮换开发者调用凭证。","Create, disable and rotate developer credentials."],["查看鉴权文档","Authentication Guide"],["密钥名称","Key name"],["创建密钥","Create key"],["当前密钥","Current keys"],["完整密钥不可重复查看","Full keys cannot be viewed again"],["请立即保存完整密钥，仅展示这一次","Save this full key now. It is shown only once."],["关闭或离开页面后将无法再次查看。","You cannot view it again after closing or leaving this page."],["复制密钥","Copy key"],["轮换生产密钥","Rotate production key"],["最近使用","Last used"],["创建时间","Created"],["停用","Disable"],["启用","Enable"],["调用与用量","Usage & Logs"],["按渠道、时间和 OperationId 查看请求、计费与返回状态。","Review requests, billing and response states by channel, time and OperationId."],["调用记录","Request history"],["API 文档","API Documentation"],["从鉴权、首个请求到统一响应，快速接入全球查同源的 33 个接口。","Integrate 33 same-source GlobalCheck APIs from authentication through unified responses."],["浏览接口","Browse APIs"],["签名与请求约定","Authentication & Request Conventions"],["开发资源","Developer Resources"],["CLI 接入","CLI Integration"],["面向研发、数据分析和自动化任务的轻量命令行工具。","A lightweight CLI for engineering, analytics and automation."],["下载 CLI","Download CLI"],["安装 CLI","Install CLI"],["配置环境变量","Configure environment variables"],["常用命令","Common commands"],["可用命令","Available commands"],["MCP 工具","MCP Tools"],["让支持 MCP 的 Agent 在权限和计费边界内调用企业数据能力。","Let MCP-compatible agents call company data tools within explicit permission and billing boundaries."],["配置凭证","Configure credentials"],["面向 Agent 的企业数据工具","Company data tools for agents"],["权限可控、调用可追踪","Controlled access and traceable calls"],["可用工具","Available tools"],
  ["开发者中心","Developer Center"],["开发文档","Documentation"],["选能力","Discover"],["管调用","Operate"],["做接入","Integrate"],["账户与调用","Account & Usage"],["接入指南","Integration Guides"],["接入总览","Overview"],["CLI 命令行","CLI"],["MCP / Agent","MCP / Agent"],
  ["选择并开通数据能力","Discover and Activate Data APIs"],["这里负责找接口、比较能力与价格并完成开通；技术接入方法统一放在“开发文档”。","Discover endpoints, compare capabilities and pricing, then activate access. Technical implementation lives in Documentation."],["33 个接口、8 个业务分组；名称、路径、参数和单价与全球查接口清单一致","33 endpoints across 8 business groups. Names, paths, parameters and prices match the GlobalCheck API catalog."],["开通接口后，在这里管理应用、凭证、余额、调用记录与运行状态。","After activation, manage apps, credentials, balance, request logs and runtime status here."],
  ["围绕同一套 33 个接口，集中说明鉴权、请求、响应、计费，以及 API、CLI 和 MCP 三种接入方式。","One documentation hub for authentication, requests, responses, billing and three access channels across the same 33 endpoints: API, CLI and MCP."],["查看 33 个接口","View 33 endpoints"],["发现能力、查看单价、购买或免费开通。","Discover capabilities, review prices, and purchase or activate free endpoints."],["创建密钥，管理余额、用量和调用日志。","Create credentials and manage balance, usage and request logs."],["选择 API、CLI 或 MCP，完成实际接入。","Choose API, CLI or MCP and complete your integration."],["同一套数据能力，三种接入方式","One capability set, three access channels"],["CLI 和 MCP 不是新的 API 产品，而是对 33 个接口的不同调用入口；权限、计费和日志全部共用开发者中心。","CLI and MCP are not separate data products. They are additional access channels for the same 33 endpoints and share permissions, billing and logs in Developer Center."],["系统直接集成","Direct system integration"],["适合网站、SaaS、风控和业务系统","For websites, SaaS, risk and business systems"],["命令行与批处理","Command line and batch jobs"],["适合研发联调、脚本和数据任务","For engineering, scripts and data jobs"],["Agent 工具调用","Agent tool calls"],["适合大模型和自动化智能体","For LLMs and automated agents"],
  ["接口总数","Total endpoints"],["23 个 POST · 10 个 GET","23 POST · 10 GET"],["业务分组","Business groups"],["自然人、主体、股权、风险、科创等","People, entities, ownership, risk, innovation and more"],["按次计费","Per-call pricing"],["以接口清单与返回 isCost 为准","Based on the API catalog and returned isCost"],["统一契约","Unified contract"],["33 个接口的业务分组","Business groups for all 33 endpoints"],["分类、名称、请求方式、路径和单价均以《全球查 API 接口清单》为准。","Groups, names, methods, paths and prices follow the GlobalCheck API catalog."],["打开完整目录","Open full catalog"],["统一鉴权与响应","Unified authentication and response"],["正式调用使用 HTTPS 请求头 X-API-Key。所有接口都返回统一业务外壳，业务无记录与系统异常必须分开处理。","Production calls use X-API-Key over HTTPS. Every endpoint uses a unified envelope, and no-record results must be handled separately from system failures."],["200 成功；201 数据不存在；500/501 系统或上游异常","200 success; 201 no data; 500/501 system or upstream failure"],["稳定错误码","Stable error code"],["1 计费；0 不计费","1 billed; 0 not billed"],["单次请求追踪编号","Per-request trace identifier"],
  ["自然人主体信息","Natural Person Data"],["主体识别与基础信息","Entity Resolution & Profile"],["股权、组织架构与控制权","Ownership & Control"],["司法、合规与负面风险","Legal, Compliance & Adverse Risk"],["知识产权与科创资产","IP & Innovation"],["经营表现与财务运营","Operations & Financials"],["国际合规与制裁筛查","Sanctions & International Compliance"],["专项风险与交易情报","Special Risk & Transaction Intelligence"],
  ["企业公开联系方式与触点","Company Public Contacts"],["企业上市信息与GIIN代码查询M4","Listings and GIIN (M4)"],["企业司法合规明细","Legal and Compliance Detail"],["企业负面信号明细","Adverse Signals Detail"],["企业知识产权创新查询","IP and Innovation"],["专利价值-交易-诉讼概要查询M10","Patent Value, Transactions and Litigation (M10)"],["企业实时经营信号","Real-time Operating Signals"],["企业财务数据查询","Company Financials"],["制裁与相关法律风险详情查询M6","Sanctions and Legal Risk Detail (M6)"],["企业制裁与PEP明细","Sanctions and PEP Detail"],["企业 KYB 尽调","Company KYB Screening"],["并购交易概述查询M9","M&A Overview (M9)"],
  ["CLI 是 33 个接口的命令行适配器，适合研发联调、批量查询、脚本和自动化任务；不产生新的数据能力或计费规则。","The CLI is a command-line adapter for the same 33 endpoints, designed for engineering, batch queries, scripts and automation. It adds no new data products or billing rules."],["MCP 把同一套 33 个接口包装成 Agent 工具，继续共用 API Key、余额、计费规则与调用日志。","MCP exposes the same 33 endpoints as agent tools while sharing API keys, balance, billing rules and request logs."],
  ["开发者账户","Developer account"],["商情局开放平台","Shangqingju Open Platform"],["统一管理应用 · 凭证 · 余额 · 调用","Manage apps · credentials · balance · usage"],
  ["企业数据智能","Company Data Intelligence"],["主体识别、股权关系、司法风险与经营信息","Entity resolution, ownership, legal risk and operations"],["Agent 与 MCP","Agents and MCP"],["让智能体在权限边界内调用企业数据","Let agents call company data within permission boundaries"],["多种开发者接入","Multiple developer channels"],["Web、API、CLI 与 MCP 共用能力目录","Web, API, CLI and MCP share one capability catalog"],["可信调用","Trusted usage"],["权限隔离、用量记录、计费与请求追踪","Permission isolation, usage logs, billing and request tracing"],
  ["企业数据能力市场","Company Data Marketplace"],["按企业调查场景选择所需能力，比较用途与价格，完成免费开通或付费购买。技术参数统一放在“开发文档”。","Choose capabilities by company-research scenario, compare use cases and prices, then activate or purchase. Technical specifications live in Documentation."],["搜索企业查询、股权、司法风险、制裁等业务能力","Search company profiles, ownership, legal risk, sanctions and more"],["按业务用途浏览与购买；接口路径、参数和返回字段请前往开发文档","Browse and purchase by business use case. See Documentation for paths, parameters and response fields."],["查看技术文档","View technical docs"],["适用场景","Use cases"],["调用单价","Price per call"],["成功返回后计费","Charged only on billable responses"],["购买后即可接入","Connect after activation"],["开通能力后，在开发者中心创建凭证、查看余额和调用记录；具体接入方法与技术契约请查看开发文档。","After activation, create credentials and review balance and usage in Developer Center. See Documentation for integration instructions and technical contracts."],
  ["选择 API 分类","Choose an API Category"],["先按业务领域进入分类，再查看其中的接口清单。单个接口的参数、返回字段、调用示例和计费说明均在详情页展开。","Start with a business category, then browse its endpoint list. Parameters, response fields, code examples and billing are shown on each API detail page."],["8 个分类 · 33 个 API","8 categories · 33 APIs"],["全部分类","All categories"],["搜索结果","Search results"],["所有 API","All APIs"],["接口名称","API"],["成功调用","Successful call"],["查看详情","View details"],["暂无匹配接口，请调整搜索关键词。","No matching APIs. Try another search."],["这里是全球查同源 API 的能力目录，用于发现、比较和进入技术详情，不按报告模块方式购买。","This catalog organizes APIs powered by the same GlobalCheck source for discovery, comparison and technical review—not as report modules."],["搜索 API 名称、OperationId 或接口路径","Search API name, OperationId or endpoint"],["市场与技术文档的边界","Marketplace vs. technical documentation"],["API 市场用于找到接口；点击具体 API 后，再查看概览、请求参数、返回字段、代码示例与每次调用的计费规则。","Use the marketplace to find an endpoint. Open an API to review its overview, parameters, response fields, code examples and per-call billing rules."],
  ["自然人身份识别、任职和参股关系","Identity resolution, roles and shareholding relationships"],["企业身份解析、基础档案与公开联系方式","Entity resolution, profiles and public contacts"],["股东、受益所有人、投资和控制链路","Shareholders, beneficial owners, investments and control chains"],["司法案件、行政处罚、负面信号与法律事件","Litigation, penalties, adverse signals and legal events"],["专利、商标、创新指标、交易和诉讼","Patents, trademarks, innovation, transactions and disputes"],["财务数据、经营信号、事件时间线与采购记录","Financials, operating signals, event timelines and procurement"],["制裁、PEP、出口管制与所有权延伸筛查","Sanctions, PEP, export controls and ownership screening"],["KYB、并购交易与网络安全专项数据","KYB, M&A transactions and cyber-risk intelligence"],["浏览该分类下的全球企业数据接口。","Browse global company data APIs in this category."],
  ["开放能力范围","Capability scope"],["全部 33 个 API","All 33 APIs"],["8 个业务分组 · API / CLI / MCP","8 business groups · API / CLI / MCP"],["示例应用","Example application"],["可调用已开通 API","Calls activated APIs"],["全部 33 个可接接口","All 33 available endpoints"],["点击任一接口进入详情，查看真实 OperationId、路径、请求参数、返回字段、单价与 API、CLI、MCP 调用示例。","Open any endpoint to review its OperationId, path, request parameters, response fields, pricing, and API, CLI and MCP examples."],["前往购买与开通","Purchase or activate"],["33 个可用命令","33 available commands"],["每个命令与 API OperationId 一一对应","Each command maps one-to-one to an API OperationId"],["33 个 MCP 工具","33 MCP tools"],["每个工具映射同一套 API 权限、计费和日志","Every tool shares the same API permissions, billing and logs"],["当前应用","Current application"],["全能力测试应用","Full-capability Test App"],["凭证安全","Credential security"],["密钥明文仅在创建时展示一次，请勿写入前端代码。","A full secret is shown only once. Never embed it in client-side code."],["创建 API Key","Create API Key"],["API 余额","API balance"],["成功调用后扣费","Charged only for successful billable calls"],["今日调用","Calls today"],["较昨日 +12.4%","12.4% above yesterday"],["成功率","Success rate"],["不含业务无记录","Excludes valid no-record responses"],["延迟","latency"],["测试环境","Sandbox"],["近 7 日调用趋势","7-day request trend"],["Web、API、CLI 与 MCP 统一计量","Unified metering across Web, API, CLI and MCP"],["查看全部","View all"],["接入方式","Integration channels"],["同一套能力，多种调用入口","One capability set, multiple access channels"],["本地脚本与自动化","Local scripts and automation"],["Agent 与大模型工具","Agents and LLM tools"],["最近调用","Recent requests"],["请求渠道、数据状态、计费和耗时统一追踪","Track channel, data state, billing and latency together"],["调用日志","Request logs"],["例如：生产环境、数据分析服务","For example: production or analytics service"],["本地开发 Key","Local development key"],["服务端保存","Store server-side"],["使用环境变量或密钥管理服务，不要写入浏览器、本地仓库或截图。","Use environment variables or a secret manager. Never place secrets in browsers, repositories or screenshots."],["定期轮换","Rotate regularly"],["建议生产密钥每 90 天轮换，并在调用日志中核对异常来源。","Rotate production credentials every 90 days and review request logs for anomalies."],["权限隔离","Isolate permissions"],["测试与生产应用分别创建密钥，配置独立额度和 IP 白名单。","Use separate credentials, quotas and IP allowlists for test and production apps."],["今天","Today"],["本地联调","Local integration"],
  ["搜索 Request ID 或 OperationId","Search Request ID or OperationId"],["全部渠道","All channels"],["最近 30 天","Last 30 days"],["全部状态","All statuses"],["第 1 页 · 每页 20 条","Page 1 · 20 rows per page"],["导出 CSV","Export CSV"],["请求 ID","Request ID"],["请求时间","Requested at"],["首个 API 请求","First API request"],["创建凭证","Create credentials"],["为测试与生产环境创建独立 API Key","Create separate API keys for test and production"],["完成首个请求","Send your first request"],["使用 HTTPS 请求头 X-API-Key 发起调用","Call the API with X-API-Key over HTTPS"],["处理统一状态","Handle unified response states"],["区分业务无记录、无覆盖与系统异常","Distinguish no record, no coverage and system failures"],["正式接口与全球查保持同一 OperationId、路径、参数和返回契约。密钥只用于服务端调用。","Production endpoints use the same OperationIds, paths, parameters and response contract as GlobalCheck. Credentials are server-side only."],["客户调用凭证","Client credential"],["Unix 秒级时间戳","Unix timestamp in seconds"],["按全球查签名规则计算","Computed with the GlobalCheck signing scheme"],["本次请求是否计费","Whether this request is billable"],["请求成功并返回有效业务数据，按接口规则计费。","The request succeeded and returned usable business data; billing follows the endpoint rule."],["完成查询但没有发现记录，属于有效业务结果。","The query completed but found no record; this is a valid business result."],["当前国家、主体或字段暂未覆盖，不生成推测内容。","The jurisdiction, entity or field is not covered; no inferred content is generated."],["系统或上游异常不计费，并保留 requestId 便于追踪。","System or upstream failures are not billed and retain a requestId for diagnostics."],["同一套企业数据能力，按你的技术栈接入","Use the same company data capabilities with your preferred stack"],["API 接口目录","API catalog"],["33 个全球查同源接口与详细契约","33 same-source GlobalCheck endpoints with detailed contracts"],["CLI 命令行","CLI"],["批量查询与自动化脚本","Batch queries and automation scripts"],["让 Agent 直接调用企业数据能力","Let agents call company data tools directly"],["统一排查请求、计费和异常","Diagnose requests, billing and failures in one place"],
  ["准备 Python 环境","Prepare Python"],["支持 Python 3.11+，建议在独立虚拟环境中安装。","Supports Python 3.11+; use an isolated virtual environment."],["通过环境变量传入密钥，不在命令历史中暴露。","Pass credentials through environment variables so they do not appear in shell history."],["调用企业能力","Call company data tools"],["输出 JSON，方便连接脚本、数据管道和 CI 任务。","Return JSON for scripts, data pipelines and CI jobs."],["与 API 市场中的接口保持同源映射","Maps directly to endpoints in the API Marketplace"],["工具只包装已有 API，不改变数据来源、返回契约和计费规则。","Tools wrap existing APIs without changing data sources, response contracts or billing rules."],["每次调用都绑定应用、API Key 和 requestId，可在用量中心审计。","Every call is tied to an app, API key and requestId for audit in Usage."],["全局与国内数据库隔离","Global and Mainland China databases stay isolated"],["查询时明确数据库范围，不自动混合两个独立数据源。","Every query specifies a database scope; independent sources are never mixed automatically."],["三步接入","Connect in three steps"],["安装","Install"],["创建独立的 Agent API Key","Create a dedicated Agent API key"],["把右侧配置加入 MCP Client","Add the configuration to your MCP client"],["复制安装命令","Copy install command"],["MCP Client 配置","MCP client configuration"],["工具调用示例","Tool call example"],["以下工具映射商情局已开放的企业数据接口","These tools map to company data endpoints available in Shangqingju"],
  ["微信小程序 P0","WeChat Mini Program P0"],["移动端保留搜索、购买、进度、报告摘要与 AI；刻意移除 API 市场、密钥、文件上传、复杂股权图和超宽表格。","The mobile experience keeps search, purchase, progress, report summaries and AI, while API sales, keys, file uploads, complex ownership graphs and wide tables remain on the web."],["与 Web 共用账户和报告","Shared account and reports with the web app"],["优先微信一键登录与支付","Prioritize one-tap WeChat sign-in and payment"],["复杂内容引导 Web 查看","Open complex content on the web"],["AI 只读当前已购报告","AI reads only the current purchased report"],["返回 Web 原型","Back to Web prototype"],["全球企业调查","Global company research"],["查清企业，再做决定。","Know the company. Decide with confidence."],["按模块购买 · 自动报告 · AI 解读","Buy by module · Automated reports · AI analysis"],["常用国家","Popular jurisdictions"],["最近报告","Recent reports"],["服务边界","Service scope"],["小程序不提供 API 售卖、文件上传和复杂图谱。可在 Web 端使用完整功能。","API purchases, file uploads and complex graphs are available in the full web app."],
  ["2.3 亿+","230M+"],["12.8 万家","128K"],["8.6 万家","86K"],["6.2 万家","62K"],["9.4 万家","94K"],["11.1 万家","111K"],["4.7 万家","47K"],["7.9 万家","79K"],["15.3 万家","153K"],
  ["全球企业主体","Global company entities"],["同源数据 API","APIs from the same source"],["企业调查模块","research modules"],["来源与数据日期","Sources and data dates"],["可追溯","Traceable"],
  ["首页","Home"],["热门资讯","Market Insights"],["数据 API","Data API"],["登录","Sign in"],["已登录","Signed in"],["语言切换","Language"],["返回产品首页","Back to product"],["返回用户端","Back to customer site"],
  ["微信扫码进入小程序","Scan to open the Mini Program"],["登录、查企业、看报告","Sign in, search companies and read reports"],["下载商情局 APP","Download the Shangqingju app"],["接收报告提醒，随时查看订单与资讯","Receive report alerts and access orders and market intelligence"],["用户协议 · 隐私政策","Terms · Privacy"],
  ["确认你要调查的企业主体","Confirm the exact company"],["筛选结果","Filter results"],["国家/地区","Jurisdiction"],["全部国家","All jurisdictions"],["经营状态","Operating status"],["全部状态","All statuses"],["数据更新时间","Data updated"],["主体匹配置信度","Entity match confidence"],["确认此主体","Confirm company"],["查看识别依据","View match evidence"],["演示主体","Demo entity"],["按匹配度排序","Sorted by match score"],["个候选主体","candidate(s)"],["未找到记录。请补充注册号、国家或地址。","No record found. Add a registry ID, jurisdiction or address."],["重置","Reset"],
  ["若主体匹配仍不足，系统会要求补充注册号或地址，不会直接进入收费。","If the entity match is still insufficient, add a registration number or address before purchasing."],["现有字段表没有稳定 fieldCode；本原型只引用 sourceField，不把临时语义名当正式数据字典。","The current field sheet has no stable fieldCode. This prototype references sourceField only and does not treat temporary semantic names as a production data dictionary."],
  ["我的报告与订单","My reports and orders"],["报告版本不可覆盖；增购、刷新与重新生成都会形成新版本。","Report versions are immutable; refreshes and add-ons create a new version."],["我的报告","My Reports"],["生成任务","Generation tasks"],["我的订单","Orders"],["全部","All"],["已完成","Completed"],["生成中","Generating"],["已退款","Refunded"],["在线阅读","Read online"],["下载 PDF","Download PDF"],["增购模块","Add modules"],["查看进度","View progress"],
  ["账户中心","Account"],["报告权限","Report access"],["开发者权限","Developer access"],["查看报告","View reports"],["进入控制台","Open console"],
  ["中国大陆","Mainland China"],["中国香港","Hong Kong"],["美国","United States"],["新加坡","Singapore"],["英国","United Kingdom"],["德国","Germany"],["法国","France"],["日本","Japan"],["韩国","South Korea"],["在营","Active"],["已注销","Inactive"],["高","High"],["中等","Medium"],["部分完成","Partial"],["当前报告","Current report"]
];

const englishUiTokens = [
  ["合肥易尊数字科技有限公司","Hefei Yizun Digital Technology Co., Ltd."],["上海青岚科技有限公司","Shanghai Qinglan Technology Co., Ltd."],["上海青岚科技","Shanghai Qinglan Technology"],["优必选科技","UBTECH Robotics"],["商情局","Shangqingju"],["全球查","GlobalCheck"],["生意社","SunSirs"],["金十数据","Jin10"],["投中网","ChinaVenture"],["华尔街见闻","WallstreetCN"],["同花顺","10jqka"],["雪球","Xueqiu"],
  ["原型视图","Prototype View"],["Web 用户端","Web App"],["用户端","Customer App"],["小程序","Mini Program"],["API 平台","API Platform"],["设计标注","Design Notes"],["当前页面标注","Current Page Notes"],["页面标注","Page Notes"],["运营后台","Operations Console"],["我的账户","My Account"],["个人中心","Account Center"],["开放平台","Open Platform"],["开发者控制台","Developer Console"],["文档中心","Documentation"],["API 市场","API Marketplace"],
  ["免费阅读","Free to read"],["全部免费","Free for everyone"],["阅读全文","Read analysis"],["商情局原创","Shangqingju Original"],["原始参考来源","Original source"],["查看原始披露","Open original disclosure"],["来源发布日期","Source publication date"],
  ["导航","Navigation"],["客户","Customer"],["信息","Information"],["购买","Purchase"],["问答","Q&A"],["独立切换","Switch independently"],["贯穿","Connects"],["验收","Acceptance"],["地区","Region"],["北辰零部件","Beichen Components"],["自然人","Individual"],["参股","Shareholding"],["任职","Role"],["公司","Company"],["是否","Whether"],["是","Yes"],["否","No"],
  ["企业名称","Company name"],["公司名称","Company name"],["注册号","Registration number"],["统一社会信用代码","Unified Social Credit Code"],["注册地址","Registered address"],["经营范围","Business scope"],["品牌","brand"],["地址","address"],["股东","shareholders"],["高管","executives"],["老板","executive"],
  ["报告","Report"],["订单","Order"],["发票","Invoice"],["余额","Balance"],["充值","Top up"],["支付","Payment"],["退款","Refund"],["用户","User"],["账户","Account"],["企业","Company"],["主体","Entity"],["模块","Module"],["任务","Task"],["来源","Source"],["数据源","Data Source"],["数据","Data"],["字段","Field"],["状态","Status"],["操作","Action"],["详情","Details"],["设置","Settings"],["配置","Configuration"],["管理","Manage"],["保存","Save"],["取消","Cancel"],["关闭","Close"],["确认","Confirm"],["提交","Submit"],["搜索","Search"],["查询","Search"],["查看","View"],["下载","Download"],["返回","Back"],["需求","Requirement"],["接口","API"],["页面","Page"],["我的","My"],["全部","All"],["当前","Current"],["今日","Today"],["最近","Recent"],["重点","Priority"],["内容","Content"],["资讯","Insights"],["线索","Signal"],["发布","Publish"],["生成","Generate"],["成功","Successful"],["失败","Failed"],["异常","Exception"],["正常","Normal"],["待处理","Pending"],["未开通","Not enabled"],["已发布","Published"],["已保存","Saved"],["已选择","Selected"],["已支付","Paid"],["未支付","Unpaid"],["演示","Demo"],["正式","Production"],["测试","Test"],["免费","Free"],["国内","Mainland China"],["全球","Global"],["中国","China"],["市场","Market"],["风险","Risk"],["投资","Investment"],["行业","Industry"],["知识产权","Intellectual Property"],["年报","Annual Report"],["价格","Pricing"],["优惠","Promotions"],["覆盖","Coverage"],["国家","Jurisdiction"],["模型","Model"],["服务商","Provider"],["应用","Application"],["密钥","Key"],["调用","Call"],["日志","Log"],["用量","Usage"],["账单","Billing"],["金额","Amount"],["方式","Method"],["类型","Type"],["资料","Details"],["手机号","Mobile number"],["微信","WeChat"],["支付宝","Alipay"],["专票","VAT special invoice"],["普票","Standard invoice"],["申请","Application"],["收入","Revenue"],["成本","Cost"],["转化","Conversion"],
  ["有限公司","Co., Ltd."],["股份有限公司","Co., Ltd."],["人工智能","Artificial Intelligence"],["先进制造","Advanced Manufacturing"],["跨境电商","Cross-border E-commerce"],["医疗健康","Healthcare"],["新能源","New Energy"],["半导体","Semiconductors"],["企业服务","Enterprise Services"],["消费品牌","Consumer Brands"],
  ["个",""],["项"," items"],["笔"," orders"],["次"," calls"],["篇"," articles"],["条"," records"],["页"," pages"],["类"," categories"],["天"," days"],["人"," users"]
];

function localizeMarkup(markup) {
  if (state.locale !== "en") return markup;
  return [...englishReplacements]
    .sort((a,b)=>b[0].length-a[0].length)
    .reduce((html, [zh, en]) => html.replaceAll(zh, en), markup);
}

function englishizeText(value) {
  if (state.locale !== "en" || !/[\u3400-\u9fff]/.test(String(value || ""))) return value;
  let output = String(value);
  for (const [zh,en] of [...englishReplacements].sort((a,b)=>b[0].length-a[0].length)) output = output.replaceAll(zh,en);
  for (const [zh,en] of [...englishUiTokens].sort((a,b)=>b[0].length-a[0].length)) output = output.replaceAll(zh,` ${en} `);
  const missing = output.match(/[\u3400-\u9fff]+/g) || [];
  window.__sqjMissingTranslations ||= {};
  missing.forEach((text)=>{ window.__sqjMissingTranslations[text] = (window.__sqjMissingTranslations[text] || 0) + 1; });
  output = output.replace(/[\u3400-\u9fff]+/g," Information ");
  output = output.replace(/\s{2,}/g," ").replace(/Information(?:\s*Information)+/g,"Information").replace(/\s+([,.;:!?])/g,"$1");
  return output.replaceAll("Information Overview", "Operations and Delivery Overview");
}

function enforceEnglishDOM(root = document) {
  if (state.locale !== "en") return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node)=>{
    if (node.parentElement?.closest("script,style")) return;
    node.nodeValue = englishizeText(node.nodeValue);
  });
  root.querySelectorAll("[placeholder],[title],[aria-label],[alt]").forEach((element)=>{
    for (const attr of ["placeholder","title","aria-label","alt"]) {
      if (element.hasAttribute(attr)) element.setAttribute(attr,englishizeText(element.getAttribute(attr)));
    }
  });
  root.querySelectorAll("input,textarea").forEach((element)=>{
    if (/[\u3400-\u9fff]/.test(element.value)) element.value = englishizeText(element.value);
  });
}

function languageSwitch() {
  return `<div class="language-switch" role="group" aria-label="${tr("语言切换", "Language")}"><button data-action="set-language" data-lang="zh" class="${state.locale === "zh" ? "active" : ""}" aria-pressed="${state.locale === "zh"}">${state.locale === "en" ? "ZH" : "中"}</button><button data-action="set-language" data-lang="en" class="${state.locale === "en" ? "active" : ""}" aria-pressed="${state.locale === "en"}">EN</button></div>`;
}

const icons = {
  search: '<path d="m21 21-4.3-4.3m2.3-5.2A7.5 7.5 0 1 1 4 11.5a7.5 7.5 0 0 1 15 0Z"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  shield: '<path d="M12 3 5 6v5c0 4.7 2.9 8 7 10 4.1-2 7-5.3 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-5"/>',
  report: '<path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4M9 11h6M9 15h6"/>',
  api: '<path d="M8 9 4 12l4 3M16 9l4 3-4 3M14 5l-4 14"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  spark: '<path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"/>',
  upload: '<path d="M12 16V4m-4 4 4-4 4 4"/><path d="M5 14v6h14v-6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v7H4V6h7"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  download: '<path d="M12 3v12m-4-4 4 4 4-4"/><path d="M5 19h14"/>',
  alert: '<path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 9v4m0 3h.01"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21h-4v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3.1 14H3v-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.5V3h4v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1v4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
};

function icon(name, size = 20) {
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.spark}</svg>`;
}

function logo() {
  return `<span class="brand-logo-composed"><img src="assets/sqj-mark-v4.svg" alt="SQJ"><span class="brand-logo-copy"><strong>${tr("商情局", "SHANGQINGJU")}</strong><small>${tr("全球企业情报 · 一查即明", "GLOBAL COMPANY INTELLIGENCE")}</small></span></span>`;
}

function route() {
  const raw = location.hash.replace(/^#\/?/, "") || "home";
  const [name, queryString = ""] = raw.split("?");
  return { name, params: new URLSearchParams(queryString) };
}

let lastRenderedRoute = null;

function go(name) {
  location.hash = `#/${name}`;
}

function money(value) {
  return `¥${value.toLocaleString("zh-CN")}`;
}

function apiMoney(value) {
  return `¥${Number(value).toFixed(2)}`;
}

function apiDemoCharge(code, billable = true) {
  if (!billable) return apiMoney(0);
  const product = apiProducts.find((item) => item.code === code);
  return apiMoney(product?.price ?? 0.10);
}

function currentOrderQuote() {
  const selected = modules.filter((module) => state.selectedModules.has(module.code));
  const subtotal = selected.reduce((sum, module) => sum + module.price, 0);
  const discount = selected.length >= 3 ? Math.round(subtotal * 0.12) : 0;
  return { selected, subtotal, discount, total: subtotal - discount };
}

function invoiceTypeLabel() {
  return state.invoiceType === "VAT_SPECIAL" ? "增值税专用发票" : "增值税普通发票";
}

function missingInvoiceFields() {
  const fields = state.invoiceType === "VAT_SPECIAL"
    ? [
        ["title", "单位名称"],
        ["taxId", "纳税人识别号"],
        ["registeredAddress", "注册地址"],
        ["registeredPhone", "注册电话"],
        ["bankName", "开户行名称"],
        ["bankAccount", "银行账号"],
        ["email", "电子发票接收邮箱"],
      ]
    : [["title", "发票抬头"], ["email", "电子发票接收邮箱"]];
  return fields.filter(([field]) => !String(state.invoiceProfile[field] || "").trim()).map(([, label]) => label);
}

function invoiceProfileComplete() {
  return missingInvoiceFields().length === 0;
}

function invoiceTypeSwitchMarkup() {
  return `<div class="invoice-type-switch" role="radiogroup" aria-label="发票类型"><button type="button" role="radio" aria-checked="${state.invoiceType === "VAT_ORDINARY"}" class="${state.invoiceType === "VAT_ORDINARY" ? "selected" : ""}" data-action="set-invoice-type" data-type="VAT_ORDINARY"><i>普</i><span><strong>增值税普通发票</strong><small>个人或单位常规报销</small></span></button><button type="button" role="radio" aria-checked="${state.invoiceType === "VAT_SPECIAL"}" class="${state.invoiceType === "VAT_SPECIAL" ? "selected" : ""}" data-action="set-invoice-type" data-type="VAT_SPECIAL"><i>专</i><span><strong>增值税专用发票</strong><small>单位抵扣凭证，需完整资料</small></span></button></div>`;
}

function invoiceFieldsMarkup() {
  const commonEmail = `<label class="wide"><span>电子发票接收邮箱</span><input data-invoice-field="email" type="email" autocomplete="email" value="${state.invoiceProfile.email}" placeholder="name@example.com" /></label>`;
  if (state.invoiceType === "VAT_SPECIAL") {
    return `<label><span>单位名称</span><input data-invoice-field="title" value="${state.invoiceProfile.title}" placeholder="请填写营业执照上的全称" /></label><label><span>纳税人识别号</span><input data-invoice-field="taxId" value="${state.invoiceProfile.taxId}" placeholder="统一社会信用代码" /></label><label><span>注册地址</span><input data-invoice-field="registeredAddress" value="${state.invoiceProfile.registeredAddress}" placeholder="税务登记地址" /></label><label><span>注册电话</span><input data-invoice-field="registeredPhone" inputmode="tel" value="${state.invoiceProfile.registeredPhone}" placeholder="税务登记电话" /></label><label><span>开户行名称</span><input data-invoice-field="bankName" value="${state.invoiceProfile.bankName}" placeholder="企业基本账户开户行" /></label><label><span>银行账号</span><input data-invoice-field="bankAccount" inputmode="numeric" value="${state.invoiceProfile.bankAccount}" placeholder="企业基本账户账号" /></label>${commonEmail}`;
  }
  return `<label><span>发票抬头</span><input data-invoice-field="title" value="${state.invoiceProfile.title}" placeholder="请输入企业或个人名称" /></label><label><span>纳税人识别号（单位普票）</span><input data-invoice-field="taxId" value="${state.invoiceProfile.taxId}" placeholder="单位抬头请填写税号" /></label>${commonEmail}`;
}

function renderAccountInvoiceCard() {
  const eligibleOrders = demoInvoiceOrders.filter((order) => !state.invoicedOrderIds.has(order.id));
  const selectedOrders = eligibleOrders.filter((order) => state.invoiceApplicationOrders.has(order.id));
  const selectedAmount = selectedOrders.reduce((sum, order) => sum + order.amount, 0);
  const latest = state.lastInvoiceApplication;
  const applicationPanel = state.invoiceApplicationOpen ? `<form class="invoice-application" data-form="invoice-application"><section class="invoice-application-step"><header><span>01</span><div><strong>选择可开票订单</strong><small>可勾选多笔已支付、未开票订单合并申请。</small></div></header><div class="invoice-order-list">${eligibleOrders.length ? eligibleOrders.map((order) => `<label class="${state.invoiceApplicationOrders.has(order.id) ? "selected" : ""}"><input type="checkbox" data-invoice-order="${order.id}" ${state.invoiceApplicationOrders.has(order.id) ? "checked" : ""}/><span><strong>${order.company}</strong><small>${order.id} · 支付于 ${order.paidAt}</small></span><b>${money(order.amount)}</b></label>`).join("") : '<div class="invoice-order-empty">当前没有待开票订单</div>'}</div><div class="invoice-merge-summary"><span>已选 <strong>${selectedOrders.length}</strong> 笔${selectedOrders.length > 1 ? " · 合并开票" : ""}</span><b>${money(selectedAmount)}</b></div></section><section class="invoice-application-step"><header><span>02</span><div><strong>确认开票类型与资料</strong><small>默认带入上方保存的常用资料，本次仍可修改。</small></div></header>${invoiceTypeSwitchMarkup()}<div class="invoice-form account-invoice-fields">${invoiceFieldsMarkup()}</div>${state.invoiceType === "VAT_SPECIAL" ? '<div class="special-invoice-note"><strong>专票资料需完整</strong><span>请确保单位名称、税号、注册地址电话、开户行及账号均与税务登记信息一致。</span></div>' : ''}</section><footer><button type="button" data-action="toggle-invoice-application">取消</button><div><span>${selectedOrders.length > 1 ? "合并开票" : "本次开票"} · ${invoiceTypeLabel()}</span><strong>${money(selectedAmount)}</strong></div><button type="submit" ${selectedOrders.length ? "" : "disabled"}>提交开票申请 ${icon("arrow",15)}</button></footer></form>` : "";
  const latestStatus = latest ? `<div class="invoice-application-result"><span>${icon("check",17)}</span><div><strong>开票申请已提交</strong><small>${latest.applicationId} · ${latest.orderCount} 笔${latest.merge ? "合并" : ""} · ${latest.typeLabel} · ${money(latest.amount)}</small></div><b>待开票</b></div>` : "";
  return `<article class="account-invoice-card"><div class="account-card-title"><span>${icon("report",20)}</span><div><h2>发票信息与申请开票</h2><p>当前为开票流程示例：保存普票或专票资料，支持多笔已支付订单合并申请；不会真实开票。</p></div><b>${invoiceProfileComplete() ? `已保存·${state.invoiceType === "VAT_SPECIAL" ? "专票" : "普票"}` : "资料未完善"}</b></div><section class="saved-invoice-profile"><div class="saved-profile-head"><div><strong>常用开票资料</strong><span>切换类型后保存，收银台和开票申请会自动带入。</span></div>${invoiceTypeSwitchMarkup()}</div><form class="invoice-profile-form" data-form="invoice-profile"><div class="invoice-form account-invoice-fields">${invoiceFieldsMarkup()}</div>${state.invoiceType === "VAT_SPECIAL" ? '<div class="special-invoice-note"><strong>专票信息</strong><span>单位名称、税号、注册地址与电话、开户行与账号缺一不可。</span></div>' : ''}<button type="submit">保存${state.invoiceType === "VAT_SPECIAL" ? "专票" : "普票"}信息</button></form></section><div class="invoice-application-entry"><div><strong>申请开票</strong><span>${eligibleOrders.length ? `当前有 ${eligibleOrders.length} 笔已支付、未开票订单，支持合并申请。` : "当前没有待开票订单。"}</span></div><button data-action="toggle-invoice-application" ${eligibleOrders.length ? "" : "disabled"}>${state.invoiceApplicationOpen ? "收起申请" : "选择订单并申请"} ${icon("arrow",15)}</button></div>${latestStatus}${applicationPanel}<div class="invoice-history"><span>最近发票</span><p>${latest ? `申请已进入 Mock 开票队列，正式版将在此提供电子发票查看和下载。` : `当前没有已开具发票。可点击上方入口选择订单申请。`}</p></div></article>`;
}

function capturePendingPurchase() {
  const quote = currentOrderQuote();
  if (!state.pendingPurchase || !state.checkoutAttemptId) state.checkoutAttemptId = `CHECKOUT-${Date.now()}-${Math.random().toString(16).slice(2,8)}`;
  state.pendingPurchase = {
    companyId: state.selectedCompany.id,
    companyName: state.selectedCompany.name,
    modules: quote.selected.map((module) => module.code),
    moduleCount: quote.selected.length,
    amount: quote.total,
  };
  return state.pendingPurchase;
}

function renderPreservingScroll() {
  const scrollTop = window.scrollY;
  render();
  requestAnimationFrame(() => window.scrollTo({ top: scrollTop, behavior: "instant" }));
}

function completeLogin(session) {
  state.loggedIn = true;
  state.customer = session?.customer || { id: "CUS-DEMO-0001", mobileMasked: "138****8888" };
  const target = state.returnAfterLogin || "home";
  state.returnAfterLogin = null;
  if (["progress", "report"].includes(target.split("?")[0]) && !hasPaidReportAccess()) {
    go("home");
    setTimeout(() => toast("报告需完成购买和支付后访问，已返回首页。"), 80);
    return;
  }
  go(target);
}

function completeLogout(target = "home") {
  state.loggedIn = false;
  state.customer = null;
  state.returnAfterLogin = null;
  state.rechargeOpen = false;
  state.invoiceApplicationOpen = false;
  state.apiPurchaseOpen = false;
  state.apiKeyReveal = null;
  go(target);
  setTimeout(() => toast(tr("已安全退出登录", "Signed out securely")), 80);
}

function completeAdminLogin() {
  state.adminLoggedIn = true;
  const target = state.adminReturnAfterLogin || "admin";
  state.adminReturnAfterLogin = null;
  go(target);
  setTimeout(() => toast("已进入商情局运营后台（原型演示）"), 80);
}

function completeAdminLogout() {
  state.adminLoggedIn = false;
  state.adminReturnAfterLogin = null;
  state.adminDrawer = null;
  state.adminWorkflowModal = null;
  go("admin-login");
  setTimeout(() => toast("已安全退出运营后台"), 80);
}

function hasPaidReportAccess() {
  return Boolean(state.loggedIn && state.lastOrder?.status === "PAID" && (state.mockTask || state.mockReportId));
}

function stateBadge(value) {
  const labels = {
    AVAILABLE: "有可交付数据",
    NO_RECORD: "已核查 · 未发现记录",
    PARTIAL: "部分字段可用",
    NO_COVERAGE: "暂无可靠覆盖",
    AMBIGUOUS: "主体待确认",
    PROVIDER_ERROR: "数据源异常",
    SYSTEM_ERROR: "系统异常",
  };
  return `<span class="state-badge state-${value.toLowerCase()}">${labels[value] || value}</span>`;
}

function toast(message) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  toastRegion.append(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 250);
  }, 2600);
}

function prototypeBar() {
  const modes = [
    ["web", "Web 用户端", "home"],
    ["mini", "小程序", "mini-home"],
    ["api", "API 平台", "api-market"],
    ["admin", "运营后台", "admin"],
  ];
  return `<aside class="prototype-bar" aria-label="原型终端切换">
    <span class="prototype-label">原型视图</span>
    ${modes.map(([mode, label, target]) => `<button class="proto-tab ${state.mode === mode ? "active" : ""}" data-action="switch-mode" data-mode="${mode}" data-target="${target}">${label}</button>`).join("")}
    <span class="proto-separator"></span>
    <button class="proto-icon" data-action="reset-demo" title="重置演示">↺</button>
    <button class="proto-note" data-action="toggle-annotation">${icon("spark", 16)} 设计标注</button>
  </aside>`;
}

function annotationPanel(current) {
  const map = {
    home: ["REQ-SEARCH-001", "UI-WEB-HOME", "GET /v1/enterprises/search", "DATA: sourceField only", "E2E-01"],
    search: ["REQ-SEARCH-002", "UI-WEB-SEARCH", "GET /v1/enterprises/search", "DATA: EnterpriseCandidate", "E2E-01"],
    company: ["REQ-CATALOG-001", "UI-WEB-COMPANY", "GET /v1/enterprises/{id}", "DATA: ModuleAvailability", "E2E-04"],
    checkout: ["REQ-ORDER-001", "UI-WEB-CHECKOUT", "POST /v1/quotes · /v1/orders", "DATA: Quote + PriceVersion", "E2E-02"],
    progress: ["REQ-REPORT-001", "UI-WEB-PROGRESS", "GET /v1/report-tasks/{id}", "DATA: ReportTask + ModuleState", "E2E-03"],
    report: ["REQ-AI-001", "UI-WEB-REPORT-READER", "GET /v1/reports/{id}", "DATA: ReportVersion + CitationAnchor", "E2E-05"],
    insights: ["REQ-INSIGHT-001", "UI-WEB-INSIGHT-FEED", "GET /open/v1/insights", "DATA: DailyEdition + InsightArticle", "E2E-INSIGHT-01"],
    insight: ["REQ-INSIGHT-002", "UI-WEB-INSIGHT-ARTICLE", "GET /open/v1/insights/{id}", "DATA: Article + SourceReference", "E2E-INSIGHT-02"],
    login: ["REQ-AUTH-001", "UI-WEB-LOGIN", "POST /v1/auth/session", "DATA: CustomerSession", "E2E-AUTH-01"],
    account: ["REQ-AUTH-002", "UI-WEB-ACCOUNT", "GET /v1/customer/me", "DATA: CustomerProfile", "E2E-AUTH-02"],
    "api-market": ["REQ-OPENAPI-001", "UI-WEB-API-MARKET", "GET /open/v1/api-products · POST /open/v1/api-balance-orders", "DATA: ApiProduct + BalanceOrder", "E2E-08"],
    "api-detail": ["REQ-OPENAPI-003", "UI-WEB-API-DETAIL", "GET /open/v1/api-products/{code}", "DATA: ApiProduct + RequestSchema + ResponseSchema", "E2E-API-DETAIL"],
    "api-console": ["REQ-OPENAPI-002", "UI-WEB-API-CONSOLE", "GET /open/v1/usage", "DATA: DeveloperApp + ApiUsage", "E2E-08"],
    admin: ["REQ-ADMIN-001", "UI-ADMIN-DASHBOARD", "GET /admin/v1/dashboard", "DATA: audit required", "TEST-ADMIN-01"],
    "admin-insights": ["REQ-INSIGHT-003", "UI-ADMIN-INSIGHT-AGENT", "GET /open/v1/admin/insight-agent", "DATA: AgentRun + PublishQueue", "E2E-INSIGHT-03"],
    "admin-models": ["REQ-ADMIN-AI-001", "UI-ADMIN-MODEL-CONFIG", "LOCAL MOCK CONFIG", "DATA: ModelRoute + FreeQuota", "TEST-ADMIN-AI-01"],
    "admin-sources": ["REQ-INSIGHT-004", "UI-ADMIN-SOURCE-CONFIG", "LOCAL MOCK CONFIG", "DATA: DiscoverySource + Route", "TEST-ADMIN-SOURCE-01"],
    "admin-coverage": ["REQ-ADMIN-COUNTRY-001", "UI-ADMIN-COVERAGE", "LOCAL MOCK CONFIG", "DATA: MarketCoverage + ProviderRoute", "TEST-ADMIN-COVERAGE-01"],
    "admin-products": ["REQ-ADMIN-SKU-001", "UI-ADMIN-PRODUCTS", "LOCAL MOCK CONFIG", "DATA: Module + Field + SKU", "TEST-ADMIN-SKU-01"],
    "admin-pricing": ["REQ-ADMIN-PRICE-001", "UI-ADMIN-PRICING", "LOCAL MOCK CONFIG", "DATA: PriceVersion + Promotion", "TEST-ADMIN-PRICE-01"],
    "admin-providers": ["REQ-ADMIN-PROVIDER-001", "UI-ADMIN-PROVIDERS", "LOCAL MOCK CONFIG", "DATA: ProviderRoute + Health", "TEST-ADMIN-PROVIDER-01"],
    "admin-orders": ["REQ-ADMIN-ORDER-001", "UI-ADMIN-ORDERS", "LOCAL MOCK CONFIG", "DATA: Order + Payment + Refund", "TEST-ADMIN-ORDER-01"],
    "admin-tasks": ["REQ-ADMIN-TASK-001", "UI-ADMIN-TASKS", "LOCAL MOCK CONFIG", "DATA: ReportTask + ModuleTask", "TEST-ADMIN-TASK-01"],
    "admin-api-customers": ["REQ-ADMIN-API-001", "UI-ADMIN-API-CUSTOMERS", "LOCAL MOCK CONFIG", "DATA: DeveloperApp + ApiBalance", "TEST-ADMIN-API-01"],
    "admin-users": ["REQ-ADMIN-USER-001", "UI-ADMIN-USERS", "LOCAL MOCK CONFIG", "DATA: Customer + Permission + Balance", "TEST-ADMIN-USER-01"],
    "admin-files": ["REQ-ADMIN-FILE-001", "UI-ADMIN-FILES", "LOCAL MOCK CONFIG", "DATA: UserFile + ParseTask + Retention", "TEST-ADMIN-FILE-01"],
    "admin-analytics": ["REQ-ADMIN-ANALYTICS-001", "UI-ADMIN-ANALYTICS", "LOCAL MOCK METRICS", "DATA: Funnel + Revenue + Cost", "TEST-ADMIN-ANALYTICS-01"],
    "admin-audit": ["REQ-ADMIN-AUDIT-001", "UI-ADMIN-AUDIT", "LOCAL MOCK CONFIG", "DATA: AuditEvent", "TEST-ADMIN-AUDIT-01"],
  };
  const fallback = ["REQ-MINI-001", `UI-MINI-${current.toUpperCase()}`, "共享用户端契约", "DATA: channel=miniprogram", "E2E-MINI-01"];
  const items = map[current] || fallback;
  return `<aside class="annotation-panel ${state.annotationOpen ? "open" : ""}" aria-label="设计研发标注">
    <div class="annotation-head"><div><span>DESIGN HANDOFF</span><strong>当前页面标注</strong></div><button data-action="toggle-annotation" aria-label="关闭标注">${icon("close", 18)}</button></div>
    <div class="annotation-list">
      ${items.map((item, index) => `<div><span>${["需求", "页面", "接口", "数据", "验收"][index]}</span><code>${item}</code></div>`).join("")}
    </div>
    <div class="annotation-warning">现有字段表没有稳定 fieldCode；本原型只引用 sourceField，不把临时语义名当正式数据字典。</div>
  </aside>`;
}

function webHeader(active) {
  const nav = [
    [tr("首页", "Home"), "home"],
    [tr("热门资讯", "Insights"), "insights"],
    [tr("数据 API", "Data API"), "api-market"],
  ];
  return `<header class="site-header">
    <a class="brand" href="#/home" aria-label="${tr("商情局首页", "Shangqingju home")}">${logo()}</a>
    <nav class="main-nav" aria-label="${tr("主导航", "Primary navigation")}">
      ${nav.map(([label, target]) => `<a href="#/${target}" class="${active === target ? "active" : ""}">${label}</a>`).join("")}
    </nav>
    <div class="header-actions">${languageSwitch()}${state.loggedIn ? `<a class="login-entry signed-in" href="#/account">${icon("user",17)} <span>${state.customer?.mobileMasked || "已登录"}</span></a>` : `<a class="login-entry" href="#/login">${icon("user", 17)} <span>${tr("登录", "Sign in")}</span></a>`}</div>
  </header>`;
}

function webShell(content, active, current) {
  return `${prototypeBar()}<div class="web-app">${webHeader(active)}<main id="main-content">${content}</main>${footer()}</div>${annotationPanel(current)}`;
}

function footer() {
  const qrPattern = "111111101001011011101101110110101011101101110100101111111010010011101101010111010101001011101110111011101000101111111";
  const qrCells = [...qrPattern].map((cell)=>`<i class="${cell === "1" ? "on" : ""}"></i>`).join("");
  return `<footer class="site-footer sqj-simple-footer"><div class="footer-primary"><div class="footer-brand">${logo()}<p>${tr("查企业、读资讯、买报告，用可追溯的信息支持商业判断。", "Company research, market intelligence and traceable reports for better decisions.")}</p></div><nav aria-label="${tr("页脚产品导航", "Footer product navigation")}"><strong>${tr("产品", "PRODUCT")}</strong><a href="#/home">${tr("企业查询", "Company Search")}</a><a href="#/insights">${tr("热门资讯", "Insights")}</a><a href="#/api-market">${tr("数据 API", "Data API")}</a></nav><nav aria-label="${tr("页脚服务导航", "Footer service navigation")}"><strong>${tr("服务", "SERVICE")}</strong><a href="#/account">${tr("个人中心", "Account")}</a><a href="#/api-docs">${tr("开发文档", "Developer Docs")}</a><a href="#/login">${tr("登录 / 注册", "Sign in")}</a></nav><a class="footer-mini-entry" href="#/mini-home"><span class="footer-qr" aria-label="${tr("商情局小程序演示二维码", "Shangqingju Mini Program demo QR")}">${qrCells}<b>SQJ</b></span><div><small>WECHAT MINI PROGRAM</small><strong>${tr("微信扫码进入小程序", "Scan to open Mini Program")}</strong><p>${tr("查询企业、查看报告与 AI 对话", "Search companies, read reports and chat with AI")}</p></div></a></div><div class="footer-legal"><span>© 2026 ${tr("商情局", "Shangqingju")} · 合肥易尊数字科技有限公司</span><span>${tr("用户协议", "Terms")} · ${tr("隐私政策", "Privacy")}</span></div></footer>`;
}

function databasePicker(compact = false) {
  const domestic = state.searchScope === "CN";
  const options = [
    { scope:"GLOBAL", active:!domestic, icon:icon("globe", compact ? 15 : 19), title:tr("全球企业库", "Global Database"), note:tr("海外及港澳台企业", "International & HK/Macao/Taiwan") },
    { scope:"CN", active:domestic, icon:`<strong>${state.locale === "en" ? "CN" : "中"}</strong>`, title:tr("国内企业库", "Mainland China Database"), note:tr("中国大陆工商主体", "Mainland China registered entities") }
  ];
  return `<div class="database-picker ${compact ? "compact" : ""}" role="radiogroup" aria-label="${tr("选择查询数据库", "Select company database")}">${options.map((item) => `<button type="button" role="radio" aria-label="${item.title}" title="${item.title}" aria-checked="${item.active}" class="${item.active ? "active" : ""}" data-action="search-scope" data-scope="${item.scope}"><span class="database-icon">${item.icon}</span><span class="database-copy"><strong>${item.title}</strong><small>${item.note}</small></span><i>${item.active ? tr("当前", "ACTIVE") : ""}</i></button>`).join("")}</div>`;
}

function secondaryInsights(data = state.insights || fallbackInsights) {
  return data.secondaryMarket || data.annualReports || [];
}

function allInsights(data = state.insights || fallbackInsights) {
  return [...(data.primaryMarket || []), ...secondaryInsights(data)];
}

const insightCategories = [
  { code:"COMMODITIES", zh:"大宗数据", en:"Commodities", icon:"database" },
  { code:"INVEST_DAILY", zh:"投资日报", en:"Investment Daily", icon:"spark" },
  { code:"FINANCIAL_MARKET", zh:"金融市场", en:"Financial Markets", icon:"globe" },
  { code:"LISTED_COMPANY", zh:"上市企业", en:"Listed Companies", icon:"report" },
  { code:"OTHER", zh:"其他", en:"Other", icon:"menu" }
];

function categoryMeta(code) {
  return insightCategories.find((item)=>item.code === code) || insightCategories[4];
}

function marketLabel(item) {
  if (item.channel === "PRIMARY") return tr("一级市场", "Private market");
  if (item.channel === "SECONDARY") return tr("二级市场", "Public market");
  return tr("市场数据", "Market data");
}

function insightArticleLink(item) {
  return `#/insight?id=${encodeURIComponent(item.id)}`;
}

function insightCard(item, type, featured = false) {
  const primary = type === "primary";
  const marketData = item.channel === "MARKET_DATA";
  const category = categoryMeta(item.category);
  return `<article class="editorial-card ${primary ? "primary-story" : marketData ? "market-story" : "secondary-story"} ${featured ? "featured" : ""}">
    <a href="${insightArticleLink(item)}" aria-label="${tr("阅读商情局深度文章", "Read Shangqingju analysis")}: ${localized(item,"title")}">
      <div class="story-visual"><span>${state.locale === "en" ? category.en.toUpperCase() : category.zh}</span><i>${icon(category.icon,34)}</i><em>${tr("免费阅读", "FREE TO READ")}</em></div>
      <div class="story-copy">
        <div class="story-meta"><span>${marketLabel(item)}</span><time>${String(item.publishedAt || "").slice(0,10)}</time><small>${item.readMinutes || 6} ${tr("分钟阅读", "min read")}</small></div>
        <small class="insight-company">${item.company}${item.ticker ? ` · ${item.ticker}` : ""}</small>
        <h3>${localized(item,"title")}</h3>
        <p>${localized(item,"summary")}</p>
        ${item.discoveredBy?.length ? `<small class="signal-source">${tr("线索来源", "Discovered via")} · ${item.discoveredBy.join(" · ")}</small>` : ""}
        <div class="story-byline"><span>${icon("spark",14)} ${localized(item,"author") || tr("商情局研究 Agent · 人工复核", "Shangqingju Research · Human reviewed")}</span><b>${tr("阅读全文", "Read analysis")} ${icon("arrow",14)}</b></div>
      </div>
    </a>
  </article>`;
}

function renderInsightLane(title, label, items, iconName = "spark") {
  return `<section class="editorial-lane"><header><div><span class="lane-icon">${icon(iconName,21)}</span><div><small>${label}</small><h2>${title}</h2></div></div><span>${items.length} ${tr("篇今日精选", "stories selected today")}</span></header><div class="editorial-grid">${items.map((item, index) => insightCard(item, item.channel === "PRIMARY" ? "primary" : "secondary", index === 0)).join("")}</div></section>`;
}

function renderInsights() {
  const data = state.insights || fallbackInsights;
  const stories = allInsights(data);
  const edition = data.edition || { labelZh:"今日精选", label:"Today's Edition", selectedCount:stories.length, scannedCount:46, scheduledAt:data.capturedAt, status:"PUBLISHED" };
  const filter = state.insightChannel;
  const selectedCategory = filter === "ALL" ? null : categoryMeta(filter);
  const filteredStories = filter === "ALL" ? stories : stories.filter((item)=>item.category === filter);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredStories.length / pageSize));
  const currentPage = Math.min(totalPages, Math.max(1, state.insightPage || 1));
  const visibleStories = filteredStories.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const discoverySources = data.discoverySources || [];
  const featured = visibleStories[0];
  const listStories = visibleStories.slice(1);
  const categoryButtons = [["ALL",tr("全部资讯", "All intelligence"),"menu"],...insightCategories.map((item)=>[item.code,state.locale === "en" ? item.en : item.zh,item.icon])];
  const countFor = (value) => value === "ALL" ? stories.length : stories.filter((item)=>item.category===value).length;
  const sourceText = (item) => item.discoveredBy?.length ? item.discoveredBy.join(" · ") : tr("公开市场与官方披露", "Public markets and official filings");
  return webShell(`<section class="newsroom-page">
    <header class="newsroom-top"><div><span>SHANGQINGJU INTELLIGENCE</span><h1>${tr("商业热闻与深度判断", "Business news and informed judgment")}</h1><p>${tr("每天筛选值得关注的市场信号，核验公开来源，并写成免费的深度商业文章。", "We select consequential market signals, verify public sources and publish free in-depth business analysis every day.")}</p></div><aside><i></i><span>${tr("今日内容已更新", "Today's edition is live")}</span><strong>${edition.selectedCount || stories.length}</strong><small>${tr("篇精选文章", "selected stories")}</small></aside></header>
    <div class="newsroom-layout">
      <aside class="newsroom-sidebar"><div class="newsroom-side-title"><span>${icon("spark",18)}</span><div><strong>${tr("资讯频道", "Channels")}</strong><small>MARKET CHANNELS</small></div></div><nav role="tablist" aria-label="${tr("资讯子模块", "Insight sections")}">${categoryButtons.map(([value,label,iconName])=>`<button role="tab" aria-selected="${filter===value}" class="${filter===value?"active":""}" data-action="insight-filter" data-filter="${value}"><span>${icon(iconName,17)}${label}</span><b>${countFor(value)}</b></button>`).join("")}</nav><div class="newsroom-brief"><span>${icon("check",16)} ${tr("全部免费", "Free access")}</span><strong>${tr("信息不是终点，形成判断才是。", "Information is only useful when it supports judgment.")}</strong><p>${tr("来源链接用于事实核验，文章观点由商情局独立撰写。", "Source links support verification; analysis is independently written by Shangqingju.")}</p></div></aside>
      <main class="newsroom-feed"><header><div><span>${selectedCategory ? selectedCategory.en.toUpperCase() : "TODAY'S CURATION"}</span><h2>${selectedCategory ? (state.locale === "en" ? selectedCategory.en : selectedCategory.zh) : tr("今日精选", "Today's selection")}</h2></div><p>${tr(`第 ${currentPage} 页 · 共 ${filteredStories.length} 篇`, `Page ${currentPage} · ${filteredStories.length} stories`)}</p></header>
        ${featured ? `<article class="newsroom-feature"><a href="${insightArticleLink(featured)}"><div class="newsroom-feature-art"><span>${state.locale === "en" ? categoryMeta(featured.category).en : categoryMeta(featured.category).zh}</span>${icon(categoryMeta(featured.category).icon,54)}<small>${marketLabel(featured)}</small></div><div class="newsroom-feature-copy"><div><span>${marketLabel(featured)}</span><time>${String(featured.publishedAt || "").slice(0,10)}</time><small>${featured.readMinutes || 6} ${tr("分钟阅读", "min read")}</small></div><h2>${localized(featured,"title")}</h2><p>${localized(featured,"summary")}</p><footer><span>${icon("spark",14)} ${localized(featured,"author") || tr("商情局研究 Agent · 人工复核", "Shangqingju Research · Human reviewed")}</span><b>${tr("阅读全文", "Read analysis")} ${icon("arrow",15)}</b></footer></div></a></article>` : ""}
        <section class="newsroom-list">${listStories.map((item)=>`<article><a href="${insightArticleLink(item)}"><div class="newsroom-list-icon">${icon(categoryMeta(item.category).icon,22)}</div><div class="newsroom-list-copy"><div><span>${state.locale === "en" ? categoryMeta(item.category).en : categoryMeta(item.category).zh}</span><time>${String(item.publishedAt || "").slice(0,10)}</time><small>${marketLabel(item)}</small></div><h3>${localized(item,"title")}</h3><p>${localized(item,"summary")}</p><footer><span>${tr("线索来源", "Sources")} · ${sourceText(item)}</span><b>${item.readMinutes || 6} ${tr("分钟", "min")} ${icon("arrow",13)}</b></footer></div></a></article>`).join("") || `<div class="newsroom-empty">${tr("当前频道暂无内容", "No stories in this channel")}</div>`}</section>
        <nav class="insight-pagination" aria-label="${tr("资讯翻页", "Insight pagination")}"><button data-action="insight-page" data-page="${currentPage-1}" ${currentPage<=1?"disabled":""}>${icon("arrow",14)} ${tr("上一页", "Previous")}</button><span>${tr(`第 ${currentPage} / ${totalPages} 页`, `Page ${currentPage} of ${totalPages}`)}</span><button data-action="insight-page" data-page="${currentPage+1}" ${currentPage>=totalPages?"disabled":""}>${tr("下一页", "Next")} ${icon("arrow",14)}</button></nav>
      </main>
    </div>
    ${discoverySources.length ? `<section class="newsroom-sources"><strong>${tr("公开线索来源", "Public discovery sources")}</strong><div>${discoverySources.map((source)=>`<a href="${source.url}" target="_blank" rel="noopener noreferrer">${state.locale === "en" ? source.name : source.nameZh}<span>↗</span></a>`).join("")}</div><p>${tr("媒体和社区仅用于发现线索，关键事实继续核验原始披露。", "Media and communities are discovery sources; key facts are verified against primary disclosures.")}</p></section>` : ""}
  </section>`, "insights", "insights");
}

function renderInsightArticle() {
  const id = route().params.get("id");
  const item = allInsights().find((story) => story.id === id) || allInsights()[0];
  if (!item) return webShell(`<section class="simple-page-head"><h1>${tr("文章暂不可用", "Article unavailable")}</h1><a href="#/insights">${tr("返回热闻资讯", "Back to insights")}</a></section>`, "insights", "insight");
  const isPrimary = item.channel === "PRIMARY" || String(item.id).startsWith("PM-");
  const articleMarketLabel = item.channel === "MARKET_DATA" ? tr("大宗与市场数据", "COMMODITY & MARKET DATA") : isPrimary ? tr("一级市场", "PRIVATE MARKET") : tr("二级市场", "PUBLIC MARKET");
  const article = state.locale === "en" ? (item.article || []) : (item.articleZh || item.article || []);
  const points = state.locale === "en" ? (item.keyPoints || []) : (item.keyPointsZh || item.keyPoints || []);
  const recommendations = allInsights().filter((story) => story.id !== item.id).slice(0,2);
  return webShell(`<article class="article-page">
    <header class="article-hero">
      <a class="article-back" href="#/insights">${icon("arrow",15)} ${tr("返回热闻资讯", "Back to insights")}</a>
      <div class="article-channel"><span>${articleMarketLabel}</span><small>${state.locale === "en" ? categoryMeta(item.category).en : categoryMeta(item.category).zh} · ${item.tag || item.ticker || "MARKET INTELLIGENCE"}</small></div>
      <h1>${localized(item,"title")}</h1><p>${localized(item,"summary")}</p>
      <div class="article-byline"><span class="agent-avatar">AI</span><div><strong>${localized(item,"author") || tr("商情局研究 Agent · 人工复核", "Shangqingju Research · Human reviewed")}</strong><small>${String(item.publishedAt || "").replace("T"," ").slice(0,16)} · ${item.readMinutes || 6} ${tr("分钟阅读", "min read")}</small></div><b>${tr("商情局原创", "ORIGINAL ANALYSIS")}</b></div>
    </header>
    <div class="article-layout">
      <main class="article-body">
        <section class="article-thesis"><span>${tr("核心判断", "CORE VIEW")}</span><p>${localized(item,"thesis") || localized(item,"summary")}</p></section>
        ${article.length ? article.map((section) => `<section><h2>${section.heading}</h2><p>${section.body}</p></section>`).join("") : `<section><h2>${tr("商情局解读", "Shangqingju analysis")}</h2><p>${localized(item,"summary")}</p></section>`}
        <section class="article-boundary"><strong>${tr("分析边界", "Analysis boundary")}</strong><p>${tr("本文由市场情报 Agent 基于公开材料形成初稿，并经工作人员复核后发布。文中判断属于商情局分析，不代表来源机构立场，也不构成投资建议。", "This article was drafted from public materials by the Market Intelligence Agent and published after human review. Views are Shangqingju's own and are not investment advice.")}</p></section>
      </main>
      <aside class="article-aside">
        <section><span class="kicker">KEY FACTS</span><h3>${tr("本篇事实锚点", "Key facts")}</h3><ul>${points.map((point)=>`<li>${icon("check",15)}<span>${point}</span></li>`).join("")}</ul></section>
        <section class="source-reference"><span class="kicker">SOURCE REFERENCE</span><h3>${tr("原始参考来源", "Original reference")}</h3>${item.discoveredBy?.length ? `<small class="article-discovery">${tr("线索发现", "Discovered via")} · ${item.discoveredBy.join(" / ")}</small>` : ""}<p>${state.locale === "en" ? item.source : item.sourceZh}</p><small>${tr("来源发布日期", "Source date")} · ${item.sourcePublishedAt || String(item.publishedAt).slice(0,10)}</small><a href="${item.sourceUrl}" target="_blank" rel="noopener noreferrer">${tr("查看原始披露", "Open source filing")} ${icon("external",14)}</a></section>
      </aside>
    </div>
    <section class="article-more"><div><span class="kicker">KEEP READING</span><h2>${tr("继续阅读", "Continue reading")}</h2></div><div>${recommendations.map((story)=>insightCard(story, story.channel === "PRIMARY" ? "primary" : "secondary")).join("")}</div></section>
  </article>`, "insights", "insight");
}

function renderHomeEntityNetwork() {
  const entities = [
    ["Northstar Components Inc.","美国 · 在营","全球库","92%"],
    ["上海青岚科技有限公司","中国大陆 · 存续","国内库","98%"],
    ["Atlas Medical Trading GmbH","德国 · 在营","全球库","89%"],
    ["Harborline Supply Pte. Ltd.","新加坡 · 在营","全球库","94%"],
  ];
  return `<section class="home-section entity-intelligence"><header><div><span class="kicker">ENTITY INTELLIGENCE NETWORK</span><h2>${tr("双数据库背后，是同一套企业情报闭环", "Two databases, one intelligence workflow")}</h2></div><p>${tr("全球库与国内库独立查询，再由商情局统一主体模型串联报告、订单、API 与 AI 问答。", "Global and domestic searches remain separate, while one entity model connects reports, orders, APIs and AI.")}</p></header><div class="entity-network-board"><aside><span>DATA FOUNDATION</span><strong>${tr("两个数据库", "TWO DATABASES")}</strong><p>${tr("查询入口明确切换，不混库、不误判。", "Explicit routing prevents mixed-source results.")}</p><dl><div><dt>${tr("全球库", "GLOBAL")}</dt><dd>海外及港澳台</dd></div><div><dt>${tr("国内库", "DOMESTIC")}</dt><dd>中国大陆工商主体</dd></div><div><dt>${tr("统一主体", "ENTITY ID")}</dt><dd>报告与 API 共用</dd></div></dl></aside><div class="entity-stream"><header><div><strong>${tr("近期识别主体", "RECENTLY RESOLVED")}</strong><span><i></i> Mock API Online</span></div><small>${tr("名称、国家、注册号、地址交叉匹配", "Name, jurisdiction, registry ID and address cross-check")}</small></header>${entities.map(([name,meta,source,score],index)=>`<button data-action="quick-search" data-query="${name}"><span class="entity-index">${String(index+1).padStart(2,"0")}</span><div><strong>${name}</strong><small>${meta}</small></div><em>${source}</em><b>${score}</b>${icon("arrow",16)}</button>`).join("")}</div><div class="entity-orbit"><span class="orbit-label">SHANGQINGJU</span><div class="orbit-core"><i>${icon("database",27)}</i><strong>${tr("企业主体", "ENTITY")}</strong><small>ONE ID</small></div><i class="orbit-ring ring-one"></i><i class="orbit-ring ring-two"></i><span class="orbit-node node-one">${icon("search",16)}<b>${tr("识别", "RESOLVE")}</b></span><span class="orbit-node node-two">${icon("report",16)}<b>${tr("报告", "REPORT")}</b></span><span class="orbit-node node-three">${icon("api",16)}<b>API</b></span><span class="orbit-node node-four">${icon("spark",16)}<b>AI</b></span><p>${tr("同一主体贯穿查询、购买、交付与调用", "One entity across discovery, purchase and delivery")}</p></div></div></section>`;
}

function renderHome() {
  const markets = state.locale === "en" ? ["🇨🇳 Mainland China", "🇭🇰 Hong Kong", "🇺🇸 United States", "🇸🇬 Singapore", "🇬🇧 United Kingdom", "🇩🇪 Germany", "🇫🇷 France", "🇳🇱 Netherlands", "🇯🇵 Japan", "🇰🇷 South Korea"] : ["🇨🇳 中国大陆", "🇭🇰 中国香港", "🇺🇸 美国", "🇸🇬 新加坡", "🇬🇧 英国", "🇩🇪 德国", "🇫🇷 法国", "🇳🇱 荷兰", "🇯🇵 日本", "🇰🇷 韩国"];
  const coverageCountries = [["🇨🇳","中国","China","1.19亿+","GLOBAL + CN"],["🇺🇸","美国","United States","1.00亿+","GLOBAL"],["🇧🇷","巴西","Brazil","5,577万+","GLOBAL"],["🇮🇳","印度","India","4,488万+","GLOBAL"],["🇦🇺","澳大利亚","Australia","3,705万+","GLOBAL"],["🇫🇷","法国","France","2,755万+","GLOBAL"],["🇬🇧","英国","United Kingdom","2,408万+","GLOBAL"],["🇰🇷","韩国","South Korea","904万+","GLOBAL"]];
  const domestic = state.searchScope === "CN";
  return webShell(`
    <section class="hero">
      <div class="hero-grid"></div>
      <div class="hero-main">
        <div class="hero-content">
          <div class="eyebrow"><span></span> ${tr("全球企业情报 · MOCK 可调用", "GLOBAL BUSINESS INTELLIGENCE · LIVE MOCK")}</div>
          <h1>${tr("查清企业，", "Know the company.")}<br><em>${tr("放心做决定。", "Decide with confidence.")}</em></h1>
          <p>${tr("合作、求职、采购、投资之前，先用商情局看清公司身份、股东、风险和资信。", "Before you partner, join, procure or invest, verify identity, ownership, risk and credit with Shangqingju.")}</p>
          ${databasePicker()}
          <form class="global-search" data-form="search">
            <label class="sr-only" for="global-search">${tr("企业名称或注册号", "Company name or registration number")}</label>
            <input id="global-search" name="q" value="${domestic ? "上海青岚科技" : "Northstar Components"}" placeholder="${domestic ? tr("输入企业名称、统一社会信用代码", "Chinese company name or unified social credit code") : tr("输入公司名、英文名或注册号", "Company name, local name or registration number")}" autocomplete="off" />
            <button type="submit">${icon("search", 19)} ${tr("查一下", "Search")}</button>
          </form>
          <div class="search-meta"><span>🔥 ${domestic ? tr("国内热门", "CHINA TRENDING") : tr("大家都在查", "TRENDING SEARCHES")}</span>${domestic ? `<button data-action="quick-search" data-query="上海青岚科技">上海青岚科技</button><button data-action="quick-search" data-query="91310115MA1K4DEMO8">${tr("统一社会信用代码", "Unified social credit code")}</button>` : `<button data-action="quick-search" data-query="Northstar Components">Northstar Components</button><button data-action="quick-search" data-query="C0478921">${tr("注册号", "Registration")} C0478921</button><button data-action="quick-search" data-query="Atlas Medical">Atlas Medical</button>`}</div>
        </div>
        <aside class="hero-spotlight" aria-label="${tr("调查报告演示摘要", "Report summary preview")}">
          <div class="spotlight-head"><span><i></i> ${tr("实时演示", "LIVE PREVIEW")}</span><small>${tr("Mock API 已连接", "Mock API connected")}</small></div>
          <div class="spotlight-company"><div class="spotlight-logo">N</div><div><strong>Northstar Components Inc.</strong><span>🇺🇸 美国 · C0478921</span></div><b>在营</b></div>
          <div class="spotlight-score"><div><strong>92%</strong><span>${tr("主体匹配", "entity match")}</span></div><div class="score-ring"><i></i><span>${icon("check",22)}</span></div></div>
          <div class="spotlight-metrics"><div><strong>3</strong><span>${tr("已选模块", "modules")}</span></div><div><strong>0</strong><span>${tr("制裁命中", "sanctions")}</span></div><div><strong>2</strong><span>${tr("待补充核对", "to verify")}</span></div></div>
          <div class="spotlight-foot">${icon("spark",17)} <span>${tr("AI 只根据已购报告回答，每条结论都带引用。", "AI answers only from purchased report evidence, with citations.")}</span></div>
        </aside>
      </div>
      <div class="hero-evidence" aria-label="${tr("产品核心能力", "Core capabilities")}">
        <div><span>${icon("search",19)}</span><strong>${tr("先确认是哪家", "Resolve the right entity")}</strong><small>${tr("名称、国家、注册号和地址交叉匹配", "Cross-check name, jurisdiction, registry ID and address")}</small></div>
        <div><span>${icon("database",19)}</span><strong>${tr("再按需查信息", "Buy evidence as needed")}</strong><small>${tr("10 类业务模块，不强制一次购买全部", "10 modules; no forced all-in purchase")}</small></div>
        <div><span>${icon("spark",19)}</span><strong>${tr("最后让 AI 说人话", "Let AI explain it clearly")}</strong><small>${tr("结论带来源、日期、版本和报告引用", "Every conclusion keeps source, date, version and citation")}</small></div>
      </div>
    </section>
    <section class="home-section scene-section"><div class="section-heading"><div><span class="kicker">${tr("你想查什么", "START WITH A QUESTION")}</span><h2>${tr("从一个真实问题开始", "Choose what you need to know")}</h2></div><p>${tr("不用先懂复杂尽调。选择你的场景，商情局帮你组合合适的信息。", "No due-diligence expertise required. Pick a scenario and we will assemble the right evidence.")}</p></div><div class="scene-grid">
      <button class="scene-card scene-partner" data-action="quick-search" data-query="Northstar Components"><span>${icon("shield",24)}</span><small>${tr("跨境合作", "PARTNERSHIP")}</small><strong>${tr("这家公司靠谱吗？", "Can I trust this company?")}</strong><em>${tr("查身份、股东和风险 →", "Identity, ownership and risk →")}</em></button>
      <button class="scene-card scene-control" data-action="quick-search" data-query="Northstar Components"><span>${icon("globe",24)}</span><small>${tr("股权关系", "OWNERSHIP")}</small><strong>${tr("真正控制人是谁？", "Who really controls it?")}</strong><em>${tr("看股东、控制链和 UBO →", "Shareholders, control paths and UBO →")}</em></button>
      <button class="scene-card scene-risk" data-action="quick-search" data-query="Atlas Medical"><span>${icon("alert",24)}</span><small>${tr("交易风控", "RISK")}</small><strong>${tr("有没有制裁和诉讼？", "Any sanctions or litigation?")}</strong><em>${tr("查司法、处罚与合规 →", "Legal, penalties and compliance →")}</em></button>
      <button class="scene-card scene-report" data-action="go" data-target="account"><span>${icon("report",24)}</span><small>${tr("已有调查", "REPORTS")}</small><strong>${tr("直接看报告和问 AI", "Read reports and ask AI")}</strong><em>${tr("进入个人中心 →", "Open account →")}</em></button>
    </div></section>
    <section class="home-section enterprise-coverage"><header class="coverage-title"><span class="kicker">${tr("企业主体覆盖", "ENTERPRISE COVERAGE")}</span><h2>${tr("全球企业主体，一眼看清覆盖范围", "See global company coverage at a glance")}</h2><p>${tr("参考成熟数据平台的呈现方式，把国家、主体规模、数据源和更新状态放在同一层级。以下数量为原型演示口径。", "A professional view of jurisdictions, entity scale, source and freshness. Counts are prototype samples.")}</p></header><div class="coverage-health"><div>${icon("clock",18)}<span>${tr("最近同步", "LAST SYNC")}</span><strong>2026-08-16</strong></div><div>${icon("globe",18)}<span>${tr("重点市场", "PRIORITY MARKETS")}</span><strong>10 ${tr("个国家/地区", "markets")}</strong></div><div>${icon("database",18)}<span>${tr("字段口径", "FIELD COVERAGE")}</span><strong>${tr("最多 500+ 字段", "Up to 500+ fields")}</strong></div><div>${icon("alert",18)}<span>${tr("数据提示", "DATA NOTICE")}</span><strong>${tr("不同国家覆盖不同", "Coverage varies by market")}</strong></div></div><div class="enterprise-country-grid">${coverageCountries.map(([flag,country,en,count,source],index)=>`<article><div><span class="country-flag">${flag}</span><b class="coverage-rank">0${index+1}</b></div><h3>${state.locale==="en"?en:country}</h3><p>${state.locale==="en"?country:en}</p><small>${tr("企业主体数", "COMPANY ENTITIES")}</small><strong>${count}</strong><em>${source}</em></article>`).join("")}</div><div class="coverage-map-panel"><div class="coverage-map-copy"><span>GLOBAL ENTITY NETWORK</span><h3>${tr("统一主体 ID，连接全球与国内两套数据库", "One entity ID across global and domestic sources")}</h3><p>${tr("查询时先选择全球或国内数据库；结果通过统一主体模型返回，后续报告、订单和 API 使用同一企业 ID。", "Choose the global or domestic source first; reports, orders and APIs then share one normalized entity ID.")}</p><div>${markets.slice(0,6).map((market,index)=>`<span class="${index>3?"pending":""}">${market}</span>`).join("")}</div></div><div class="coverage-map-visual" aria-label="${tr("全球企业覆盖示意", "Global entity coverage illustration")}"><i class="map-line one"></i><i class="map-line two"></i><i class="map-line three"></i>${[["北美洲","2.1亿+","18%","30%"],["欧洲","1.6亿+","48%","24%"],["亚洲","2.9亿+","72%","44%"],["南美洲","3,600万+","32%","67%"],["大洋洲","1,300万+","82%","73%"]].map(([region,count,left,top])=>`<span style="left:${left};top:${top}"><b>${region}</b><small>${count}</small></span>`).join("")}</div></div></section>
    <section class="home-section process-section"><div class="section-heading"><div><span class="kicker">${tr("一条闭环", "ONE COMPLETE FLOW")}</span><h2>${tr("从一个名字，到一份可复核结论", "From a name to an auditable conclusion")}</h2></div><p>${tr("每一步都显示数据状态、恢复入口与证据时间，不把“没查到”和“没风险”混为一谈。", "Every step shows data status, recovery paths and evidence time—never confusing no record with no risk.")}</p></div><div class="process-grid">
      ${[["01", tr("搜索与主体确认", "Search and resolve"), tr("同名主体按国家、注册号和地址区分。", "Separate namesakes by jurisdiction, registry ID and address."), "search"], ["02", tr("选择需要的模块", "Choose modules"), tr("先检查覆盖和字段范围，再展示演示价。", "Check coverage and fields before pricing."), "database"], ["03", tr("自动生成调查报告", "Generate the report"), tr("模块并行执行，允许部分完成和单项重试。", "Parallel modules support partial delivery and retry."), "report"], ["04", tr("向报告提问", "Ask the report"), tr("答案引用章节、页码与原文，不联网补充。", "Answers cite report sections and source text."), "spark"]].map(([n,t,d,i]) => `<article class="process-card"><span>${n}</span><div class="process-icon">${icon(i,24)}</div><h3>${t}</h3><p>${d}</p></article>`).join("")}
    </div></section>
    <section class="home-section module-preview"><div class="section-heading"><div><span class="kicker">${tr("按需选择", "MODULAR RESEARCH")}</span><h2>${tr("你想知道什么，就查什么", "Buy only the evidence you need")}</h2></div><button class="text-button" data-action="quick-search" data-query="Northstar Components">${tr("查看全部模块", "View all modules")} ${icon("arrow",16)}</button></div><div class="module-preview-grid">${modules.slice(0,6).map(moduleMiniCard).join("")}</div></section>
    <section class="home-section api-callout"><div><span class="kicker light">FOR DEVELOPERS</span><h2>${tr("把企业调查能力接入你的系统", "Bring company intelligence into your workflow")}</h2><p>${tr("商情局与全球查共用 33 个企业数据接口，名称、参数、路径和返回契约保持一致。", "Shangqingju uses the same 33 company APIs and contracts as Globalcheck.")}</p></div><div class="code-card"><div><span></span><span></span><span></span><code>POST /api/v1/companies/profile</code></div><pre>{
  "code": 200,
  "errorCode": 0,
  "msg": "success",
  "isCost": "1",
  "requestId": "GC-DEMO-0001"
}</pre></div><a class="button light-button" href="#/api-market">${tr("进入 API 开放平台", "Open the API platform")} ${icon("arrow",17)}</a></section>
  `, "home", "home");
}

function renderHomeV2() {
  const domestic = state.searchScope === "CN";
  const hotCompanies = [
    ["上海青岚科技有限公司","人工智能 · 上海","98","国内库"],
    ["Northstar Components Inc.","电子元件 · 美国","92","全球库"],
    ["Atlas Medical Trading GmbH","医疗贸易 · 德国","89","全球库"],
    ["Harborline Supply Pte. Ltd.","供应链 · 新加坡","94","全球库"],
    ["优必选科技","机器人 · 中国香港","91","全球库"],
  ];
  const industries = [
    [tr("人工智能", "Artificial Intelligence"),"上海青岚科技",tr("国内代表企业", "Mainland China example"),"AI"],
    [tr("先进制造", "Advanced Manufacturing"),"Northstar Components",tr("美国代表企业", "United States example"),"MFG"],
    [tr("跨境贸易", "Cross-border Trade"),"Harborline Supply",tr("新加坡代表企业", "Singapore example"),"TRADE"],
    [tr("医疗健康", "Healthcare"),"Atlas Medical",tr("德国代表企业", "Germany example"),"HEALTH"]
  ];
  return webShell(`<div class="sqj-home-v2">
    <section class="search-first-hero">
      <div class="search-hero-glow one"></div><div class="search-hero-glow two"></div><div class="flight-data-line"><i></i><span>SOURCES</span><b></b><span>QUERY</span><b></b><span>JUDGMENT</span><i></i></div>
      <div class="search-hero-copy"><span class="search-hero-badge">${icon("spark",15)} ${tr("全球企业情报 · 一查即明", "Global company intelligence · Clear at a glance")}</span><h1>${tr("做生意之前，先把企业查明白", "Before you do business, know the company.")}</h1><p>${tr("查身份、穿透股权、识别风险、读懂经营。全球企业情报一次汇集，让合作、投资与采购更有底气。", "Verify identity, trace ownership, identify risk and understand operations—all in one place for more confident partnerships, investments and procurement.")}</p></div>
      <div class="search-command-card"><div class="search-scope-row"><span><b>选择数据范围</b><small>全球库与国内库独立查询</small></span>${databasePicker()}<button class="advanced-search-link" data-action="quick-search" data-query="高级筛选">高级筛选 ${icon("chevron",14)}</button></div><form class="global-search v2-search" data-form="search"><label class="sr-only" for="home-v2-search">${tr("企业名称或注册号", "Company name or registration number")}</label><span class="search-leading-icon">${icon("search",21)}</span><input id="home-v2-search" name="q" value="" placeholder="${tr(domestic ? "请输入企业名称、统一社会信用代码、品牌、地址或经营范围" : "请输入全球企业名称（中英文均可）、注册号、品牌、地址或经营范围", domestic ? "Search Mainland China companies by name, Unified Social Credit Code, brand, address, or business scope" : "Search global companies by name, local registration number, brand, address, or business scope")}" autocomplete="off"/><button type="submit">查一下 ${icon("arrow",17)}</button></form><div class="home-search-hints"><span>${icon("spark",13)} 热门</span>${(domestic?["上海青岚科技","新能源企业","半导体公司"]:["Northstar Components","OpenAI","Atlas Medical"]).map((name)=>`<button data-action="quick-search" data-query="${name}">${name}</button>`).join("")}<a href="#/insights">今日商业热闻 ${icon("arrow",13)}</a></div></div>
      <div class="search-trust-strip"><div><strong>2.3 亿+</strong><span>全球企业主体</span></div><i></i><div><strong>33 个</strong><span>同源数据 API</span></div><i></i><div><strong>10 类</strong><span>企业调查模块</span></div><i></i><div><strong>可追溯</strong><span>来源与数据日期</span></div></div>
    </section>
    <section class="home-v2-section compact-discovery"><header><div><span>BUSINESS DISCOVERY</span><h2>${tr("从热门企业，进入真实商业场景", "Explore real business contexts through trending companies")}</h2></div><a href="#/insights">${tr("阅读今日商业热闻", "Read today's intelligence")} ${icon("arrow",15)}</a></header><div class="compact-discovery-grid"><article class="trending-company-list"><div class="board-head"><div><strong>${tr("近期热查企业", "Trending companies")}</strong><small>${tr("点击即可查看可用的演示数据", "Open companies with available demo data")}</small></div><span><i></i> ${tr("演示数据", "DEMO DATA")}</span></div>${hotCompanies.slice(0,4).map(([name,meta,score,source],index)=>`<button data-action="quick-search" data-query="${name}"><b>${String(index+1).padStart(2,"0")}</b><span><strong>${name}</strong><small>${meta}</small></span><em>${source}</em>${icon("arrow",15)}</button>`).join("")}</article><article class="industry-shortcuts"><div class="board-head"><div><strong>${tr("热门行业与代表企业", "Industries and example companies")}</strong><small>${tr("不再提交空行业词，点击后直接查询对应企业", "Each shortcut opens an available company example")}</small></div></div><div>${industries.map(([name,company,meta,symbol])=>`<button data-action="quick-search" data-query="${company}"><span class="industry-symbol">${symbol}</span><div><strong>${name}</strong><small>${company} · ${meta}</small></div>${icon("chevron",15)}</button>`).join("")}</div><a class="industry-news-link" href="#/insights"><span>${icon("spark",18)}</span><div><strong>${tr("每天精选值得关注的市场信号", "Daily selection of consequential market signals")}</strong><small>${tr("公开来源核验 · 商情局独立解读 · 免费阅读", "Verified sources · Independent analysis · Free to read")}</small></div>${icon("arrow",16)}</a></article></div></section>
    <section class="home-v2-section decision-scenes"><header><div><span>DECISION SCENARIOS</span><h2>你在做什么决定？</h2></div><p>不需要先理解复杂字段，选择场景后按需购买调查模块。</p></header><div>${[["跨境合作","确认主体、股权和合规风险","合作前先查清对方是谁","shield","Northstar Components"],["采购准入","核查经营、司法与履约能力","减少供应链合作盲区","database","Atlas Medical"],["投资研究","串联融资、年报与控制关系","从公开信息形成投资判断","spark","Northstar Components"],["求职背调","了解企业状态与经营风险","入职前多看一层真实情况","user","上海青岚科技"]].map(([tag,title,note,iconName,query])=>`<button data-action="quick-search" data-query="${query}"><span>${icon(iconName,24)}</span><small>${tag}</small><strong>${title}</strong><p>${note}</p><em>开始查询 ${icon("arrow",14)}</em></button>`).join("")}</div></section>
  </div>`, "home", "home");
}

function renderLogin() {
  const phoneMode = state.loginMode === "sms";
  const pending = state.returnAfterLogin === "checkout" ? (state.pendingPurchase || capturePendingPurchase()) : null;
  const apiReturn = /^api-(console|keys|usage)/.test(String(state.returnAfterLogin || ""));
  const promoCards = apiReturn ? [
    ["database",tr("33 个企业数据接口", "33 company data APIs"),tr("企业、股权、司法、财务与合规能力", "Company, ownership, legal, financial and compliance data")],
    ["api",tr("API / CLI / MCP", "API / CLI / MCP"),tr("同一能力目录，按开发方式灵活接入", "One capability catalog across integration channels")]
  ] : [
    ["search",tr("全球与国内企业检索", "Global and China company search"),tr("名称、注册号、品牌和地址交叉确认主体", "Resolve entities by name, registration number, brand and address")],
    ["report",tr("按需购买调查报告", "On-demand research reports"),tr("股权、财务、司法等模块自由组合", "Combine ownership, financial, legal and other modules")],
    ["spark",tr("免费商业热闻", "Free market intelligence"),tr("公开来源核验，商情局独立解读", "Verified public sources with independent analysis")],
    ["wallet",tr("订单、余额与发票", "Orders, balance and invoices"),tr("支付、报告、充值和开票申请集中管理", "Manage payments, reports, top-ups and invoices")]
  ];
  const qrCells = [1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,0,0,1,0,1,0,0,0,1,1,0,1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,0,0,1,1,0,1,0,1,1,1,0,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1].map((on)=>`<i class="${on?"on":""}"></i>`).join("");
  return webShell(`<section class="login-page">
    <div class="login-promise platform-promo${apiReturn?" developer-promo":""}"><a href="#/home">${icon("arrow",15)} ${tr("返回首页", "Back home")}</a><span class="kicker">${apiReturn?"DEVELOPER ACCESS":"ACCOUNT ACCESS"}</span><h1>${apiReturn?tr("全球企业数据，接入即用", "Global company data, ready to integrate."):tr("看清企业，做对决定。", "Know the company. Make the right call.")}</h1><p>${apiReturn?tr("通过 API、CLI 与 MCP 按需接入 33 个全球企业数据能力；权限、计费和调用记录清晰可追踪。", "Access 33 global company data capabilities through API, CLI and MCP with traceable permissions, billing and usage."):tr("从企业检索到调查报告，用清晰、可追溯的信息支持每一次合作、投资与采购判断。", "From company search to research reports, use clear and traceable intelligence for every partnership, investment and procurement decision.")}</p><div class="login-promo-actions"><a href="${apiReturn?"#/api-market":"#/home"}">${apiReturn?tr("浏览数据能力", "Browse data capabilities"):tr("开始查企业", "Research a company")} ${icon("arrow",15)}</a><a href="${apiReturn?"#/api-docs":"#/insights"}">${apiReturn?tr("查看开发文档", "View developer documentation"):tr("阅读热门资讯", "Read market intelligence")}</a></div><div class="login-promo-grid">${promoCards.map(([i,title,note])=>`<article><span>${icon(i,19)}</span><strong>${title}</strong><p>${note}</p></article>`).join("")}</div></div>
    <section class="login-card">
      <header><span class="login-logo"><img src="assets/sqj-mark-v4.svg" alt=""></span><div><h2>${apiReturn?tr("登录商情局开放平台", "Sign in to Shangqingju Open Platform"):tr("登录商情局", "Sign in to Shangqingju")}</h2><p>${apiReturn?tr("管理 API Key、余额和调用记录", "Manage API keys, balance and usage"):tr("首次登录将自动创建账户", "First sign-in creates your account")}</p></div></header>
      ${pending ? `<div class="auth-return-notice">${icon("lock",18)}<div><strong>${tr("登录后继续支付", "Continue to payment after sign-in")}</strong><span>${pending.companyName} · ${pending.moduleCount} ${tr("个模块", "modules")} · ${money(pending.amount)}</span><small>${tr("已选内容会保留，登录成功后自动返回收银台。", "Your selection is saved and you will return to checkout automatically.")}</small></div></div>` : ""}
      <div class="login-tabs" role="tablist"><button role="tab" aria-selected="${phoneMode}" class="${phoneMode?"active":""}" data-action="login-mode" data-mode="sms">${tr("手机号登录", "Mobile")}</button><button role="tab" aria-selected="${!phoneMode}" class="${!phoneMode?"active":""}" data-action="login-mode" data-mode="wechat">${tr("微信扫码", "WeChat QR")}</button></div>
      ${phoneMode ? `<form class="phone-login" data-form="login"><label><span>${tr("手机号", "Mobile number")}</span><div><b>+86</b><input name="mobile" inputmode="tel" maxlength="11" placeholder="${tr("请输入手机号", "Enter mobile number")}" required></div></label><label><span>${tr("验证码", "Verification code")}</span><div><input name="code" inputmode="numeric" maxlength="6" placeholder="${tr("6 位验证码", "6-digit code")}" required><button type="button" data-action="send-code">${tr("获取验证码", "Send code")}</button></div></label><button class="login-submit" type="submit">${tr("登录", "Sign in")} ${icon("arrow",17)}</button></form>` : `<div class="wechat-login"><div class="mock-qr" aria-label="${tr("演示微信二维码", "Demo WeChat QR code")}">${qrCells}<span>SQJ</span></div><strong>${tr("打开微信扫一扫", "Scan with WeChat")}</strong><p>${tr("二维码为原型演示，不会关联真实微信账户", "Prototype QR only; no real WeChat account is linked")}</p><button data-action="login-complete">${tr("模拟扫码成功", "Simulate successful scan")}</button></div>`}
      <small class="login-consent">${tr("登录即表示你已阅读并同意《用户协议》和《隐私政策》；首次登录将自动完成注册。", "By signing in, you agree to the Terms and Privacy Policy. First sign-in creates your account.")}</small>
    </section>
  </section>`, "", "login");
}

function renderAdminLogin() {
  const capabilities = [
    ["资讯审核与发布","查看 Agent 采集文章、核验来源并人工发布","spark"],
    ["商品、价格与交付","配置报告和 API 价格，处理报告任务与订单","report"],
    ["客户、余额与发票","管理客户使用、充值余额、退款与开票申请","user"],
    ["数据源与审计","维护企业数据源并追踪全部敏感操作","shield"]
  ];
  return `${prototypeBar()}<main class="admin-login-page"><section class="admin-login-intro"><a href="#/home" class="admin-login-brand"><img src="assets/sqj-mark-v4.svg" alt="SQJ"><span><strong>商情局</strong><small>官方运营控制台</small></span></a><div class="admin-login-copy"><span>PLATFORM OPERATIONS</span><h1>让每一项运营动作，<em>可追踪、可复核、可回滚</em></h1><p>这里是商情局网站平台的内部运营入口，用于内容审核、数据源管理、商品与价格配置、客户交易、发票及审计。用户请返回产品首页登录。</p></div><div class="admin-login-capabilities">${capabilities.map(([title,note,iconName])=>`<article><span>${icon(iconName,21)}</span><div><strong>${title}</strong><small>${note}</small></div></article>`).join("")}</div><a class="admin-login-back" href="#/home">${icon("arrow",15)} 返回商情局用户端</a></section><section class="admin-login-panel"><div class="admin-login-card"><header><span>${icon("shield",22)}</span><div><small>OPERATIONS ACCESS</small><h2>登录运营后台</h2><p>仅限平台运营人员使用</p></div></header><div class="admin-login-env"><i></i><span>Mock 运营环境</span><b>所有操作写入审计日志</b></div><form data-form="admin-login"><label><span>运营账号</span><input name="account" autocomplete="username" value="operator" placeholder="请输入运营账号" required></label><label><span>密码</span><input name="password" type="password" autocomplete="current-password" value="123456" placeholder="请输入密码" required></label><button type="submit">进入运营控制台 ${icon("arrow",17)}</button></form><div class="admin-login-demo"><strong>原型演示账号</strong><span>operator / 123456</span><small>正式上线时接入独立后台账号和安全策略，不与用户手机号登录共用。</small></div></div></section></main>`;
}

function moduleMiniCard(m) {
  const en = {
    M01:["Company Identity & Registry","Confirm the exact entity and operating status","Local name · Registry ID · Legal form"],
    M02:["Contacts & Operations","Review website, operating address and activities","Website · Address · Activities"],
    M03:["Ownership & Control","Identify shareholders, control paths and UBO","Shareholders · Stakes · Control paths"],
    M04:["Directors & Management","Verify directors, executives and governance","Directors · Executives · Legal representative"],
    M05:["Group & Affiliates","Map headquarters, branches and global affiliates","HQ · Branches · Subsidiaries"],
    M06:["Financial Performance","Review revenue, profit, debt and trends","Revenue · Profit · Assets"]
  }[m.code];
  return `<article class="module-mini-card"><div class="module-code ${m.tone}">${m.code}</div><div><h3>${state.locale === "en" && en ? en[0] : m.name}</h3><p>${state.locale === "en" && en ? en[1] : m.short}</p><span>${state.locale === "en" && en ? en[2] : m.fields.slice(0,3).join(" · ")}</span></div>${icon("chevron",18)}</article>`;
}

function renderSearch() {
  const results = state.searchResults || companies;
  const domestic = state.searchScope === "CN";
  const scopeName = domestic ? tr("国内（中国大陆）", "China Database") : tr("全球", "Global Database");
  const sourceLabel = state.mockStatus === "online"
    ? `<span class="live-source online"><i></i> ${domestic ? tr("国内数据库", "China database") : tr("全球数据库", "Global database")}${tr("已连接", " connected")} · ${state.searchProvider || "Mock Provider"} · ${state.mockRequestId || ""}</span>`
    : `<span class="live-source fallback"><i></i> ${tr("内置备用数据", "Built-in fallback data")}</span>`;
  return webShell(`
    <section class="page-hero compact"><div class="breadcrumbs"><a href="#/home">${tr("首页", "Home")}</a><span>/</span><strong>${tr("企业搜索", "Company search")}</strong></div><div class="search-title"><div><span class="kicker">SUBJECT RESOLUTION</span><h1>${tr("确认你要调查的企业主体", "Confirm the exact company")}</h1><p>${tr("当前查询范围", "Current database")}: <strong>${scopeName}</strong>. “${state.searchQuery}” ${tr(`找到 ${results.length} 个测试候选。请按国家、注册号与地址确认，系统不会只凭名称自动合并。`, `returned ${results.length} test candidate(s). Confirm by jurisdiction, registration number and address.`)}</p>${sourceLabel}</div><form class="inline-search scope-inline" data-form="search">${databasePicker(true)}<input name="q" value="${state.searchQuery}" aria-label="${tr("重新搜索企业", "Search again")}"/><button>${icon("search",18)} ${tr("重新搜索", "Search")}</button></form></div></section>
    <section class="content-layout search-layout"><aside class="filter-panel"><div class="filter-head"><strong>筛选结果</strong><button data-action="clear-filters">重置</button></div><label>国家/地区<select><option>全部国家</option><option>美国</option><option>新加坡</option><option>中国香港</option></select></label><label>经营状态<select><option>全部状态</option><option>在营</option><option>已注销</option></select></label><div class="filter-note">${icon("alert",18)} 若主体匹配仍不足，系统会要求补充注册号或地址，不会直接进入收费。</div></aside><div class="results-panel"><div class="results-toolbar"><span><strong>${results.length}</strong> 个候选主体 · ${state.searchDataState}</span><span>按匹配度排序</span></div>${results.length ? results.map(companyResultCard).join("") : '<div class="empty-results">未找到记录。请补充注册号、国家或地址。</div>'}</div></section>
  `, "home", "search");
}

function companyResultCard(c, index) {
  return `<article class="company-result-card"><div class="flag-box">${c.flag}</div><div class="company-result-main"><div class="company-title-row"><div><h2>${c.name}</h2><p>${c.localName}</p></div><span class="status-pill ${c.status === "已注销" ? "muted" : "ok"}">${c.status}</span></div><dl class="company-facts"><div><dt>国家 / 地区</dt><dd>${c.country} · ${c.region}</dd></div><div><dt>注册号</dt><dd>${c.registration}</dd></div><div><dt>注册地址</dt><dd>${c.address}</dd></div><div><dt>数据更新时间</dt><dd>${c.updated}</dd></div></dl><div class="match-row"><span>主体匹配置信度</span><div class="confidence"><i style="width:${index === 0 ? 92 : 68}%"></i></div><strong>${c.confidence}</strong></div></div><div class="company-result-action"><span class="demo-tag">演示主体</span><button class="button primary" data-action="select-company" data-company="${c.id}">确认此主体 ${icon("arrow",17)}</button></div></article>`;
}

function renderCompany() {
  const c = state.selectedCompany;
  const selected = modules.filter((m) => state.selectedModules.has(m.code));
  const subtotal = selected.reduce((sum, m) => sum + m.price, 0);
  const discount = selected.length >= 3 ? Math.round(subtotal * 0.12) : 0;
  return webShell(`
    <section class="company-banner"><div class="breadcrumbs"><a href="#/home">首页</a><span>/</span><a href="#/search">搜索结果</a><span>/</span><strong>主体与模块</strong></div><div class="company-banner-grid"><div class="company-identity"><div class="flag-box large">${c.flag}</div><div><div class="identity-title"><h1>${c.name}</h1><span class="status-pill ok">${c.status}</span></div><p>${c.localName}</p><div class="identity-tags"><span>${c.country}</span><span>${c.registration}</span><span>平台 ID ${c.id}</span></div></div></div><div class="identity-facts"><div><span>注册地址</span><strong>${c.address}</strong></div><div><span>最近取数</span><strong>${c.updated}</strong></div><div><span>免费预览</span><strong>只用于确认主体，不替代付费模块</strong></div></div></div></section>
    <section class="module-buy-layout"><div class="module-catalog"><div class="catalog-head"><div><span class="kicker">MODULE CATALOG</span><h2>选择本次调查需要的模块</h2><p>演示价仅用于验证购买流程。每个模块在支付前显示覆盖状态、字段范围与数据时间。</p></div><div class="legend-inline">${stateBadge("AVAILABLE")}${stateBadge("NO_RECORD")}${stateBadge("PARTIAL")}${stateBadge("NO_COVERAGE")}</div></div><div class="module-grid">${modules.map(moduleCard).join("")}</div></div><aside class="cart-panel"><div class="cart-sticky"><span class="kicker">CURRENT BRIEF</span><h2>本次调查清单</h2><div class="cart-company"><span>${c.flag}</span><div><strong>${c.name}</strong><small>${c.country} · ${c.registration}</small></div></div><div class="cart-items">${selected.length ? selected.map((m) => `<div><span><small>${m.code}</small>${m.name}</span><strong>${money(m.price)}</strong><button data-action="toggle-module" data-module="${m.code}" aria-label="移除${m.name}">×</button></div>`).join("") : '<div class="empty-cart">尚未选择模块</div>'}</div><dl class="price-lines"><div><dt>模块小计</dt><dd>${money(subtotal)}</dd></div><div><dt>组合优惠 ${selected.length >= 3 ? "12%" : "（选 3 项起）"}</dt><dd>-${money(discount)}</dd></div><div class="price-total"><dt>演示应付</dt><dd>${money(subtotal - discount)}</dd></div></dl><button class="button primary wide" data-action="to-checkout" ${selected.length ? "" : "disabled"}>查看订单与交付范围 ${icon("arrow",17)}</button><button class="button ghost wide" data-action="select-recommended">选择采购尽调组合</button><div class="cart-assurance"><span>${icon("shield",18)} 支付前检查覆盖</span><span>${icon("report",18)} 自动生成 PDF</span><span>${icon("spark",18)} 报告内 AI 问答</span></div></div></aside></section>
  `, "home", "company");
}

function moduleCard(m) {
  const selected = state.selectedModules.has(m.code);
  const disabled = m.state === "NO_COVERAGE";
  return `<article class="module-card ${selected ? "selected" : ""} ${disabled ? "disabled" : ""}" data-code="${m.code}"><div class="module-card-top"><div class="module-code ${m.tone}">${m.code}</div>${stateBadge(m.state)}</div><h3>${m.name}</h3><p>${m.short}</p><div class="field-tags">${m.fields.map((f) => `<span>${f}</span>`).join("")}</div><div class="module-source"><span>数据映射</span><code>${m.source}</code></div><div class="module-card-footer"><div><span>${m.coverage} · 演示价</span><strong>${disabled ? "不可购买" : money(m.price)}</strong></div><button data-action="toggle-module" data-module="${m.code}" ${disabled ? "disabled" : ""}>${selected ? `${icon("check",16)} 已选择` : "加入调查"}</button></div></article>`;
}

function renderCheckout() {
  const { selected, subtotal, discount, total } = currentOrderQuote();
  const methods = [
    { code:"WECHAT", name:"微信支付", note:"演示扫码支付", mark:"微", tone:"wechat" },
    { code:"ALIPAY", name:"支付宝", note:"演示支付宝收银台", mark:"支", tone:"alipay" },
    { code:"BALANCE", name:"账户余额", note:`可用 ${money(state.accountBalance)}`, mark:"余", tone:"balance" },
    { code:"BANK_TRANSFER", name:"其他方式", note:"对公转账 · 演示确认", mark:"企", tone:"bank" },
  ];
  const selectedPayment = methods.find((method) => method.code === state.paymentMethod) || methods[0];
  const paymentAction = { WECHAT:"演示微信支付", ALIPAY:"演示支付宝支付", BALANCE:"使用账户余额支付", BANK_TRANSFER:"提交其他方式演示" }[state.paymentMethod] || "演示支付";
  const insufficient = state.paymentMethod === "BALANCE" && state.accountBalance < total;
  const invoicePanel = state.invoiceRequested ? `<div class="invoice-details" id="invoice-details"><div class="invoice-details-head"><div><strong>选择发票类型并填写资料</strong><span>本次填写将随订单保存，也可在“我的账户”中维护常用信息。</span></div><button data-action="save-invoice-checkout">保存发票信息</button></div>${invoiceTypeSwitchMarkup()}<div class="invoice-form">${invoiceFieldsMarkup()}</div>${state.invoiceType === "VAT_SPECIAL" ? '<div class="special-invoice-note"><strong>专票填写提示</strong><span>单位名称应与营业执照一致；地址、电话应为税务登记信息；开户行及账号应为企业基本账户信息。</span></div>' : ''}<small>演示环境只保存到当前页面与 Mock 订单，不会发送真实发票。</small></div>` : "";
  return webShell(`
    <section class="simple-page-head"><div class="breadcrumbs"><a href="#/company">返回模块选择</a><span>/</span><strong>收银台</strong></div><span class="kicker">SECURE CHECKOUT</span><h1>确认订单并选择支付方式</h1><p>你已登录，订单将关联到 ${state.customer?.mobileMasked || "当前客户账户"}，便于后续查看报告、申请发票与售后处理。</p></section>
    <div class="mock-provider-notice">${icon("alert",18)}<div><strong>支付与开票接口示例</strong><span>微信、支付宝、对公转账与发票上游目前均为 Mock 示例，不会真实扣款或开票；后续只替换 Provider Adapter，不改变订单、支付和开票流程。</span></div></div>
    <section class="checkout-layout"><div class="checkout-main"><article class="checkout-card"><div class="card-heading"><div><span>01</span><h2>客户与调查主体</h2></div><button data-action="go" data-target="search">更换主体</button></div><div class="checkout-user">${icon("user",19)}<div><strong>${state.customer?.mobileMasked || "已登录客户"}</strong><span>客户 ID ${state.customer?.id || "CUS-DEMO-0001"}</span></div><b>${icon("check",14)} 已登录</b></div><div class="checkout-company"><div class="flag-box">${state.selectedCompany.flag}</div><div><strong>${state.selectedCompany.name}</strong><span>${state.selectedCompany.country} · ${state.selectedCompany.registration}</span><small>${state.selectedCompany.address}</small></div>${stateBadge("AVAILABLE")}</div></article><article class="checkout-card"><div class="card-heading"><div><span>02</span><h2>数据模块与承诺范围</h2></div><button data-action="go" data-target="company">修改模块</button></div><div class="checkout-modules">${selected.map((m) => `<div><div class="module-code ${m.tone}">${m.code}</div><div><strong>${m.name}</strong><span>${m.fields.slice(0,4).join(" · ")}</span><small>${m.state === "PARTIAL" ? "部分字段可用，购买前已披露" : m.state === "NO_RECORD" ? "已完成核查；未发现记录仍属于有效交付" : "预计完整交付"}</small></div><b>${money(m.price)}</b></div>`).join("")}</div></article><article class="checkout-card"><div class="card-heading"><div><span>03</span><h2>选择支付方式</h2></div></div><div class="payment-methods" role="radiogroup">${methods.map((method)=>`<button role="radio" aria-checked="${state.paymentMethod===method.code}" class="payment-option ${method.tone} ${state.paymentMethod===method.code?"selected":""}" data-action="select-payment" data-method="${method.code}"><i>${method.mark}</i><span><strong>${method.name}</strong><small>${method.note}</small></span><b>${state.paymentMethod===method.code?icon("check",15):""}</b></button>`).join("")}</div>${insufficient?'<div class="payment-warning">账户余额不足，请选择其他支付方式。</div>':""}</article><article class="checkout-card invoice-card"><div class="card-heading"><div><span>04</span><h2>发票与交付</h2></div></div><div class="invoice-choice"><button class="${!state.invoiceRequested?"selected":""}" data-action="set-invoice" data-value="false"><strong>暂不开票</strong><span>支付后可在订单中心补充</span></button><button class="${state.invoiceRequested?"selected":""}" data-action="set-invoice" data-value="true"><strong>需要发票</strong><span>选择普票或专票并填写资料</span></button></div>${invoicePanel}<p class="invoice-note">无论是否立即开票，订单都会保存客户、调查主体、模块、金额和支付记录，后续开票不需要重新下单。</p></article><article class="checkout-card"><div class="card-heading"><div><span>05</span><h2>交付与使用声明</h2></div></div><div class="terms-grid"><label><input type="checkbox" checked /> 我已了解：报告是生成时点的数据快照，不代表永久实时。</label><label><input type="checkbox" checked /> 我已了解：NO_RECORD 是有效核查结果，NO_COVERAGE 才是无法交付。</label><label><input type="checkbox" checked /> 我同意演示服务条款和数据来源声明。</label></div></article></div><aside class="order-summary"><span class="kicker">ORDER SUMMARY</span><h2>订单摘要</h2><dl><div><dt>模块数量</dt><dd>${selected.length} 项</dd></div><div><dt>模块小计</dt><dd>${money(subtotal)}</dd></div><div><dt>组合优惠</dt><dd>-${money(discount)}</dd></div><div><dt>支付方式</dt><dd>${selectedPayment.name}</dd></div><div><dt>发票状态</dt><dd>${state.invoiceRequested?`${invoiceTypeLabel()}资料待提交`:"暂不开票"}</dd></div><div class="grand-total"><dt>演示应付</dt><dd>${money(total)}</dd></div></dl><div class="delivery-box"><strong>预计 3–8 分钟</strong><span>支付成功后自动创建报告任务</span><span>PDF + 在线报告 + AI 问答</span></div><button class="button primary wide" data-action="confirm-payment" ${state.paymentBusy||insufficient?"disabled":""}>${state.paymentBusy?"正在创建订单…":`${paymentAction} ${icon("arrow",17)}`}</button><p class="fine-print">Mock 环境会创建订单和支付记录，但不会调用真实支付或扣款。</p></aside></section>
  `, "home", "checkout");
}

function renderProgress() {
  const selected = modules.filter((m) => state.selectedModules.has(m.code));
  const step = state.progressStep;
  const taskRows = selected.map((m, i) => {
    const doneAt = Math.min(4, i + 1);
    const status = step >= doneAt ? "done" : step >= Math.max(1, doneAt - 1) ? "running" : "queued";
    const label = status === "done" ? (m.state === "NO_RECORD" ? "已完成 · NO_RECORD" : m.state === "PARTIAL" ? "部分完成 · 已披露缺失" : "已完成") : status === "running" ? "正在获取并标准化" : "排队中";
    return `<div class="task-row ${status}"><div class="task-status">${status === "done" ? icon("check",16) : status === "running" ? '<span class="spinner"></span>' : icon("clock",16)}</div><div><strong>${m.code} ${m.name}</strong><span>${label}</span></div><div class="task-progress"><i style="width:${status === "done" ? 100 : status === "running" ? 58 : 8}%"></i></div><small>${status === "done" ? "已保存证据与来源时间" : ""}</small></div>`;
  }).join("");
  const orderInvoiceType = state.lastOrder?.invoice?.type === "VAT_SPECIAL" ? "增值税专用发票" : "增值税普通发票";
  const invoiceStatusLabel = state.lastOrder?.invoice?.status === "PENDING_ISSUE" ? `${orderInvoiceType}资料已提交，待开票` : state.lastOrder?.invoice?.status === "PENDING_INFO" ? `待补充${orderInvoiceType}资料` : "暂不开票，可后续申请";
  const orderProof = state.lastOrder ? `<div class="order-proof"><span>${icon("check",17)}</span><div><strong>支付记录已保存</strong><small>${state.lastOrder.orderId} · ${state.lastOrder.paymentLabel} · ${money(state.lastOrder.amount)}</small><small>发票：${invoiceStatusLabel}</small></div></div>` : "";
  setTimeout(startProgress, 50);
  return webShell(`
    <section class="progress-page"><div class="progress-visual"><div class="orbit"><div class="orbit-core">${step >= 5 ? icon("check",42) : icon("report",42)}</div><span></span><span></span><span></span></div><span class="kicker">REPORT TASK · SQJ-TASK-20260816-008</span><h1>${step >= 5 ? "报告已生成，可以开始阅读" : "正在生成企业调查报告"}</h1><p>${step >= 5 ? "结构化报告、PDF 索引与 AI 引用锚点均已完成。" : "你可以离开本页。模块任务独立执行，已完成章节会先行保存。"}</p><div class="overall-progress"><i style="width:${Math.min(100, 12 + step * 18)}%"></i></div><div class="progress-meta"><span>${Math.min(100, 12 + step * 18)}% 完成</span><span>${step >= 5 ? "总耗时 2分18秒（演示）" : "预计剩余 2–5 分钟"}</span></div>${step >= 5 ? '<button class="button primary" data-action="open-report">打开报告阅读器 '+icon("arrow",17)+'</button>' : '<button class="button ghost" data-action="finish-progress">跳过等待，完成演示</button>'}</div><div class="task-panel">${orderProof}<div class="task-panel-head"><div><span class="kicker">MODULE PIPELINE</span><h2>模块级进度</h2></div><span>${selected.length} 个模块</span></div>${taskRows}<div class="task-note">${icon("shield",18)} PROVIDER_ERROR 与 SYSTEM_ERROR 不计费并可重试；NO_RECORD 属于有效结果。</div></div></section>
  `, "home", "progress");
}

function startProgress() {
  if (route().name !== "progress" || state.progressTimerActive || state.progressStep >= 5) return;
  state.progressTimerActive = true;
  const timer = setInterval(() => {
    if (route().name !== "progress") {
      clearInterval(timer);
      state.progressTimerActive = false;
      return;
    }
    state.progressStep += 1;
    render();
    if (state.progressStep >= 5) {
      clearInterval(timer);
      state.progressTimerActive = false;
    }
  }, 1200);
}

function renderReport() {
  const selected = modules.filter((m) => state.selectedModules.has(m.code));
  const reportNames = reportCompanyNames();
  const toc = modules.map((m) => `<button class="toc-item ${state.selectedModules.has(m.code) ? "" : "locked"}" data-action="jump-section" data-section="section-${m.code}"><span>${m.code}</span><strong>${m.name}</strong>${state.selectedModules.has(m.code) ? icon("chevron",15) : icon("lock",14)}</button>`).join("");
  return `${prototypeBar()}<div class="report-app"><header class="report-topbar"><a class="brand compact-brand" href="#/home">${logo()}</a><div class="report-title"><strong>${reportNames.english}</strong>${reportNames.chinese ? `<small>${reportNames.chinese}</small>` : ""}<span>调查报告 · V1 · 数据截止 2026-08-16 09:40 UTC</span></div><div class="report-actions"><button data-action="go" data-target="company">增购模块</button><button data-action="print-report">${icon("download",17)} 打印 / 保存 PDF</button><button class="primary-small" data-action="go" data-target="library">我的报告</button></div></header><main id="main-content" class="report-layout"><aside class="report-toc"><div class="toc-search">${icon("search",17)}<input aria-label="搜索报告" placeholder="搜索报告内容" /></div><div class="report-version"><span>报告版本</span><button>V1 · 当前版本⌄</button></div><nav aria-label="报告目录"><button class="toc-item active" data-action="jump-section" data-section="section-summary"><span>00</span><strong>执行摘要</strong>${icon("chevron",15)}</button>${toc}</nav><div class="toc-legend"><strong>数据状态</strong>${stateBadge("NO_RECORD")}${stateBadge("PARTIAL")}<small>未购章节只显示名称与增购入口。</small></div></aside><article class="report-document"><div class="report-cover"><div class="cover-top"><span>商情局 · 企业调查报告</span><span>SQJ-RPT-20260816-0018</span></div><div class="cover-main"><span class="cover-kicker">GLOBAL ENTERPRISE DUE DILIGENCE</span><h1>${reportNames.english}</h1>${reportNames.chinese ? `<h2 class="cover-local-name">${reportNames.chinese}</h2>` : ""}<p>${state.selectedCompany.country} · ${state.selectedCompany.registration}</p><div class="cover-status"><div><span>报告版本</span><strong>V1</strong></div><div><span>已购模块</span><strong>${selected.length} / 10</strong></div><div><span>生成方式</span><strong>自动化标准版</strong></div></div></div><div class="cover-foot"><span>本报告为演示数据，不构成法律、审计、投资或制裁专业意见。</span><span>2026.08.16</span></div></div><section id="section-summary" class="report-section"><div class="section-number">00</div><div class="section-heading-report"><span>EXECUTIVE SUMMARY</span><h2>执行摘要</h2><p>以下内容区分“报告事实”“规则提示”和“AI 归纳”。所有重要内容均应回溯到来源与数据时间。</p></div><div class="summary-grid"><article class="summary-card"><span class="summary-label fact">报告事实</span><strong>主体识别已完成</strong><p>已按名称、国家、注册号与地址确认唯一演示主体。</p><button data-action="jump-section" data-section="section-M01">查看主体证据 ${icon("arrow",15)}</button></article><article class="summary-card"><span class="summary-label rule">规则提示</span><strong>制裁模块发现 0 条命中</strong><p>这是已完成核查后的 NO_RECORD，不代表未来永久无风险。</p><button data-action="jump-section" data-section="section-M08">查看筛查范围 ${icon("arrow",15)}</button></article><article class="summary-card"><span class="summary-label ai">AI 归纳</span><strong>建议补充核对两项</strong><p>财务数据存在年度缺口；知识产权与网络风险暂无可靠覆盖。</p><button data-action="ask-ai" data-question="根据本报告生成合作前补充核查清单">让 AI 生成清单 ${icon("spark",15)}</button></article></div><div class="risk-overview"><div><span>高优先级风险</span><strong>0</strong><small>基于已购模块</small></div><div><span>需人工关注</span><strong>2</strong><small>数据缺口与待核对</small></div><div><span>已核查无记录</span><strong>1</strong><small>制裁与合规</small></div><div><span>未购买 / 无覆盖</span><strong>${10 - selected.length}</strong><small>AI 无权读取正文</small></div></div></section>${modules.map(reportSection).join("")}<section class="report-disclaimer"><strong>数据与责任说明</strong><p>本报告使用演示数据验证信息层级与交互。正式报告必须记录供应商、原始来源、采集日期、标准化版本、报告版本和引用位置。资料不足时不得推测。</p></section></article><aside class="ai-panel"><div class="ai-head"><div><span class="ai-avatar">${icon("spark",19)}</span><div><strong>AI 调查员</strong><small>仅阅读当前报告与授权文件</small></div></div><span class="budget-chip">今日 47 / 50 问</span></div><div class="ai-context"><span>${icon("report",15)} 当前上下文</span><strong>${reportNames.english} · V1</strong>${reportNames.chinese ? `<small>${reportNames.chinese}</small>` : ""}<small>${selected.length} 个已购章节 · 未联网</small></div><div class="suggested-questions"><button data-action="ask-ai" data-question="这家公司最需要关注的三个问题是什么？">最需要关注的三个问题？</button><button data-action="ask-ai" data-question="实际控制人是谁？">实际控制人是谁？</button><button data-action="ask-ai" data-question="有没有命中制裁名单？">有没有命中制裁名单？</button></div><div class="ai-messages">${state.aiMessages.map(renderAiMessage).join("")}</div><form class="ai-input" data-form="ai"><textarea name="question" rows="2" placeholder="向当前报告提问…" aria-label="向报告提问"></textarea><div><span>${icon("shield",14)} 回答必须引用证据</span><button type="submit" aria-label="发送问题">${icon("arrow",18)}</button></div></form></aside></main></div>${annotationPanel("report")}`;
}

async function printReportPdf() {
  if (!hasPaidReportAccess()) {
    toast("请先完成报告购买，再下载完整 PDF");
    return;
  }
  if (route().name !== "report") {
    go("report");
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }
  document.documentElement.classList.add("report-printing");
  const originalTitle = document.title;
  const names = reportCompanyNames();
  document.title = `${names.english}${names.chinese ? `_${names.chinese}` : ""}_商情局企业调查报告_V1`;
  try {
    await (document.fonts?.ready || Promise.resolve());
  } catch (_) {
    // 系统字体加载失败时仍允许浏览器使用后备中文字体打印。
  }
  await new Promise((resolve) => requestAnimationFrame(resolve));
  const cleanup = () => {
    document.documentElement.classList.remove("report-printing");
    document.title = originalTitle;
  };
  window.addEventListener("afterprint", cleanup, { once: true });
  toast("完整报告已准备好，请在系统窗口选择“保存为 PDF”");
  window.print();
  setTimeout(cleanup, 2000);
}

function reportSection(m) {
  const purchased = state.selectedModules.has(m.code);
  if (!purchased) return `<section id="section-${m.code}" class="report-section locked-section"><div class="section-number">${m.code.slice(1)}</div><div class="locked-content">${icon("lock",26)}<div><h2>${m.name}</h2><p>${m.state === "NO_COVERAGE" ? "该主体当前暂无可靠覆盖，不能购买，也不显示推测内容。" : "当前报告未购买此模块。AI 不会检索或引用该章节。"}</p></div>${m.state === "NO_COVERAGE" ? stateBadge("NO_COVERAGE") : '<button data-action="go" data-target="company">查看增购范围</button>'}</div></section>`;
  const details = {
    M01: [["标准名称", state.selectedCompany.name], ["当地语言名称", state.selectedCompany.localName], ["注册号", state.selectedCompany.registration], ["经营状态", "Active / 在营"], ["注册地址", state.selectedCompany.address], ["法律形式", "Corporation（演示）"]],
    M03: [["直接股东", "Northstar Holdings Ltd.（演示）"], ["持股比例", "82.0%（演示）"], ["最终受益人", "资料披露受限，需进一步核验"], ["控制路径", "1 层直接控制（演示）"]],
    M08: [["筛查结果", "未发现命中记录"], ["数据状态", "NO_RECORD"], ["筛查范围", "演示制裁名单集合"], ["筛查时间", "2026-08-16 09:58 UTC"]],
  }[m.code] || [["模块状态", m.coverage], ["已返回字段", m.fields.slice(0,3).join("、")], ["数据提示", m.state === "PARTIAL" ? "部分年份或字段缺失，已在购买前披露。" : "已完成当前模块演示查询。"], ["取数时间", "2026-08-16 09:40 UTC"]];
  return `<section id="section-${m.code}" class="report-section data-section"><div class="section-number">${m.code.slice(1)}</div><div class="section-heading-report"><span>${m.code} · ${m.name.toUpperCase()}</span><h2>${m.name}</h2><div class="section-state">${stateBadge(m.state)}<span>数据截止 2026-08-16 09:40 UTC</span></div></div><div class="evidence-table">${details.map(([k,v]) => `<div><span>${k}</span><strong>${v}</strong></div>`).join("")}</div><div class="source-note"><div>${icon("database",18)}<span><strong>来源与血缘</strong><small>sourceField: ${m.source}</small></span></div><button data-action="show-lineage">查看原始值与转换记录</button></div></section>`;
}

function renderAiMessage(message) {
  if (message.role === "user") return `<div class="ai-message user"><p>${message.text}</p></div>`;
  return `<div class="ai-message assistant"><span class="mini-avatar">${icon("spark",14)}</span><div><p>${message.text}</p>${message.citation ? `<button class="citation-card" data-action="jump-section" data-section="${message.citation.section}"><span>${message.citation.label}</span><strong>${message.citation.quote}</strong></button>` : ""}</div></div>`;
}

function renderLibrary() {
  return webShell(`<section class="simple-page-head"><span class="kicker">REPORT CENTER</span><h1>我的报告与订单</h1><p>报告版本不可覆盖；增购、刷新与重新生成都会形成新版本。</p></section><section class="library-layout"><aside class="library-nav"><button class="active">${icon("report",18)} 我的报告 <span>3</span></button><button>${icon("clock",18)} 生成任务 <span>1</span></button><button>${icon("database",18)} 我的订单 <span>4</span></button></aside><div class="library-main"><div class="library-toolbar"><div class="tab-row"><button class="active">全部</button><button>已完成</button><button>生成中</button><button>已退款</button></div><div class="toc-search">${icon("search",17)}<input placeholder="搜索企业或报告编号" /></div></div><article class="report-list-card featured"><div class="report-thumb"><span>REPORT</span><strong>01</strong></div><div class="report-list-main"><div><span class="status-pill ok">已完成</span><small>SQJ-RPT-20260816-0018 · V1</small></div><h2>${state.selectedCompany.name}</h2><p>${state.selectedCompany.country} · ${state.selectedModules.size} 个模块 · 数据截止 2026-08-16</p><div class="list-tags">${[...state.selectedModules].map(x=>`<span>${x}</span>`).join("")}</div></div><div class="report-list-actions"><button class="button primary" data-action="open-report">在线阅读</button><button class="button ghost" data-action="print-report">下载 PDF</button><button class="text-button" data-action="go" data-target="company">增购模块</button></div></article>${[["Atlas Medical Trading GmbH", "德国", "生成中", "5 / 8 个模块完成"],["Harborline Supply Pte. Ltd.", "新加坡", "部分完成", "M06 数据缺失已披露"]].map((r,i)=>`<article class="report-list-card"><div class="report-thumb muted"><span>REPORT</span><strong>0${i+2}</strong></div><div class="report-list-main"><div><span class="status-pill ${i ? "warn" : "info"}">${r[2]}</span><small>SQJ-RPT-DEMO-000${i+2}</small></div><h2>${r[0]}</h2><p>${r[1]} · ${r[3]}</p></div><div class="report-list-actions"><button class="button ghost">查看进度</button></div></article>`).join("")}</div></section>`, "library", "library");
}

function renderAccountReportCenter() {
  const secondaryReports = [["Atlas Medical Trading GmbH","德国","生成中","5 / 8 个模块完成"],["Harborline Supply Pte. Ltd.","新加坡","部分完成","M06 数据缺失已披露"]];
  return `<section class="account-report-center" id="account-reports"><header><div><span class="kicker">REPORTS & ORDERS</span><h2>报告与订单</h2><p>报告、生成任务和订单统一放在个人中心管理，不再单独占用一级导航。</p></div><div class="tab-row"><button class="active">全部报告</button><button>生成中</button><button>报告订单</button></div></header><div class="account-report-toolbar"><span>${icon("search",17)}<input aria-label="搜索个人报告" placeholder="搜索企业或报告编号" /></span><small>3 份报告 · 1 个任务生成中</small></div><article class="account-report-row featured"><div class="report-thumb"><span>REPORT</span><strong>01</strong></div><div class="report-list-main"><div><span class="status-pill ok">已完成</span><small>SQJ-RPT-20260816-0018 · V1</small></div><h3>${state.selectedCompany.name}</h3><p>${state.selectedCompany.country} · ${state.selectedModules.size} 个模块 · 数据截止 2026-08-16</p><div class="list-tags">${[...state.selectedModules].map((code)=>`<span>${code}</span>`).join("")}</div></div><div class="report-list-actions"><button class="button primary" data-action="open-report">在线阅读</button><button class="button ghost" data-action="print-report">下载 PDF</button><button class="text-button" data-action="go" data-target="company">增购模块</button></div></article>${secondaryReports.map((report,index)=>`<article class="account-report-row"><div class="report-thumb muted"><span>REPORT</span><strong>0${index+2}</strong></div><div class="report-list-main"><div><span class="status-pill ${index ? "warn" : "info"}">${report[2]}</span><small>SQJ-RPT-DEMO-000${index+2}</small></div><h3>${report[0]}</h3><p>${report[1]} · ${report[3]}</p></div><div class="report-list-actions"><button class="button ghost" data-action="go" data-target="progress">查看进度</button></div></article>`).join("")}</section>`;
}

function renderAccountApiCenter() {
  return `<section class="account-api-center" id="account-api"><header><div><span class="kicker">DEVELOPER ACCOUNT</span><h2>API 账户</h2><p>个人中心与数据 API 市场使用同一主账户；应用、密钥、余额和调用账单独立管理。</p></div><div><a href="#/api-market">浏览 API 市场</a><a class="primary" href="#/api-console">进入开发者控制台 ${icon("arrow",15)}</a></div></header><div class="account-api-grid"><article><span>${icon("database",20)}</span><small>API 预存余额</small><strong>¥${state.apiBalance.toLocaleString()}</strong><button data-action="api-buy-from-account">充值 API 余额</button></article><article><span>${icon("api",20)}</span><small>开发者应用</small><strong>1</strong><button data-action="go" data-target="api-console">管理应用与密钥</button></article><article><span>${icon("clock",20)}</span><small>本月调用</small><strong>1,580</strong><button data-action="go" data-target="api-console">查看调用日志</button></article><article><span>${icon("report",20)}</span><small>本月 API 账单</small><strong>¥326.80</strong><button data-action="go" data-target="api-console">账单与发票</button></article></div><div class="account-api-ledger"><div><span><i></i>正式应用</span><strong>全能力测试应用</strong><code>app_sqj_demo_01</code><em>运行正常</em></div><div><span>${icon("shield",15)}安全提醒</span><p>API 密钥明文仅在创建时显示一次；报告购买权限与 API 调用权限相互独立。</p><a href="#/api-docs">查看接入文档</a></div></div></section>`;
}

function renderAccount() {
  const rechargeMethods = [{code:"WECHAT",name:"微信支付",mark:"微"},{code:"ALIPAY",name:"支付宝",mark:"支"},{code:"BANK_TRANSFER",name:"对公转账",mark:"企"}];
  const rechargePanel = state.rechargeOpen ? `<section class="recharge-panel"><header><div><span class="kicker">BALANCE RECHARGE</span><h2>充值账户余额</h2><p>演示充值不会真实扣款；充值成功后的余额可用于报告订单支付。</p></div><button data-action="toggle-recharge">×</button></header><div class="recharge-body"><div><strong>选择充值金额</strong><div class="recharge-amounts">${[100,300,500,1000].map((amount)=>`<button class="${state.rechargeAmount===amount?"selected":""}" data-action="select-recharge-amount" data-amount="${amount}">${money(amount)}</button>`).join("")}</div></div><div><strong>选择充值方式</strong><div class="recharge-methods">${rechargeMethods.map((method)=>`<button class="${state.rechargeMethod===method.code?"selected":""}" data-action="select-recharge-method" data-method="${method.code}"><i>${method.mark}</i><span>${method.name}</span>${state.rechargeMethod===method.code?icon("check",14):""}</button>`).join("")}</div></div></div><footer><div><span>本次演示充值</span><strong>${money(state.rechargeAmount)}</strong></div><button data-action="confirm-recharge">确认演示充值 ${icon("arrow",15)}</button></footer></section>` : "";
  return webShell(`<section class="account-page"><header class="account-page-head"><div><span class="kicker">MY SHANGQINGJU</span><h1>个人中心</h1><p>管理账户余额、报告订单、登录方式与发票信息。</p></div><div class="account-identity"><span>${icon("user",24)}</span><div><strong>${state.customer?.mobileMasked || "138****8888"}</strong><small>客户 ID ${state.customer?.id || "CUS-DEMO-0001"} · 已实名认证（演示）</small></div><b>普通用户</b></div></header><section class="account-dashboard"><div class="account-summary-grid"><article><span>${icon("report",20)}</span><div><small>我的报告</small><strong>3</strong><button data-action="go" data-target="library">查看全部</button></div></article><article><span>${icon("clock",20)}</span><div><small>报告订单</small><strong>4</strong><button data-action="go" data-target="library">查看订单</button></div></article><article><span>${icon("api",20)}</span><div><small>测试应用</small><strong>1</strong><button data-action="go" data-target="api-console">开发者控制台</button></div></article></div><article class="wallet-card"><div class="wallet-head"><div><span>${icon("database",21)}</span><div><small>ACCOUNT BALANCE</small><strong>账户余额</strong></div></div><button data-action="toggle-recharge">充值</button></div><div class="wallet-balance"><span>可用余额</span><strong>${money(state.accountBalance)}</strong><small>可用于商情局报告模块订单 · 演示资金</small></div><div class="wallet-actions"><button data-action="toggle-recharge">${icon("spark",16)} 立即充值</button><button>${icon("clock",16)} 资金明细</button></div><div class="wallet-payment-badges"><span><i>微</i>微信充值</span><span><i>支</i>支付宝充值</span><span><i>企</i>对公转账</span></div><div class="wallet-ledger"><div><span>演示账户初始化</span><time>2026-08-16</time><strong>+ ¥568</strong></div>${state.accountBalance>568?`<div><span>${{WECHAT:"微信",ALIPAY:"支付宝",BANK_TRANSFER:"对公转账"}[state.rechargeMethod]}演示充值</span><time>刚刚</time><strong>+ ${money(state.accountBalance-568)}</strong></div>`:""}</div></article><article class="account-security-card"><div class="account-card-title"><span>${icon("shield",20)}</span><div><h2>账户与登录</h2><p>手机号为主账户，可选绑定微信。</p></div></div><dl><div><dt>登录手机号</dt><dd>${state.customer?.mobileMasked || "138****8888"}<b>已验证</b></dd></div><div><dt>微信账号</dt><dd>${state.customer?.wechatBound?"已绑定":"未绑定"}<button>管理</button></dd></div><div><dt>最近登录</dt><dd>2026-08-16 14:20 · Web</dd></div></dl></article>${renderAccountInvoiceCard()}${rechargePanel}</section></section>`, "account", "account");
}

function apiShell(content, current) {
  const navItems = [
    ["api-console","总览看板","database",true],["api-market","API 市场","api",false],["api-keys","API Key","shield",true],["api-docs","API 文档","report",false],["api-cli","CLI","api",false],["api-mcp","MCP 工具","spark",false],["api-usage","使用日志","clock",true]
  ];
  const activeRoute = current === "api-detail" ? "api-docs" : current;
  const nav = navItems.map(([routeName,label,iconName,requiresAuth])=>`<a href="#/${routeName}" class="${activeRoute===routeName?"active":""} ${requiresAuth?"requires-auth":""}" title="${requiresAuth&&!state.loggedIn?"登录后可用":""}">${icon(iconName,18)}<span>${label}</span>${requiresAuth&&!state.loggedIn?icon("lock",13):icon("chevron",14)}</a>`).join("");
  const accountEntry = state.loggedIn ? `<a class="account-chip" href="#/account?section=api">${icon("user",16)} ${state.customer?.mobileMasked || "已登录"}</a>` : `<a class="account-chip sign-in" href="#/login">${icon("user",16)} 登录 / 注册</a>`;
  return `${prototypeBar()}<div class="api-app api-portal-shell"><aside class="api-portal-sidebar"><a class="api-portal-brand" href="#/home">${logo()}<span>企业数据开放平台</span></a><nav><small>开放平台</small>${nav}</nav><div class="api-portal-side-foot"><a href="#/home">${icon("arrow",16)} 返回产品首页</a><small>33 个全球企业数据接口</small></div></aside><section class="api-portal-stage"><header class="api-portal-top"><div><strong>${activeRoute==="api-console"?"开发者中心":activeRoute==="api-market"?"API 市场":activeRoute==="api-docs"?"开发文档":activeRoute==="api-keys"?"API Key 管理":activeRoute==="api-cli"?"CLI 接入":activeRoute==="api-mcp"?"MCP 工具":activeRoute==="api-usage"?"使用日志":"开放平台"}</strong><span>测试环境</span></div><div>${languageSwitch()}${accountEntry}</div></header><main id="main-content">${content}</main><footer class="api-legal">© 2026 商情局 · 合肥易尊数字科技有限公司 · ${tr("用户协议 · 隐私政策", "Terms · Privacy")}</footer></section></div>${annotationPanel(current)}`;
}

function renderApiMarketLegacy() {
  const keyword = state.apiSearch.trim().toLowerCase();
  const visible = apiProducts.filter((product) => (state.apiFilter === "ALL" || product.group === state.apiFilter) && (!keyword || `${product.name} ${product.code} ${product.domain} ${product.desc}`.toLowerCase().includes(keyword)));
  const categoryCounts = apiProducts.reduce((counts, product)=>({ ...counts, [product.group]:(counts[product.group] || 0) + 1 }), {});
  const selectedProduct = apiProducts.find((product)=>product.code === state.apiPurchaseProduct);
  const plans = [{points:1000,amount:199,note:"适合体验和开发联调"},{points:5000,amount:799,note:"团队常用 · 省 20%"},{points:20000,amount:2499,note:"业务系统批量调用"}];
  const selectedPlan = plans.find((plan)=>plan.points === state.apiRechargeAmount) || plans[1];
  const purchasePanel = state.apiPurchaseOpen ? `<div class="api-purchase-mask" data-action="api-close-purchase"></div><aside class="api-purchase-panel"><header><div><span class="kicker">PURCHASE & USE</span><h2>${selectedProduct ? `购买 ${selectedProduct.name}` : "购买 API 点数"}</h2><p>${selectedProduct ? `本接口每次成功调用消耗 ${selectedProduct.points} 点，购买后在开发者控制台创建密钥即可使用。` : "点数可用于所有已开放的数据接口，失败与系统异常不扣点。"}</p></div><button data-action="api-close-purchase" aria-label="关闭">×</button></header><section><strong>选择点数包</strong><div class="api-plan-grid">${plans.map((plan)=>`<button class="${state.apiRechargeAmount===plan.points?"selected":""}" data-action="api-plan" data-points="${plan.points}"><b>${plan.points.toLocaleString()} 点</b><strong>¥${plan.amount}</strong><small>${plan.note}</small></button>`).join("")}</div></section><section><strong>支付方式</strong><div class="api-payment-grid">${[["WECHAT","微","微信支付（示例）"],["ALIPAY","支","支付宝（示例）"],["BANK_TRANSFER","企","对公转账（示例）"]].map(([code,mark,label])=>`<button class="${state.apiPaymentMethod===code?"selected":""}" data-action="api-payment" data-method="${code}"><i>${mark}</i><span>${label}</span>${state.apiPaymentMethod===code?icon("check",15):""}</button>`).join("")}</div></section><div class="api-purchase-summary"><div><span>当前余额</span><strong>${state.apiBalance.toLocaleString()} 点</strong></div><div><span>购买后余额</span><strong>${(state.apiBalance+selectedPlan.points).toLocaleString()} 点</strong></div><div><span>应付金额</span><strong>¥${selectedPlan.amount}</strong></div></div><footer><small>${icon("shield",14)} 演示支付不真实扣款，订单会写入本地 Mock API。</small><button data-action="confirm-api-purchase" ${state.apiPurchaseBusy?"disabled":""}>${state.apiPurchaseBusy?"正在创建订单…":"确认购买并开通"} ${icon("arrow",16)}</button></footer></aside>` : "";
  const rows = visible.map((product)=>`<div class="api-capability-row"><div class="api-name-cell"><span>${icon(product.group==="A01"?"search":product.group==="A03"?"report":"database",18)}</span><div><strong>${product.name}</strong><small>${product.apiId} · ${product.status}</small></div></div><code>${product.code}</code><span>${product.domain}</span><p>${product.desc}</p>${["API","MCP","CLI"].map((capability)=>`<span class="compatibility ${product.compatibility.includes(capability)?"yes":"no"}">${product.compatibility.includes(capability)?icon("check",14):"—"}</span>`).join("")}<strong class="api-points">${product.points} 点<small>/ 成功调用</small></strong><div class="api-row-actions"><button data-action="api-detail" data-api="${product.code}">详情</button><button class="buy" data-action="api-buy" data-api="${product.code}">${product.status==="内测"?"申请内测":"购买使用"}</button></div></div>`).join("");
  return apiShell(`<div class="reference-api-page"><aside class="reference-api-sidebar"><div class="api-side-title"><span>${icon("database",20)}</span><div><strong>数据查询能力</strong><small>DATA CAPABILITIES</small></div></div><nav><span>接口分类</span>${[["ALL","全部接口",apiProducts.length],["A01","主体识别",categoryCounts.A01],["A02","企业数据",categoryCounts.A02],["A03","报告任务",categoryCounts.A03]].map(([value,label,count])=>`<button class="${state.apiFilter===value?"active":""}" data-action="api-filter" data-filter="${value}"><span>${label}</span><b>${count}</b></button>`).join("")}</nav><nav class="api-resource-links"><span>开发资源</span><button data-action="go" data-target="api-console">应用与 API Key</button><button data-action="show-docs">接口文档</button><button data-action="show-docs">MCP 接入</button><button data-action="go" data-target="api-console">用量与账单</button></nav><div class="api-side-balance"><small>可用点数</small><strong>${state.apiBalance.toLocaleString()}</strong><span>点</span><button data-action="api-buy">购买点数</button></div></aside><section class="reference-api-main"><header><div><span class="kicker">OPEN DATA PLATFORM</span><h1>数据查询能力</h1><p>像选择软件能力一样购买企业数据接口；点数统一结算，购买后即可创建密钥并调用。</p></div><div><button class="button ghost" data-action="api-free-trial">领取 200 点试用</button><button class="button primary" data-action="api-buy">购买 API 点数</button></div></header><form class="api-reference-toolbar" data-form="api-search"><label>${icon("search",18)}<input name="apiSearch" value="${state.apiSearch}" placeholder="搜索接口名称、Code、领域或说明" /></label><button type="submit">搜索</button><button type="button" data-action="api-clear-search">清空</button><span>共 ${visible.length} 个能力</span></form><div class="api-capability-table"><div class="api-capability-head"><span>名称</span><span>Code</span><span>领域</span><span>说明</span><span>API</span><span>MCP</span><span>CLI</span><span>定价</span><span>操作</span></div>${rows || `<div class="api-empty">没有匹配的接口，请换个关键词或分类。</div>`}</div><div class="api-market-note"><span>${icon("shield",18)}</span><div><strong>清晰计费，方便替换真实上游</strong><p>Mock 与正式接口保持统一业务契约。上游接入后，只替换 Provider Adapter，不改前台购买和调用流程。</p></div></div></section></div>${purchasePanel}`, "api-market");
}

function renderApiMarket() {
  const keyword = state.apiSearch.trim().toLowerCase();
  const filtered = apiProducts.filter((product)=>(state.apiFilter === "ALL" || product.group === state.apiFilter) && (!keyword || [product.name, product.code, product.endpoint, product.group, product.desc, ...product.tags].join(" ").toLowerCase().includes(keyword)));
  const categoryCounts = apiProducts.reduce((counts, product)=>({ ...counts, [product.group]:(counts[product.group] || 0) + 1 }), {});
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(state.apiPage, totalPages);
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  const rows = pageItems.map((product)=>`<article class="gc-api-row api-market-offer"><div class="gc-api-row-icon">${icon(product.group.includes("自然人")?"user":product.group.includes("风险")||product.group.includes("制裁")?"shield":product.group.includes("财务")?"report":"database",24)}</div><div class="gc-api-row-main"><div class="gc-api-row-top"><div><span>${product.group}</span><h2>${product.name}</h2></div><button data-action="api-detail" data-api="${product.code}">查看技术文档 ${icon("arrow",15)}</button></div><p>${product.desc}</p><div class="gc-api-offer-use"><small>适用场景</small><div class="gc-api-product-tags">${product.tags.map((tag)=>`<span>${tag}</span>`).join("")}</div></div><footer class="gc-api-offer-footer"><div><small>调用单价</small><strong>${product.price===0?"免费":`¥${product.price} 元/次`}</strong><span>成功返回后计费</span></div><button class="gc-api-buy" data-action="api-buy" data-api="${product.code}">${product.price===0?"免费开通":"购买使用"}</button></footer></div></article>`).join("");
  const pageButtons = Array.from({length:totalPages},(_,index)=>index+1).map((number)=>`<button class="${number===page?"active":""}" data-action="api-page" data-page="${number}">${number}</button>`).join("");
  return apiShell(`<div class="gc-api-market-shell"><aside class="gc-api-sidebar"><div class="gc-api-sidebar-title"><span>${icon("api",22)}</span><div><strong>API 分类</strong><small>GLOBALCHECK API</small></div></div><button class="gc-api-layer ${state.apiFilter==="ALL"?"active":""}" data-action="api-filter" data-filter="ALL"><span>${icon("database",17)}所有 API</span><b>${apiProducts.length}</b></button>${apiGroups.map((group)=>`<button class="gc-api-layer ${state.apiFilter===group?"active":""}" data-action="api-filter" data-filter="${group}"><span>${icon(group.includes("风险")||group.includes("制裁")?"shield":group.includes("自然人")?"user":"report",17)}${group}</span><b>${categoryCounts[group]}</b></button>`).join("")}<div class="gc-api-wallet"><small>API 预存余额</small><strong>¥${state.apiBalance.toLocaleString()}</strong><span>成功调用按全球查原价扣费</span><button data-action="api-buy">充值余额</button></div></aside><section class="gc-api-main"><div class="gc-api-toolbar"><div><span>GLOBAL DATA API MARKET</span><h1>数据 API 市场</h1><p>商情局与全球查属于同一业务主体，共用同一数据源与 33 个接口，仅面向不同客户群体。</p></div><form class="gc-api-search" data-form="api-search">${icon("search",18)}<input name="apiSearch" value="${state.apiSearch}" placeholder="搜索 API 名称、OperationId、路径或字段" /><button type="submit">搜索</button>${state.apiSearch?'<button type="button" data-action="api-clear-search">清空</button>':""}</form></div><div class="gc-api-active-line"><div><strong>${keyword?"搜索结果":state.apiFilter==="ALL"?"所有 API":state.apiFilter}</strong><span>接口名称、请求方式、路径、参数和单价均与全球查保持一致</span></div><em>共 ${filtered.length} 个接口</em></div><div class="gc-api-product-list">${rows || '<div class="api-empty">暂无匹配接口，请调整分类或搜索关键词。</div>'}</div><nav class="gc-api-pagination" aria-label="API 商品分页"><span>第 ${page} 页 / 共 ${totalPages} 页</span><button data-action="api-page" data-page="${Math.max(1,page-1)}" ${page===1?"disabled":""}>上一页</button>${pageButtons}<button data-action="api-page" data-page="${Math.min(totalPages,page+1)}" ${page===totalPages?"disabled":""}>下一页</button></nav><div class="gc-api-source-note">${icon("shield",19)}<div><strong>同一业务主体，同一套 API</strong><p>全球查面向大客户与大型企业；商情局面向中小企业和个人用户。数据源、OperationId、请求路径、参数、返回契约与单价完全一致。</p></div></div></section></div>${renderApiPurchasePanel()}`, "api-market");
}

function renderApiPurchasePanelLegacy() {
  if (!state.apiPurchaseOpen) return "";
  const product = apiProducts.find((item)=>item.code === state.apiPurchaseProduct);
  const plans = [{points:1000,amount:199,note:"适合体验和开发联调"},{points:5000,amount:799,note:"团队常用 · 省 20%"},{points:20000,amount:2499,note:"业务系统批量调用"}];
  const selected = plans.find((plan)=>plan.points === state.apiRechargeAmount) || plans[1];
  return `<div class="api-purchase-mask" data-action="api-close-purchase"></div><aside class="api-purchase-panel"><header><div><span class="kicker">PURCHASE & USE</span><h2>${product ? `购买 ${product.name}` : "购买 API 点数"}</h2><p>${product ? `本接口每次成功调用消耗 ${product.points} 点，购买后在开发者控制台创建密钥即可使用。` : "点数可用于所有已开放的数据接口，失败与系统异常不扣点。"}</p></div><button data-action="api-close-purchase" aria-label="关闭">×</button></header><section><strong>选择点数包</strong><div class="api-plan-grid">${plans.map((plan)=>`<button class="${state.apiRechargeAmount===plan.points?"selected":""}" data-action="api-plan" data-points="${plan.points}"><b>${plan.points.toLocaleString()} 点</b><strong>¥${plan.amount}</strong><small>${plan.note}</small></button>`).join("")}</div></section><section><strong>支付方式</strong><div class="api-payment-grid">${[["WECHAT","微","微信支付（示例）"],["ALIPAY","支","支付宝（示例）"],["BANK_TRANSFER","企","对公转账（示例）"]].map(([code,mark,label])=>`<button class="${state.apiPaymentMethod===code?"selected":""}" data-action="api-payment" data-method="${code}"><i>${mark}</i><span>${label}</span>${state.apiPaymentMethod===code?icon("check",15):""}</button>`).join("")}</div></section><div class="api-purchase-summary"><div><span>当前余额</span><strong>${state.apiBalance.toLocaleString()} 点</strong></div><div><span>购买后余额</span><strong>${(state.apiBalance+selected.points).toLocaleString()} 点</strong></div><div><span>应付金额</span><strong>¥${selected.amount}</strong></div></div><footer><small>${icon("shield",14)} 演示支付不真实扣款，订单会写入本地 Mock API。</small><button data-action="confirm-api-purchase" ${state.apiPurchaseBusy?"disabled":""}>${state.apiPurchaseBusy?"正在创建订单…":"确认购买并开通"} ${icon("arrow",16)}</button></footer></aside>`;
}

function renderApiPurchasePanel() {
  if (!state.apiPurchaseOpen) return "";
  const product = apiProducts.find((item)=>item.code === state.apiPurchaseProduct);
  const plans = [{points:200,amount:200,note:"适合首次接入和联调"},{points:800,amount:800,note:"适合个人开发者与小团队"},{points:2500,amount:2500,note:"适合高频业务调用"}];
  const selected = plans.find((plan)=>plan.points === state.apiRechargeAmount) || plans[1];
  return `<div class="api-purchase-mask" data-action="api-close-purchase"></div><aside class="api-purchase-panel"><header><div><span class="kicker">API BALANCE</span><h2>${product ? `开通 ${product.name}` : "充值 API 余额"}</h2><p>${product ? `${product.method} ${product.endpoint} · ${product.price===0?"免费接口":`每次成功调用 ¥${product.price}`}。接口本身与全球查完全一致。` : "充值后可调用全部 33 个全球查同源接口，按各接口原价逐次扣费。"}</p></div><button data-action="api-close-purchase" aria-label="关闭">×</button></header>${product?`<section class="api-selected-contract"><strong>本次开通接口</strong><div><code>${product.code}</code><span>${product.group}</span><b>${product.price===0?"免费":`¥${product.price} / 次`}</b></div></section>`:""}<section><strong>选择预存金额</strong><div class="api-plan-grid">${plans.map((plan)=>`<button class="${state.apiRechargeAmount===plan.points?"selected":""}" data-action="api-plan" data-points="${plan.points}"><b>充值 ¥${plan.points.toLocaleString()}</b><strong>到账 ¥${plan.amount}</strong><small>${plan.note}</small></button>`).join("")}</div></section><section><strong>支付方式</strong><div class="api-payment-grid">${[["WECHAT","微","微信支付（示例）"],["ALIPAY","支","支付宝（示例）"],["BANK_TRANSFER","企","对公转账（示例）"]].map(([code,mark,label])=>`<button class="${state.apiPaymentMethod===code?"selected":""}" data-action="api-payment" data-method="${code}"><i>${mark}</i><span>${label}</span>${state.apiPaymentMethod===code?icon("check",15):""}</button>`).join("")}</div></section><div class="api-purchase-summary"><div><span>当前 API 余额</span><strong>¥${state.apiBalance.toLocaleString()}</strong></div><div><span>充值后余额</span><strong>¥${(state.apiBalance+selected.amount).toLocaleString()}</strong></div><div><span>应付金额</span><strong>¥${selected.amount}</strong></div></div><footer><small>${icon("shield",14)} 当前为 Mock 示例，不会真实扣款；微信、支付宝、对公转账和开票待后期替换真实 Provider Adapter。</small><button data-action="confirm-api-purchase" ${state.apiPurchaseBusy?"disabled":""}>${state.apiPurchaseBusy?"正在创建订单…":"确认充值并开通"} ${icon("arrow",16)}</button></footer></aside>`;
}

function apiEndpointFor(product) {
  return product.endpoint;
}

function renderApiDetailLegacy() {
  const code = route().params.get("code") || "company.basic";
  const product = apiProducts.find((item)=>item.code === code) || apiProducts[2];
  const endpoint = apiEndpointFor(product);
  const isSearch = product.group === "A01";
  const isTask = product.group === "A03";
  const method = isTask ? "POST" : "GET";
  const requestRows = isTask ? [["companyId","string","是","平台企业 ID","SQJ-DEMO-US-0001"],["modules","string[]","是","需要生成的报告模块","M01, M03, M08"],["Idempotency-Key","header","建议","防止重复创建任务","report-demo-001"]] : isSearch ? [["q","string","是","企业名称、当地名称或注册号","Northstar"],["country","string","否","ISO 3166-1 两位国家码","US"],["page","integer","否","页码，从 1 开始","1"],["pageSize","integer","否","每页数量，最大 50","20"]] : [["companyId","string","是","商情局平台企业 ID","SQJ-DEMO-US-0001"],["fields","string[]","否","需要返回的字段集合","name,status,address"],["language","string","否","返回语言","zh-CN"],["X-Mock-Scenario","header","否","联调异常场景","default"]];
  const responseRows = [["requestId","string","单次请求编号，用于问题定位"],["traceId","string","全链路追踪编号"],["dataState","enum","AVAILABLE / NO_RECORD / PARTIAL 等统一状态"],["queryAt","datetime","本次查询时间"],["sourceUpdatedAt","datetime","上游数据更新时间"],["billable","boolean","本次调用是否计费"],["provider.code","string","实际数据 Provider 标识"],["data","object","业务数据对象，随接口能力变化"]];
  const responseExample = isTask ? { requestId:"req_demo_001", dataState:"AVAILABLE", billable:true, data:{ taskId:"SQJ-TASK-DEMO-008", status:"QUEUED", progress:0 } } : { requestId:"req_demo_001", traceId:"trace_demo_001", dataState:product.code==="company.compliance"?"NO_RECORD":"AVAILABLE", queryAt:"2026-08-16T10:30:00Z", sourceUpdatedAt:"2026-08-16T09:58:12Z", cacheHit:false, billable:true, provider:{ mode:"MOCK", code:"MOCK_GLOBAL_PROVIDER" }, data:{ companyId:"SQJ-DEMO-US-0001", capability:product.code, result:product.code==="company.compliance"?[]:"DEMO_DATA" } };
  const related = apiProducts.filter((item)=>item.group === product.group && item.code !== product.code).slice(0,3);
  const nav = [["api-overview","概览"],["api-intro","接口说明"],["api-request","请求参数"],["api-response","返回结果"],["api-fields","字段解释"],["api-examples","调用示例"],["api-pricing","计费说明"],["api-related","相关 API"]];
  const curlPayload = isTask ? `&#10;  --data '{"companyId":"SQJ-DEMO-US-0001","modules":["M01","M03","M08"]}'` : "";
  return apiShell(`<section class="api-detail-hero-v3"><div><a href="#/api-market">← 返回数据 API 市场</a><div class="api-detail-badges"><span>${product.group}</span><span>${product.status}</span><span>${product.domain}</span></div><h1>${product.name}</h1><p>${product.desc} 返回统一数据状态、来源更新时间、追踪编号和计费结果，便于业务系统稳定接入。</p><dl><div><dt>API Code</dt><dd>${product.code}</dd></div><div><dt>请求方式</dt><dd>${method}</dd></div><div><dt>接口地址</dt><dd>http://127.0.0.1:4190${endpoint}</dd></div></dl></div><aside><button data-action="api-free-trial">${icon("spark",16)} 免费试用</button><button class="primary" data-action="api-buy" data-api="${product.code}">${icon("database",16)} 立即购买</button><button data-action="jump-section" data-section="api-request">${icon("report",16)} 查看文档</button><button data-action="api-favorite">♡ 收藏 API</button></aside></section><div class="api-detail-layout-v3"><nav class="api-detail-anchor"><strong>接口文档</strong>${nav.map(([id,label],index)=>`<button data-action="jump-section" data-section="${id}"><span>0${index+1}</span>${label}</button>`).join("")}</nav><article class="api-detail-content-v3"><section id="api-overview" class="api-doc-section-v3"><header><span>OVERVIEW</span><h2>概览</h2></header><div class="api-value-grid-v3">${[["API 解决什么问题",`将“${product.domain}”能力标准化为可调用接口`],["适用场景",isSearch?"主体搜索 / 客户录入 / 名单清洗":"供应商调查 / 风险审核 / 企业画像"],["适用对象","开发团队、风控团队、采购系统与研究平台"],["商业价值",`每次成功调用 ${product.points} 点，失败与系统异常不扣点`]].map(([title,text])=>`<article>${icon("check",18)}<h3>${title}</h3><p>${text}</p></article>`).join("")}</div></section><section id="api-intro" class="api-doc-section-v3"><header><span>ENDPOINT</span><h2>接口说明</h2></header><div class="api-intro-panel-v3"><dl><div><dt>接口定位</dt><dd>${product.desc}</dd></div><div><dt>认证方式</dt><dd>HTTPS 请求头 X-API-Key；生产环境支持独立环境密钥、额度、IP 白名单、轮换与审计。</dd></div><div><dt>返回格式</dt><dd>JSON；所有响应保留 requestId、traceId、dataState 与 provider。</dd></div><div><dt>兼容能力</dt><dd>${product.compatibility.join("、")}</dd></div></dl><button data-action="api-debug" data-api="${product.code}">${icon("spark",16)} 在线调试模拟返回</button></div></section><section id="api-request" class="api-doc-section-v3"><header><span>REQUEST</span><h2>请求参数</h2></header><div class="api-doc-table-v3"><div class="head"><span>参数名</span><span>类型</span><span>必填</span><span>说明</span><span>示例</span></div>${requestRows.map((row)=>`<div>${row.map((cell,index)=>index===0?`<code>${cell}</code>`:`<span>${cell}</span>`).join("")}</div>`).join("")}</div></section><section id="api-response" class="api-doc-section-v3"><header><span>RESPONSE</span><h2>返回结果</h2></header><div class="api-response-v3"><div><span><i></i><i></i><i></i></span><b>200 · application/json</b></div><pre><code>${JSON.stringify(responseExample,null,2)}</code></pre></div></section><section id="api-fields" class="api-doc-section-v3"><header><span>FIELDS</span><h2>字段解释</h2></header><div class="api-doc-table-v3 fields"><div class="head"><span>字段路径</span><span>类型</span><span>说明</span></div>${responseRows.map((row)=>`<div><code>${row[0]}</code><span>${row[1]}</span><span>${row[2]}</span></div>`).join("")}</div></section><section id="api-examples" class="api-doc-section-v3"><header><span>EXAMPLES</span><h2>调用示例</h2></header><div class="api-code-examples-v3"><article><strong>cURL</strong><pre><code>curl --request ${method} &#10;  --url 'http://127.0.0.1:4190${endpoint}' &#10;  --header 'X-API-Key: sqj_test_2026_demo_key'${curlPayload}</code></pre></article><article><strong>JavaScript</strong><pre><code>const response = await fetch(&#10;  'http://127.0.0.1:4190${endpoint}',&#10;  { method: '${method}', headers: {&#10;    'X-API-Key': 'sqj_test_2026_demo_key'&#10;  }}&#10;);&#10;const payload = await response.json();</code></pre></article></div></section><section id="api-pricing" class="api-doc-section-v3"><header><span>BILLING</span><h2>计费说明</h2></header><div class="api-pricing-grid-v3"><article><span>单次成功调用</span><strong>${product.points} 点</strong><p>仅有效业务结果按规则扣点。</p></article><article><span>试用额度</span><strong>200 点</strong><p>注册用户可领取一次，用于沙箱联调。</p></article><article><span>异常请求</span><strong>0 点</strong><p>PROVIDER_ERROR 与 SYSTEM_ERROR 不扣点。</p></article></div><button class="api-detail-buy" data-action="api-buy" data-api="${product.code}">购买点数并使用 ${icon("arrow",16)}</button></section><section id="api-related" class="api-doc-section-v3"><header><span>RELATED</span><h2>相关 API</h2></header><div class="api-related-grid-v3">${related.map((item)=>`<button data-action="api-detail" data-api="${item.code}"><span>${item.domain}</span><strong>${item.name}</strong><code>${item.code}</code><small>${item.points} 点 / 次 ${icon("arrow",14)}</small></button>`).join("")}</div></section></article></div>${renderApiPurchasePanel()}`, "api-detail");
}

function apiParamExample(name, type) {
  if (name === "eid") return "EID-HK-0001";
  if (name === "pid") return "PID-DEMO-0001";
  if (name === "companyName" || name === "name") return "ACME Corporation";
  if (name === "personName") return "Alex Chen";
  if (name === "countryIso2") return "US";
  if (name === "registrationNumber") return "123456789";
  if (name === "website") return "https://example.com";
  if (name.toLowerCase().includes("datefrom")) return "2024-01-01";
  if (name.toLowerCase().includes("dateto")) return "2026-08-16";
  if (type.includes("boolean")) return true;
  if (type.includes("integer")) return name === "limit" ? 20 : 3;
  if (type.includes("Array")) return [];
  return "demo";
}

function renderApiDetail() {
  const code = route().params.get("code") || apiProducts[0].code;
  const product = apiProducts.find((item)=>item.code === code) || apiProducts[0];
  const requestExample = Object.fromEntries(product.request.filter((row)=>row[4] !== "query").map((row)=>[row[0], apiParamExample(row[0], row[1])]));
  const queryString = product.request.filter((row)=>row[4] === "query").map((row)=>`${encodeURIComponent(row[0])}=${encodeURIComponent(String(apiParamExample(row[0], row[1])))}`).join("&");
  const requestRows = product.request.map(([name,type,required,description,position])=>[name,type,required,position||"body",description==="-"?`全球查接口参数 · 示例 ${String(apiParamExample(name,type))}`:description]);
  const responseRows = [
    ["code","integer(int32)","返回标记：鉴权未通过=1，成功=200，数据不存在=201，系统异常=500，上游异常=501，未适配=999"],
    ["errorCode","integer(int32)","错误码"],
    ["msg","string","返回信息"],
    ["isCost","string","是否计费：计费=1；不计费=0"],
    ["requestId","string","请求 ID，用于问题追踪"],
    ["data","object","返回数据"],
    ["data.code","integer(int32)","业务返回码"],
    ["data.message","string","业务返回信息"],
    ["data.data","object",`${product.name}业务数据，完整契约共 ${product.responseCount} 个字段`],
    ...product.tags.slice(0,5).map((tag,index)=>[`data.data.${tag}`,index===0?"object":"array / string",`${tag}相关返回字段，名称与层级以全球查正式契约为准`]),
  ];
  const responseExample = { code:200, errorCode:0, msg:"success", isCost:product.price===0?"0":"1", requestId:"GC-DEMO-20260816-0001", data:{ code:200, message:"success", data:{ eid:"EID-HK-0001", operationId:product.code, fields:product.tags, demo:true } } };
  const related = apiProducts.filter((item)=>item.group === product.group && item.code !== product.code).slice(0,3);
  const nav = [["api-overview","概览"],["api-intro","接口说明"],["api-request","请求参数"],["api-response","返回结果"],["api-fields","字段解释"],["api-examples","调用示例"],["api-pricing","计费说明"],["api-related","相关 API"]];
  const requestUrl = `https://api.globalcheck.com${product.endpoint}${queryString?`?${queryString}`:""}`;
  const curlBody = product.method === "POST" ? ` &#10;  --header 'Content-Type: application/json' &#10;  --data '${JSON.stringify(requestExample)}'` : "";
  return apiShell(`<section class="api-detail-hero-v3"><div><a href="#/api-market">← 返回数据 API 市场</a><div class="api-detail-badges"><span>GC API ${String(product.serial).padStart(2,"0")}</span><span>${product.status}</span><span>${product.group}</span></div><h1>${product.name}</h1><p>${product.desc}</p><dl><div><dt>OperationId</dt><dd>${product.code}</dd></div><div><dt>请求方式</dt><dd>${product.method}</dd></div><div><dt>接口地址</dt><dd>https://api.globalcheck.com${product.endpoint}</dd></div></dl></div><aside><button data-action="api-free-trial">${icon("spark",16)} 免费试用</button><button class="primary" data-action="api-buy" data-api="${product.code}">${icon("database",16)} ${product.price===0?"免费开通":"立即购买"}</button><button data-action="jump-section" data-section="api-request">${icon("report",16)} 查看文档</button><button data-action="api-favorite">♡ 收藏 API</button></aside></section><div class="api-detail-layout-v3"><nav class="api-detail-anchor"><strong>接口文档</strong>${nav.map(([id,label],index)=>`<button data-action="jump-section" data-section="${id}"><span>0${index+1}</span>${label}</button>`).join("")}</nav><article class="api-detail-content-v3"><section id="api-overview" class="api-doc-section-v3"><header><span>OVERVIEW</span><h2>概览</h2></header><div class="api-value-grid-v3">${[["API 解决什么问题",product.desc],["适用场景",product.tags.join(" / ")],["接口归属",product.group],["商业价值",product.price===0?"全球查同源免费接口":`成功调用 ¥${product.price} 元/次`]].map(([title,text])=>`<article>${icon("check",18)}<h3>${title}</h3><p>${text}</p></article>`).join("")}</div></section><section id="api-intro" class="api-doc-section-v3"><header><span>ENDPOINT</span><h2>接口说明</h2></header><div class="api-intro-panel-v3"><dl><div><dt>接口定位</dt><dd>${product.desc}</dd></div><div><dt>认证方式</dt><dd>HTTPS 请求头 X-API-Key，支持 IP 白名单与企业级额度控制。</dd></div><div><dt>返回格式</dt><dd>JSON；通用响应包含 code、errorCode、msg、isCost、requestId 与 data。</dd></div><div><dt>同源说明</dt><dd>商情局直接使用全球查同一 OperationId、请求路径、参数和返回契约。</dd></div></dl><button data-action="api-debug" data-api="${product.code}">${icon("spark",16)} 在线调试模拟返回</button></div></section><section id="api-request" class="api-doc-section-v3"><header><span>REQUEST</span><h2>请求参数</h2></header><div class="api-doc-table-v3"><div class="head"><span>参数名</span><span>类型</span><span>必填</span><span>位置</span><span>说明 / 示例</span></div>${requestRows.map((row)=>`<div>${row.map((cell,index)=>index===0?`<code>${cell}</code>`:`<span>${String(cell).replaceAll("<","&lt;").replaceAll(">","&gt;")}</span>`).join("")}</div>`).join("")}</div></section><section id="api-response" class="api-doc-section-v3"><header><span>RESPONSE</span><h2>返回结果</h2></header><div class="api-response-v3"><div><span><i></i><i></i><i></i></span><b>HTTP 200 · application/json · ${product.responseCount} 个契约字段</b></div><pre><code>${JSON.stringify(responseExample,null,2)}</code></pre></div></section><section id="api-fields" class="api-doc-section-v3"><header><span>FIELDS</span><h2>字段解释</h2><small>原接口文档记录 ${product.responseCount} 个返回字段；原型展示公共字段与主要业务字段。</small></header><div class="api-doc-table-v3 fields"><div class="head"><span>字段路径</span><span>类型</span><span>说明</span></div>${responseRows.map((row)=>`<div><code>${row[0]}</code><span>${row[1].replaceAll("<","&lt;").replaceAll(">","&gt;")}</span><span>${row[2]}</span></div>`).join("")}</div></section><section id="api-examples" class="api-doc-section-v3"><header><span>EXAMPLES</span><h2>调用示例</h2></header><div class="api-code-examples-v3"><article><strong>cURL</strong><pre><code>curl --request ${product.method} &#10;  --url '${requestUrl}' &#10;  --header 'X-API-Key: YOUR_API_KEY'${curlBody}</code></pre></article><article><strong>JavaScript</strong><pre><code>const response = await fetch(&#10;  '${requestUrl}',&#10;  { method: '${product.method}', headers: {&#10;    'X-API-Key': 'YOUR_API_KEY'&#10;  }${product.method==="POST"?`, body: JSON.stringify(${JSON.stringify(requestExample)})`:""} }&#10;);&#10;const payload = await response.json();</code></pre></article></div></section><section id="api-pricing" class="api-doc-section-v3"><header><span>BILLING</span><h2>计费说明</h2></header><div class="api-pricing-grid-v3"><article><span>全球查接口原价</span><strong>${product.price===0?"免费":`¥${product.price} / 次`}</strong><p>商情局保持同一接口单价。</p></article><article><span>成功响应</span><strong>${product.price===0?"0 元":`扣 ¥${product.price}`}</strong><p>按全球查 isCost 计费标记执行。</p></article><article><span>异常请求</span><strong>不计费</strong><p>isCost=0 时不扣减 API 余额。</p></article></div><button class="api-detail-buy" data-action="api-buy" data-api="${product.code}">${product.price===0?"免费开通接口":"充值余额并使用"} ${icon("arrow",16)}</button></section><section id="api-related" class="api-doc-section-v3"><header><span>RELATED</span><h2>相关 API</h2></header><div class="api-related-grid-v3">${related.map((item)=>`<button data-action="api-detail" data-api="${item.code}"><span>${item.group}</span><strong>${item.name}</strong><code>${item.code}</code><small>${item.price===0?"免费":`¥${item.price} / 次`} ${icon("arrow",14)}</small></button>`).join("")}</div></section></article></div>${renderApiPurchasePanel()}`, "api-detail");
}

function renderApiConsole() {
  const logs = [
    ["10:31:24", "companiesProfile", "US", "AVAILABLE", "200", "¥29.00"],
    ["10:28:09", "companiesSanctionsDetail", "SG", "NO_RECORD", "200", "¥52.00"],
    ["10:17:42", "companiesSearchResolve", "GB", "AMBIGUOUS", "200", "¥3.00"],
    ["09:55:03", "companiesOwnershipStructure", "DE", "PROVIDER_ERROR", "503", "¥0.00"],
  ];
  return apiShell(`<div class="console-layout"><aside class="console-sidebar"><div class="console-app"><span>测试应用</span><strong>全能力测试应用</strong><small>app_sqj_demo_01</small></div><nav><button class="active">${icon("database",17)} 概览</button><button>${icon("api",17)} 应用与密钥</button><button>${icon("clock",17)} 调用日志</button><button>${icon("report",17)} 用量与账单</button><button>${icon("alert",17)} 告警设置</button></nav><div class="console-help">${icon("shield",20)}<strong>密钥安全</strong><small>密钥明文只在创建时显示一次。原型不展示真实密钥。</small></div></aside><section class="console-main"><div class="console-title"><div><span class="kicker">DEVELOPER CONSOLE</span><h1>下午好，Demo Studio</h1><p>测试环境 · 最近 24 小时调用概览</p></div><button class="button primary" data-action="fake-key">创建测试密钥</button></div><div class="metric-grid"><article><span>剩余测试额度</span><strong>8,420</strong><small>点 · 2026-09-15 到期</small></article><article><span>今日调用</span><strong>1,580</strong><small class="up">↑ 12.4% 演示数据</small></article><article><span>成功率</span><strong>98.7%</strong><small>不含 AMBIGUOUS</small></article><article><span>P95 延迟</span><strong>1.84s</strong><small>测试环境</small></article></div><div class="console-grid"><article class="usage-chart"><div class="panel-title"><div><strong>近 7 日调用趋势</strong><span>按成功响应计</span></div><button>全部 API⌄</button></div><div class="bar-chart">${[42,61,52,78,68,86,72].map((v,i)=>`<div><i style="height:${v}%"></i><span>${["一","二","三","四","五","六","日"][i]}</span></div>`).join("")}</div></article><article class="quota-card"><div class="panel-title"><div><strong>额度分配</strong><span>测试应用</span></div></div><div class="quota-donut"><div><strong>15.8%</strong><span>已使用</span></div></div><dl><div><dt>A01 主体识别</dt><dd>820</dd></div><div><dt>A02 企业数据</dt><dd>760</dd></div><div><dt>A03 报告任务</dt><dd>未开通</dd></div></dl></article></div><article class="log-panel"><div class="panel-title"><div><strong>最近调用</strong><span>金额与状态均为演示</span></div><button>查看全部日志</button></div><div class="data-table"><div class="table-row table-head"><span>时间</span><span>API</span><span>国家</span><span>数据状态</span><span>HTTP</span><span>计费</span></div>${logs.map(r=>`<div class="table-row"><span>${r[0]}</span><code>${r[1]}</code><span>${r[2]}</span><span class="state-text state-${r[3].toLowerCase()}">${r[3]}</span><span>${r[4]}</span><strong>${r[5]}</strong></div>`).join("")}</div></article></section></div>`, "api-console");
}

function adminNavigation(active) {
  const groups = [
    ["工作台",[["admin","运营总览","database"]]],
    ["数据运营",[["admin-providers","企业数据源","api"],["admin-coverage","覆盖与质量","globe"]]],
    ["内容运营",[["admin-insights","资讯审核与发布","spark"],["admin-sources","资讯来源","globe"]]],
    ["商品与交付",[["admin-products","报告产品","report"],["admin-tasks","报告任务","clock"]]],
    ["API 运营",[["admin-api-customers","API 产品与客户","api"],["admin-api-usage","调用与计费","shield"]]],
    ["客户与交易",[["admin-users","客户使用情况","user"],["admin-orders","订单与退款","report"],["admin-wallet","余额与充值","database"],["admin-invoices","发票管理","report"]]],
    ["系统设置",[["admin-models","AI 与 Agent","settings"],["admin-audit","操作日志","shield"]]],
  ];
  return `<nav class="admin-side-nav">${groups.map(([group,items])=>`<small>${group}</small>${items.map(([target,label,iconName])=>`<button class="${active===target?"active":""}" data-action="go" data-target="${target}">${icon(iconName,17)}${label}${["admin-orders","admin-tasks","admin-api-customers"].includes(target)?'<span class="nav-dot"></span>':''}</button>`).join("")}`).join("")}</nav>`;
}

const adminSubtabDefinitions = {
  admin:[["overview","运营总览"],["todo","待办中心"],["monitor","服务监控"]],
  "admin-analytics":[["overview","核心指标"],["search","搜索分析"],["conversion","转化漏斗"],["revenue","收入分析"],["cost","成本分析"],["reports","报告分析"],["ai","AI 分析"],["api","API 分析"]],
  "admin-insights":[["overview","审核队列"],["collection","采集批次"],["schedule","待发布"],["archive","已发布"]],
  "admin-sources":[["overview","资讯来源"],["routes","采集规则"],["health","来源健康"]],
  "admin-models":[["overview","模型与路由"],["prompts","提示规则"],["quota","额度策略"],["logs","调用日志"]],
  "admin-coverage":[["overview","国家覆盖"],["fields","字段覆盖"],["freshness","更新时间"],["restrictions","异常记录"]],
  "admin-products":[["overview","报告商品"],["fields","字段与章节"],["chapters","价格与折扣"],["versions","版本发布"]],
  "admin-pricing":[["overview","价格版本"],["reports","报告价格"],["bundles","组合价格"],["api","API 单价"],["packages","套餐"],["promotions","活动优惠"]],
  "admin-providers":[["overview","供应商"],["mapping","接口映射"],["cost","数据质量"],["retry","同步记录"]],
  "admin-users":[["overview","客户总览"],["identity","活跃与留存"],["permissions","报告权限"],["balance","API 使用"],["risk","账户状态"]],
  "admin-orders":[["overview","全部订单"],["payments","支付记录"],["refunds","退款处理"],["exceptions","异常订单"]],
  "admin-wallet":[["overview","余额总览"],["recharges","充值订单"],["ledger","余额流水"]],
  "admin-invoices":[["overview","开票申请"],["profiles","发票资料"],["merge","合并开票"],["issued","已开发票"]],
  "admin-tasks":[["overview","任务队列"],["failures","异常处理"],["versions","交付记录"]],
  "admin-files":[["overview","文件清单"],["parsing","解析任务"],["retention","保存期限"],["exceptions","异常处理"],["deletion","删除记录"]],
  "admin-api-customers":[["overview","API 定价"],["quota","客户与应用"],["billing","余额预警"]],
  "admin-api-usage":[["overview","调用记录"],["billing","计费流水"],["errors","异常请求"]],
  "admin-audit":[["overview","日志总览"],["pricing","价格与规则变更"],["refunds","资金与余额"],["data","数据与内容"]],
};

function adminSubnav(active) {
  const tabs = adminSubtabDefinitions[active] || [["overview","工作台"]];
  const current = state.adminSubtabByRoute[active] || "overview";
  return `<div class="admin-module-nav"><div>${tabs.map(([code,label])=>`<button class="${current===code?"active":""}" data-action="admin-subtab" data-tab="${code}">${label}</button>`).join("")}</div><span>${tabs.length} 项核心工作</span></div>`;
}

function renderAdminDrawer() {
  if (!state.adminDrawer) return "";
  return `<div class="admin-drawer-mask" data-action="close-admin-drawer"></div><aside class="admin-action-drawer"><header><div><span>OPERATION WORKSPACE</span><h2>${state.adminDrawer.title}</h2><p>${state.adminDrawer.message}</p></div><button data-action="close-admin-drawer">×</button></header><div class="admin-drawer-status"><span>${icon("check",17)}</span><div><strong>操作对象已定位</strong><small>当前为可交互原型，保存后会生成演示审计记录。</small></div></div><form data-form="admin-drawer"><label><span>配置名称</span><input name="name" value="${state.adminDrawer.title}" /></label><label><span>生效范围</span><select name="scope"><option>仅当前对象</option><option>当前市场</option><option>全部渠道</option></select></label><label><span>生效时间</span><input name="effectiveAt" value="2026-08-16 18:00" /></label><label><span>负责人</span><input name="owner" value="OP-1001 王静" /></label><label class="wide"><span>变更说明</span><textarea name="note" rows="4" placeholder="填写原因、影响与回滚方式">原型演示配置，不写入生产环境。</textarea></label><footer><button type="button" data-action="close-admin-drawer">取消</button><button class="primary" type="submit">保存演示配置</button></footer></form></aside>`;
}

function renderAdminDeveloperToolSubpage(tab) {
  const meta = {
    keys:{kicker:"CREDENTIAL GOVERNANCE",title:"API Key 管理",desc:"管理密钥生命周期、权限范围、轮换策略和异常使用。",metrics:[["有效密钥","86","58 个活跃应用"],["本月轮换","12","全部完成审计"],["异常凭证","2","已自动停用"],["平均有效期","74 天","上限 90 天"]]},
    docs:{kicker:"DOCUMENTATION RELEASE",title:"API 文档发布",desc:"统一维护接口说明、示例代码、版本记录和公开范围。",metrics:[["公开接口","33","与全球查同源"],["文档版本","v1.8","昨日已发布"],["待复核变更","4","参数说明更新"],["示例语言","5","cURL / JS / Python 等"]]},
    cli:{kicker:"CLI DISTRIBUTION",title:"CLI 发布管理",desc:"管理安装包、命令映射、版本兼容和下载渠道。",metrics:[["当前版本","v1.6.2","Production"],["本月下载","1,842","较上月 +18%"],["命令映射","33","全部通过测试"],["待发布","v1.7.0","2 项变更"]]},
    mcp:{kicker:"MCP TOOL GOVERNANCE",title:"MCP 工具管理",desc:"配置工具开放范围、API 映射、参数 Schema、权限与计费。",metrics:[["已开放工具","33","映射全部 API"],["Agent 应用","18","近 7 日有调用"],["Schema 告警","1","待人工确认"],["今日调用","12,680","成功率 98.9%"]]},
  }[tab];
  const rows = Array.from({length:6},(_,index)=>[
    `${tab.toUpperCase()}-${String(index+1).padStart(3,"0")}`,
    tab==="keys"?["采购风控生产密钥","本地联调密钥","数据分析服务","MCP Agent Key","历史轮换密钥","异常停用凭证"][index]:tab==="docs"?["企业主体搜索","企业完整档案","制裁与 PEP 明细","自然人身份识别","统一响应规范","签名与鉴权"][index]:tab==="cli"?["company resolve","company profile","company sanctions","person resolve","reports access","config validate"][index]:["get_company_profile","get_company_sanctions","resolve_company","get_ownership_structure","resolve_person_identity","get_company_financials"][index],
    ["生产环境","测试环境","企业客户","Agent 渠道","公开平台","内部运营"][index],
    index===5?"已停用":index===4?"待发布":"已生效",
    ["刚刚","12 分钟前","今天 14:20","今天 11:08","昨天 18:40","2026-08-01"][index]
  ]);
  return `<section class="admin-developer-tool"><header><div><span>${meta.kicker}</span><h1>${meta.title}</h1><p>${meta.desc}</p></div><button data-action="admin-demo-action" data-message="新建${meta.title}配置">新建配置</button></header><section class="ops-metrics">${meta.metrics.map(([label,value,note])=>`<article><small>${label}</small><strong>${value}</strong><span>${note}</span></article>`).join("")}</section><section class="admin-tool-release"><article><span>当前发布通道</span><strong>Production · CN / Global</strong><small>所有变更需要双人复核后生效</small></article><article><span>最近一次审计</span><strong>2026-08-23 19:42</strong><small>OP-1001 王静 · 通过</small></article><button data-action="admin-demo-action" data-message="已打开版本发布与回滚记录">发布记录</button></section><section class="ops-table-card"><header><div><strong>${meta.title}清单</strong><span>配置、版本与审计状态统一管理</span></div><button data-action="admin-demo-action" data-message="导出${meta.title}清单">导出</button></header><div class="ops-table admin-dev-tools"><div class="head"><span>编号 / 名称</span><span>适用范围</span><span>状态</span><span>最近更新</span><span>负责人</span><span>操作</span></div>${rows.map((row,index)=>`<div><span><code>${row[0]}</code><b>${row[1]}</b></span><span>${row[2]}</span><em class="${row[3]==="已生效"?"ok":row[3]==="待发布"?"warn":"muted"}">${row[3]}</em><span>${row[4]}</span><span>${index%2?"李明":"王静"}</span><button data-action="admin-demo-action" data-message="查看 ${row[0]} 的配置、版本与审计记录">管理</button></div>`).join("")}</div></section></section>`;
}

function renderAdminSubpage(active, tab) {
  if (active === "admin-api-customers" && ["keys","docs","cli","mcp"].includes(tab)) return renderAdminDeveloperToolSubpage(tab);
  const tabLabel = (adminSubtabDefinitions[active] || []).find(([code])=>code===tab)?.[1] || "配置";
  const routeTitle = {admin:"平台运营总览","admin-analytics":"运营分析","admin-insights":"资讯审核与发布","admin-sources":"资讯来源","admin-models":"AI 与 Agent","admin-coverage":"覆盖与质量","admin-products":"报告产品","admin-pricing":"价格优惠","admin-providers":"企业数据源","admin-users":"客户使用情况","admin-orders":"订单与退款","admin-wallet":"余额与充值","admin-invoices":"发票管理","admin-tasks":"报告任务","admin-files":"用户文件","admin-api-customers":"API 产品与客户","admin-api-usage":"调用与计费","admin-audit":"操作日志"}[active] || "运营后台";
  const rows = Array.from({length:6},(_,index)=>[
    `${tab.toUpperCase()}-${String(index+1).padStart(3,"0")}`,
    [`${tabLabel}默认策略`,`生产环境配置`,`待复核记录`,`自动化规则`,`客户专属配置`,`历史版本 v${6-index}.0`][index],
    ["全部渠道","Web / 小程序","全球数据库","国内数据库","API 开放平台","历史归档"][index],
    ["已生效","运行中","待处理","已生效","草稿","已归档"][index],
    ["刚刚","3 分钟前","今天 14:20","今天 10:08","昨天 18:40","2026-08-01"][index]
  ]);
  return `<section class="admin-subpage"><header><div><span>${routeTitle.toUpperCase()} · ${tab.toUpperCase()}</span><h1>${tabLabel}</h1><p>${routeTitle}下的${tabLabel}工作台，支持查询、创建、编辑、审批、停用和审计追踪。</p></div><button data-action="admin-demo-action" data-message="新建${tabLabel}配置">新建${tabLabel}</button></header><section class="admin-config-metrics ops-metrics"><article><small>记录总数</small><strong>${128 + tab.length * 7}</strong><span>含历史版本</span></article><article><small>当前生效</small><strong>${24 + tab.length}</strong><span>生产与测试环境</span></article><article><small>待处理</small><strong>${tab.length % 5 + 2}</strong><span>需要运营确认</span></article><article><small>今日变更</small><strong>${tab.length % 7 + 4}</strong><span>全部写入审计日志</span></article></section><div class="admin-subpage-toolbar"><label>${icon("search",16)}<input placeholder="搜索编号、名称或负责人" /></label><button>全部状态</button><button>全部渠道</button><button data-action="admin-demo-action" data-message="正在导出${tabLabel}清单">导出</button></div><section class="admin-subpage-table"><div class="head"><span>编号 / 名称</span><span>适用范围</span><span>状态</span><span>最近更新</span><span>负责人</span><span>操作</span></div>${rows.map((row,index)=>`<div><span><code>${row[0]}</code><strong>${row[1]}</strong></span><span>${row[2]}</span><em class="${row[3]==="已生效"?"ok":row[3]==="待处理"?"warn":row[3]==="草稿"?"info":"muted"}">${row[3]}</em><span>${row[4]}</span><span>${index%2?"李明":"王静"}</span><button data-action="admin-demo-action" data-message="编辑 ${row[0]} · ${row[1]}">查看 / 编辑</button></div>`).join("")}</section></section>`;
}

function renderAdminWorkflowSubpage(active, tab) {
  const workflow = {
    "admin": {
      todo:["待办中心","集中处理今天必须由运营人员确认的审核、异常、退款、开票和余额预警。",["待办事项","业务模块","优先级","截止时间","处理状态","操作"],[
        ["6 篇资讯等待逐篇审核","资讯审核与发布","高","今天 18:00","待处理","进入审核队列"],
        ["2 个报告任务执行异常","报告任务","高","立即","处理中","查看失败步骤"],
        ["3 个 API 客户余额预警","API 产品与客户","中","今天 20:00","待通知","查看客户"],
        ["1 个专票申请待复核","发票与开票","中","明天 12:00","待审核","核对开票资料"]]],
      monitor:["服务监控","观察前台检索、报告生成、API 调用、资讯采集与支付示例服务的实时健康状态。",["服务 / 环境","最近检查","成功率","P95 延迟","当前状态","操作"],[
        ["企业检索 / 全球库","刚刚","99.6%","186ms","正常","查看调用"],
        ["企业检索 / 国内库","刚刚","99.8%","142ms","正常","查看调用"],
        ["报告生成队列","1 分钟前","98.4%","4m 18s","需关注","查看异常任务"],
        ["资讯采集 Agent","8 分钟前","100%","38s","正常","查看采集批次"],
        ["微信 / 支付宝 / 开票上游","演示环境","—","—","Mock 示例","查看接入说明"]]]
    },
    "admin-coverage": {
      fields:["字段覆盖","按国家、数据库和业务模块检查核心字段是否达到前台可售门槛。",["市场 / 数据库","业务模块","核心字段","覆盖率","前台状态","操作"],[
        ["中国大陆 / 国内库","M01 基础信息","18 / 18","100%","可售","查看缺失规则"],
        ["美国 / 全球库","M03 股权结构","22 / 24","92%","可售并披露","查看缺失字段"],
        ["德国 / 全球库","M08 风险合规","19 / 31","61%","暂不可售","补充数据源"]]],
      freshness:["更新时间","维护各市场和模块的数据更新频率、最近同步时间与超期告警。",["数据集","适用市场","更新策略","最近更新","SLA","操作"],[
        ["工商基础信息","全球 / 国内","T+1","今天 06:20","正常","调整策略"],
        ["司法与处罚","中国大陆","T+1","今天 05:40","正常","查看记录"],
        ["财务年报","美国 / 德国","公告触发","2 天前","接近超期","立即同步"]]],
      restrictions:["覆盖异常","只展示字段缺失、更新时间超期或国家路由错误等需要人工处理的问题。",["异常编号","市场 / 模块","异常类型","影响范围","状态","操作"],[
        ["COV-ERR-0182","德国 / M08","核心字段不足","报告与 API","待处理","查看原因"],
        ["COV-ERR-0179","英国 / M06","更新时间超期","报告","同步中","查看进度"],
        ["COV-ERR-0168","新加坡 / M03","备用路由失败","API","已恢复","查看记录"]]]
    },
    "admin-sources": {
      routes:["采集规则","配置每个资讯栏目的采集频率、关键词、去重、权威性门槛与人工审核要求。",["规则 / 栏目","来源范围","采集频率","筛选条件","发布方式","操作"],[
        ["RULE-COMMODITY / 大宗数据","生意社 / 交易所","每 30 分钟","价格异动 + 成交量","人工审核","编辑规则"],
        ["RULE-INVEST / 投资日报","投中网 / 公司公告","每天 07:30","融资金额 + 官方披露","人工审核","编辑规则"],
        ["RULE-MARKET / 金融市场","金十 / 华尔街见闻","每 15 分钟","重大政策与市场异动","人工审核","编辑规则"]]],
      health:["来源健康","监控来源连通性、最近采集、有效线索率和原文可追溯性。",["资讯来源","最近采集","连通状态","有效线索率","原文可追溯","操作"],[
        ["生意社","2 分钟前","正常","72%","100%","查看采集"],
        ["投中网","18 分钟前","正常","64%","100%","查看采集"],
        ["雪球","1 小时前","受限","31%","82%","调整频率"]]]
    },
    "admin-insights": {
      collection:["采集批次","查看 Agent 每日抓取、去重、来源核验和生成草稿的完整批次。",["批次 / 时间","采集线索","去重后","生成草稿","状态","操作"],[
        ["BATCH-20260824","今日 07:30","48 条","31 条","10 篇","待审核"],
        ["BATCH-20260823","昨日 07:30","52 条","34 条","10 篇","已完成"],
        ["BATCH-20260822","08-22 07:30","46 条","29 条","8 篇","已完成"]]],
      schedule:["待发布文章","审核通过的文章进入这里，可调整栏目、发布时间或撤回。",["文章","栏目","审核人","发布时间","状态","操作"],[
        ["新能源产业链的订单变化","投资日报","王静","今天 18:30","待发布"],
        ["铜价与制造业补库信号","大宗数据","李明","今天 20:00","待发布"]]],
      archive:["已发布内容","查看发布结果、阅读数据、来源版本与撤回记录。",["文章","栏目","发布时间","阅读","来源状态","操作"],[
        ["一级市场本周融资观察","投资日报","昨天 08:30","12,860","可追溯","查看"],
        ["上市公司现金流观察","上市企业","08-22 09:00","9,420","可追溯","查看"]]]
    },
    "admin-providers": {
      mapping:["接口映射","核对 33 个前端能力与上游 OperationId、字段和数据库路由。",["商情局能力","上游接口","数据库","字段映射","状态","操作"],[
        ["企业搜索识别","companiesSearchResolve","全球 / 国内","22 字段","已映射"],
        ["企业基础档案","companiesProfile","全球 / 国内","82 字段","已映射"],
        ["股权结构查询","companiesOwnershipStructure","全球","56 字段","待正式凭证"]]],
      cost:["数据质量","按供应商、国家和字段观察成功率、完整度与更新时间。",["检查项","范围","成功率","完整度","更新时间","状态"],[
        ["主体搜索","全球数据库","99.4%","96%","实时","正常"],
        ["工商基础信息","国内数据库","99.8%","98%","T+1","正常"],
        ["司法风险","海外市场","96.1%","82%","T+3","需关注"]]],
      retry:["同步记录","查看抓取、同步、重试和上游异常，不在这里修改产品价格。",["时间","任务","供应商","结果","耗时","操作"],[
        ["13:42","GLOBAL-SYNC-1821","全球查 Mock","成功","118ms","详情"],
        ["13:40","CN-SYNC-1818","全球查 Mock","成功","96ms","详情"],
        ["12:58","RISK-SYNC-1809","全球查 Mock","重试成功","1.8s","详情"]]]
    },
    "admin-products": {
      fields:["字段与章节","维护每个报告商品包含的字段、章节、数据来源和空值披露。",["报告模块","章节","字段数","来源","缺失处理","操作"],[
        ["M01 基础信息","企业身份与注册","18","工商 / 企业档案","展示未覆盖","编辑"],
        ["M03 股权结构","股东与控制权","24","股权接口","分层披露","编辑"],
        ["M08 风险合规","司法与制裁","31","司法 / 制裁接口","标记 NO_RECORD","编辑"]]],
      chapters:["价格与折扣","设置报告原价、折扣百分比和最终售价；前台只展示当前生效价格。",["报告商品","原价","折扣","折后价","状态","操作"],state.adminReportPrices.map(p=>[`${p.id} ${p.name}`,money(p.list),`${p.discount}%`,money(p.list*p.discount/100),p.enabled?"在售":"停用",`price:report:${p.id}`])],
      versions:["版本发布","价格、字段和章节变更先进入草稿，审核后统一发布。",["版本","变更内容","创建人","发布时间","状态","操作"],[
        ["REPORT-v1.7","价格与章节调整","王静","待定","草稿","继续编辑"],
        ["REPORT-v1.6","当前前台版本","王静","08-16 18:00","已发布","查看"],
        ["REPORT-v1.5","历史版本","李明","08-01 18:00","已归档","查看"]]]
    },
    "admin-tasks": {
      failures:["异常处理","仅展示需要人工介入的失败或部分完成任务，可查看原因后重试。",["任务","企业 / 模块","异常原因","已重试","状态","操作"],[
        ["SQJ-TASK-00821","Atlas Medical / M06","财务数据部分缺失","0 次","PARTIAL","task:SQJ-TASK-00821"],
        ["SQJ-TASK-00818","Nexa Trading / M08","上游超时","2 次","PROVIDER_ERROR","task:SQJ-TASK-00818"]]],
      versions:["交付记录","查看已购买报告的生成版本、交付时间和下载状态。",["报告 / 客户","企业","购买模块","交付时间","状态","操作"],[
        ["RPT-20260824-0182","Northstar Components","M01 / M03 / M08","13:42","已交付","查看"],
        ["RPT-20260824-0179","上海青岚科技","M01 / M06","12:18","已交付","查看"]]]
    },
    "admin-api-customers": {
      quota:["客户应用","客户充值后默认调用全部接口；这里管理应用、Key 状态和余额。",["客户","应用","API Key","余额","今日调用","操作"],[
        ["Demo Studio","全能力测试应用","2 个有效","¥13,420","1,580","客户详情"],
        ["远航供应链","供应商准入系统","1 个有效","¥48,600","8,420","客户详情"],
        ["星图投资","投前筛查平台","1 个有效","¥218","4,106","客户详情"]]],
      billing:["余额预警","余额不足时停止调用；可查看充值、扣费和提醒记录。",["客户","当前余额","预警线","最近充值","状态","操作"],[
        ["星图投资","¥218","¥500","08-16 ¥5,000","需提醒","查看流水"],
        ["启明数据","¥0","¥500","无","已停用","查看流水"],
        ["远航供应链","¥486","¥1,000","08-20 ¥20,000","需提醒","查看流水"]]]
    },
    "admin-api-usage": {
      billing:["计费流水","每笔成功调用按折后价扣减人民币余额，异常请求不扣费。",["流水","客户","接口","原价","实扣","余额"],[
        ["BILL-884201","Demo Studio","企业搜索识别","¥0.10","¥0.10","¥13,420.20"],
        ["BILL-884198","远航供应链","企业基础档案","¥0.30","¥0.27","¥48,600.18"],
        ["BILL-884192","Atlas Risk","制裁与 PEP 明细","¥1.20","¥0.00","¥8,420.00"]]],
      errors:["异常请求","定位上游错误、鉴权失败和余额不足；系统异常不产生扣费。",["请求 ID","客户 / 渠道","接口","错误","扣费","操作"],[
        ["req_8a21f","Atlas Risk / CLI","制裁与 PEP 明细","PROVIDER_ERROR","¥0.00","追踪"],
        ["req_7b18d","启明数据 / API","企业基础档案","INSUFFICIENT_BALANCE","¥0.00","追踪"]]]
    },
    "admin-users": {
      identity:["活跃与留存","观察 Web、小程序和 API 客户的活跃、留存及最近登录，不在这里修改交易数据。",["客户 / 渠道","注册时间","最近活跃","近 30 日访问","留存阶段","操作"],[
        ["138****8888 / Web","08-01","今天 14:32","28 天","高活跃","查看轨迹"],
        ["远航供应链 / API","07-18","今天 13:41","30 天","稳定调用","查看轨迹"],
        ["星图投资 / 小程序","08-12","昨天 20:16","9 天","新客培育","查看轨迹"]]],
      permissions:["报告权限","查看客户已购买的报告模块、访问期限和交付状态；报告不支持外链分享。",["客户 / 报告","企业主体","已购模块","支付状态","访问期限","操作"],[
        ["138****8888 / RPT-0182","Northstar Components","基础 / 股权 / 风险","已支付","长期有效","查看权限"],
        ["星图投资 / RPT-0179","Atlas Medical","基础 / 财务","已支付","长期有效","查看权限"],
        ["远航供应链 / RPT-0164","上海青岚科技","全量模块","已退款","已关闭","查看记录"]]],
      balance:["客户 API 使用","按客户查看应用、人民币余额、调用量和最近扣费；充值后默认开放全部接口。",["客户 / 应用","有效 Key","人民币余额","今日调用","最近扣费","操作"],[
        ["Demo Studio / 全能力测试应用","2 个","¥13,420.20","1,580 次","14:31 · ¥0.10","查看应用"],
        ["远航供应链 / 准入系统","1 个","¥48,600.18","8,420 次","14:28 · ¥0.27","查看应用"],
        ["星图投资 / 投前筛查","1 个","¥218.00","4,106 次","14:19 · ¥1.20","余额处理"]]],
      risk:["账户状态","处理冻结、异常登录、余额不足和实名问题；每次状态变更都写入审计日志。",["客户","登录状态","交易状态","风险原因","当前处置","操作"],[
        ["138****8888","正常","正常","无","无需处理","账户详情"],
        ["启明数据","正常","余额不足","连续调用失败","API 已停用","解除 / 充值"],
        ["远航供应链","需验证","正常","异地登录","短信复核中","查看风险"]]]
    },
    "admin-orders": {
      payments:["支付记录","核对支付订单、渠道流水和回调结果；支付宝与微信暂标记为 Mock 示例。",["支付单 / 客户","业务订单","支付渠道","支付金额","回调状态","操作"],[
        ["PAY-8821 / 138****8888","ORD-RPT-0182","微信（示例）","¥299.00","已回调","查看凭证"],
        ["PAY-8819 / 星图投资","ORD-API-0178","支付宝（示例）","¥5,000.00","已回调","查看凭证"],
        ["PAY-8811 / 远航供应链","ORD-API-0165","账户余额","¥52.80","内部记账","查看流水"]]],
      refunds:["退款处理","审核退款原因和可退金额；通过后同步关闭报告权限或回补 API 余额。",["退款单 / 客户","原订单","申请金额","退款原因","处理状态","操作"],[
        ["REF-0824-018 / 远航供应链","ORD-RPT-0164","¥199.00","报告数据不完整","待审核","审核退款"],
        ["REF-0823-011 / 星图投资","ORD-API-0152","¥500.00","重复充值","处理中","查看进度"],
        ["REF-0822-006 / 138****8888","ORD-RPT-0141","¥99.00","主体选择错误","已拒绝","查看结论"]]],
      exceptions:["异常订单","集中处理金额不一致、支付无回调、交付失败和开票关联异常。",["异常单","订单类型","异常原因","发生时间","当前状态","操作"],[
        ["EX-20260824-21","报告订单","支付成功但报告未启动","14:06","待重试","重新交付"],
        ["EX-20260824-18","API 充值","渠道回调超时","13:42","核对中","查询渠道"],
        ["EX-20260823-09","发票订单","订单与抬头不一致","昨天 18:20","待确认","处理异常"]]]
    },
    "admin-wallet": {
      recharges:["充值订单","查看充值申请、支付渠道和到账结果；第三方支付渠道暂以 Mock 示例标识。",["充值单 / 客户","充值金额","支付渠道","渠道流水","到账状态","操作"],[
        ["RCG-0824-018 / 星图投资","¥5,000.00","支付宝（示例）","MOCK-ALI-8842","已到账","查看"],
        ["RCG-0824-016 / Demo Studio","¥2,000.00","微信（示例）","MOCK-WX-7718","待回调","核对回调"],
        ["RCG-0823-009 / 远航供应链","¥20,000.00","线下转账","BANK-20260823","已到账","查看"]]],
      ledger:["余额流水","逐笔追踪充值、API 扣费、退款回补和人工调账，所有金额统一使用人民币。",["流水号 / 客户","业务类型","收入","支出","变动后余额","关联单据"],[
        ["WLT-884201 / Demo Studio","API 调用","—","¥0.10","¥13,420.20","req_884201"],
        ["WLT-884198 / 远航供应链","API 调用","—","¥0.27","¥48,600.18","req_884198"],
        ["WLT-884182 / 星图投资","账户充值","¥5,000.00","—","¥5,218.00","RCG-0824-018"]]]
    },
    "admin-invoices": {
      profiles:["发票资料","管理普票与专票抬头；专票需核验地址、电话、开户行和账号。",["客户 / 抬头","发票类型","税号","专票资料","核验状态","操作"],[
        ["远航供应链 / 远航供应链有限公司","增值税专票","9134****8821","完整","已核验","查看资料"],
        ["星图投资 / 星图投资管理有限公司","增值税普票","9131****6218","不适用","已核验","查看资料"],
        ["Demo Studio / 合肥易尊数字科技有限公司","增值税专票","9134****1012","缺开户行","待补充","通知客户"]]],
      merge:["合并开票","将同一客户、同一抬头下的多笔可开票订单合并，并校验是否存在退款。",["申请单 / 客户","合并订单","可开金额","发票抬头","校验结果","操作"],[
        ["INV-M-0824-18 / 远航供应链","4 笔","¥12,680.00","远航供应链有限公司","通过","审核开票"],
        ["INV-M-0824-11 / 星图投资","3 笔","¥5,298.00","星图投资管理有限公司","通过","审核开票"],
        ["INV-M-0823-06 / Demo Studio","2 笔","¥398.00","合肥易尊数字科技有限公司","资料不全","退回补充"]]],
      issued:["已开发票","查看发票号码、金额、交付方式及红冲重开记录；开票接口暂为 Mock 示例。",["发票号码 / 客户","发票类型","含税金额","开票时间","交付状态","操作"],[
        ["MOCK-INV-0824-018 / 远航供应链","增值税专票","¥12,680.00","今天 13:20","已发送","查看 / 下载"],
        ["MOCK-INV-0823-011 / 星图投资","增值税普票","¥5,298.00","昨天 16:42","已发送","查看 / 下载"],
        ["MOCK-INV-0822-006 / Demo Studio","增值税专票","¥398.00","08-22 10:18","红冲处理中","查看记录"]]]
    },
    "admin-models": {
      prompts:["提示规则","按资讯成稿、报告解读和 AI 对话维护提示词版本，并在发布前完成测试。",["规则 / 场景","当前版本","默认模型","状态","最近测试","操作"],[
        ["PROMPT-INSIGHT / 资讯深度文章","v1.8","Qwen3 免费模型","已发布","事实引用通过","编辑 / 测试"],
        ["PROMPT-REPORT / 报告总结","v1.5","DeepSeek 免费模型","已发布","结构完整","编辑 / 测试"],
        ["PROMPT-CHAT / 企业问答","v1.2","Qwen3 免费模型","草稿","待测试","继续编辑"]]],
      quota:["额度策略","配置免费模型的用户额度、并发限制和失败回退；首期暂不区分操作员角色。",["策略 / 场景","每日额度","并发上限","失败回退","当前状态","操作"],[
        ["FREE-CHAT / AI 对话","20 次 / 用户","2","Qwen3 → DeepSeek","已生效","调整策略"],
        ["INSIGHT-AGENT / 资讯生成","50 篇 / 日","4","人工审核队列","已生效","调整策略"],
        ["REPORT-SUMMARY / 报告解读","购买后 10 次","2","规则摘要","已生效","调整策略"]]],
      logs:["模型调用日志","追踪模型、场景、Token、耗时和安全结果，定位生成失败或成本异常。",["调用 ID / 场景","模型","Token","耗时","结果","操作"],[
        ["llm_884218 / 资讯成稿","Qwen3","8,420","4.2s","成功","查看链路"],
        ["llm_884201 / 报告总结","DeepSeek","5,180","2.8s","成功","查看链路"],
        ["llm_884177 / AI 对话","Qwen3","1,280","12.0s","超时回退","查看链路"]]]
    },
    "admin-audit": {
      pricing:["价格与规则变更","记录 API 单价、报告价格、折扣和系统规则的修改前后值，便于发现误改并回滚。",["记录编号 / 配置项","变更前","变更后","操作人","生效状态","操作"],[
        ["AUD-8842 / API-17 单价","¥0.30","¥0.27","王静","已生效","查看差异"],
        ["AUD-8839 / 报告 M08 折扣","100%","85%","王静","待发布","查看差异"],
        ["AUD-8818 / 余额预警线","¥200","¥500","李明","已生效","查看差异"]]],
      refunds:["资金与余额变动","记录会改变客户余额或退款结果的操作，包括退款审核、线下充值到账确认、人工调账和发票红冲。每条记录必须关联原业务单据。",["记录编号 / 关联业务单","业务动作","变动金额","操作人","处理结果","操作"],[
        ["AUD-F-0824-18 / REF-0824-018","退款审核","¥199.00","王静","待复核","查看处理依据"],
        ["AUD-F-0824-11 / RCG-0824-018","充值到账确认","¥5,000.00","李明","已完成","查看处理依据"],
        ["AUD-F-0823-06 / WLT-88182","人工调整余额","¥20.00","王静","已完成","查看处理依据"]]],
      data:["数据与内容","查看数据源映射、资讯审核、报告字段和发布版本的操作记录。",["记录编号 / 业务对象","业务动作","变更摘要","操作人","结果","操作"],[
        ["AUD-D-8841 / BATCH-20260824","资讯审核","通过 8 篇、拒绝 2 篇","王静","已发布","查看详情"],
        ["AUD-D-8834 / companiesProfile","字段映射","新增 3 个财务字段","李明","待验证","查看详情"],
        ["AUD-D-8828 / REPORT-v1.7","版本发布","章节与价格调整","王静","草稿","查看详情"]]]
    }
  }[active]?.[tab];
  if (!workflow) return "";
  const [title,desc,columns,rows] = workflow;
  const routeSteps = {
    "admin-api-customers":["选择客户或应用","核对 Key 与余额","调整预警或应用状态","通知客户"],
    "admin-api-usage":["筛选请求与账期","核对返回及计费标记","追踪异常或对账","生成账务记录"],
    "admin-users":["筛选客户","查看完整使用时间线","处理权限或账户状态","写入客户记录"],
    "admin-orders":["定位订单","核对支付、交付与退款依据","执行退款或重试","同步客户结果"],
    "admin-wallet":["核对渠道或业务单据","确认收入与支出","更新人民币余额","生成余额凭证"],
    "admin-invoices":["核对可开票订单","验证普票或专票资料","合并、开票或退回","记录交付结果"],
    "admin-models":["选择业务场景","配置模型、提示词或额度","测试并发布","查看调用结果"],
    "admin-audit":["选择记录类型","查看变更前后与处理依据","核对操作人和关联单据","按需导出记录"],
    "admin-insights":["查看采集内容","核验来源和正文","通过、拒绝或删除","进入发布队列"],
    "admin-providers":["选择数据源","核对接口映射和质量","处理异常同步","记录供应商状态"],
    "admin-products":["选择报告商品","配置字段、价格或版本","复核并发布","同步前台商品"],
    "admin-tasks":["定位报告任务","查看执行步骤与异常","重试或转人工","完成客户交付"]
  }[active] || ["查看对象","核对详情","执行操作","写入审计记录"];
  return `<section class="admin-workflow-page"><header><div><span>OPERATION WORKFLOW</span><h1>${title}</h1><p>${desc}</p></div></header><div class="admin-workflow-guide"><b>查看方法</b>${routeSteps.map((step,index)=>`${index?"<i>→</i>":""}<span>${step}</span>`).join("")}</div><section class="admin-workflow-table"><div class="head">${columns.map(c=>`<span>${c}</span>`).join("")}</div>${rows.map(row=>`<div>${row.map((cell,index)=>index===row.length-1&&/^(price|task):/.test(cell)?`<button data-action="${cell.startsWith("price:")?"admin-price-open":"admin-task-open"}" data-price-type="${cell.split(":")[1]||""}" data-id="${cell.split(":")[2]||cell.split(":")[1]}">${cell.startsWith("price:")?"设置价格":"处理"}</button>`:index===row.length-1&&["admin-users","admin-api-customers"].includes(active)?`<button data-action="admin-customer-detail" data-id="${row[0]}">${cell}</button>`:index===row.length-1&&active==="admin-orders"?`<button data-action="admin-order-detail" data-id="${row[0]}">${cell}</button>`:index===row.length-1&&active==="admin-invoices"?`<button data-action="admin-invoice-detail" data-id="${row[0]}">${cell}</button>`:index===row.length-1&&active==="admin-audit"?`<button data-action="admin-audit-detail" data-id="${row[0]}" data-audit-action="${/退款/.test(row[1])?"REFUND_APPROVE":/到账/.test(row[1])?"RECHARGE_CONFIRM":/调账|调整余额/.test(row[1])?"WALLET_ADJUST":"CONFIG_UPDATE"}">${cell}</button>`:index===row.length-1?`<button data-action="admin-workflow-notice" data-message="已打开：${cell}">${cell}</button>`:`<span>${cell}</span>`).join("")}</div>`).join("")}</section></section>`;
}

function renderAdminWorkflowModal() {
  const modal = state.adminWorkflowModal;
  if (!modal) return "";
  if (modal.kind === "review") {
    const item = state.adminReviewItems.find(row=>row.id===modal.id);
    if (!item) return "";
    return `<div class="admin-workflow-mask" data-action="admin-workflow-close"></div><section class="admin-workflow-modal review"><header><div><span>${item.category} · ${item.id}</span><h2>${item.title}</h2><p>${item.source} · 建议 ${item.time} 发布</p></div><button data-action="admin-workflow-close">×</button></header><div class="review-source"><b>审核重点</b><span>标题是否准确</span><span>正文事实是否有来源</span><span>结论是否超出公开信息</span></div><article><h3>文章摘要</h3><p>${item.summary}</p><h3>正文预览</h3><p>${item.body}</p><h3>信息来源</h3><div class="source-proof"><span>${icon("shield",18)}</span><div><strong>${item.source}</strong><small>原始链接与采集时间已保留，可在正式系统中打开核验。</small></div><button data-action="admin-workflow-notice" data-message="已打开原始来源（原型演示）">查看原文</button></div></article><footer><button class="danger" data-action="admin-review-decision" data-decision="delete" data-id="${item.id}">删除</button><button data-action="admin-review-decision" data-decision="reject" data-id="${item.id}">拒绝 / 退回</button><button class="primary" data-action="admin-review-decision" data-decision="approve" data-id="${item.id}">审核通过</button></footer></section>`;
  }
  if (modal.kind === "price") {
    const list = modal.type === "api" ? state.adminApiPrices : state.adminReportPrices;
    const item = list.find(row=>row.id===modal.id);
    if (!item) return "";
    const sale = item.list * item.discount / 100;
    return `<div class="admin-workflow-mask" data-action="admin-workflow-close"></div><section class="admin-workflow-modal compact"><header><div><span>PRICING</span><h2>设置${modal.type==="api"?" API":"报告"}价格</h2><p>${item.id} · ${item.name}</p></div><button data-action="admin-workflow-close">×</button></header><form data-form="admin-price"><input type="hidden" name="type" value="${modal.type}"><input type="hidden" name="id" value="${item.id}"><label><span>原价（元）</span><input name="list" type="number" min="0" step="0.01" value="${item.list}"></label><label><span>折扣比例（%）</span><input name="discount" type="number" min="0" max="100" step="1" value="${item.discount}"></label><div class="price-preview"><span>当前折后价</span><strong>¥${sale.toFixed(modal.type==="api"?2:0)}</strong><small>计算方式：原价 × 折扣比例</small></div><footer><button type="button" data-action="admin-workflow-close">取消</button><button class="primary" type="submit">保存并生成价格草稿</button></footer></form></section>`;
  }
  if (modal.kind === "customer") {
    const apiCustomer = /远航|星图|Demo|CUS-240815/.test(modal.id || "");
    const name = /远航/.test(modal.id||"") ? "远航供应链" : /星图/.test(modal.id||"") ? "星图投资" : /139/.test(modal.id||"") ? "139****1076" : /186|240815/.test(modal.id||"") ? "186****4521" : "138****8888";
    return `<div class="admin-workflow-mask" data-action="admin-workflow-close"></div><section class="admin-workflow-modal admin-detail-modal"><header><div><span>CUSTOMER 360 · ${modal.id || "CUS-DEMO-0001"}</span><h2>${name}</h2><p>统一查看账户、报告权限、API 应用、余额和交易记录</p></div><button data-action="admin-workflow-close">×</button></header><article class="admin-detail-body"><section class="admin-detail-metrics">${[["账户状态","正常"],["报告订单","3 笔"],["API 余额",apiCustomer?"¥13,420.20":"¥568.00"],["累计实付",apiCustomer?"¥28,640.00":"¥697.00"]].map(([a,b])=>`<div><span>${a}</span><strong>${b}</strong></div>`).join("")}</section><section class="admin-detail-grid"><article><header><strong>账户与认证</strong><button data-action="admin-workflow-notice" data-message="已打开账户资料编辑">编辑资料</button></header><dl><div><dt>客户编号</dt><dd>${modal.id || "CUS-DEMO-0001"}</dd></div><div><dt>登录方式</dt><dd>手机号 + 微信</dd></div><div><dt>实名认证</dt><dd>已完成</dd></div><div><dt>发票资料</dt><dd>1 个已保存抬头</dd></div></dl></article><article><header><strong>API 应用与余额</strong><button data-action="admin-workflow-notice" data-message="已进入该客户的 API 应用管理">管理应用</button></header><dl><div><dt>应用</dt><dd>${apiCustomer?"全能力业务应用":"尚未创建"}</dd></div><div><dt>有效 Key</dt><dd>${apiCustomer?"2 个":"0 个"}</dd></div><div><dt>今日调用</dt><dd>${apiCustomer?"1,580 次":"0 次"}</dd></div><div><dt>余额预警</dt><dd>${/星图/.test(name)?"已触发":"未触发"}</dd></div></dl></article></section><section class="admin-detail-panel"><header><strong>报告与权限</strong><span>报告不允许生成外链分享</span></header><div class="admin-detail-table"><div class="head"><span>报告</span><span>企业主体</span><span>已购模块</span><span>状态</span></div><div><span>RPT-20260824-0182</span><span>Northstar Components</span><span>基础 / 股权 / 风险</span><em>可访问</em></div><div><span>RPT-20260818-0141</span><span>Atlas Medical</span><span>基础 / 财务</span><em>可访问</em></div></div></section><section class="admin-detail-panel"><header><strong>最近活动时间线</strong><span>搜索、购买、API 和资金统一追踪</span></header><div class="admin-detail-timeline">${[["今天 14:31","API 调用","企业搜索识别 · 扣费 ¥0.10"],["今天 13:42","报告交付","Northstar Components 报告已生成"],["今天 13:38","完成支付","微信示例支付 ¥299.00"],["昨天 20:16","账户登录","Web · 安徽合肥"]].map(([a,b,c])=>`<div><time>${a}</time><i></i><span><strong>${b}</strong><small>${c}</small></span></div>`).join("")}</div></section></article><footer><button data-action="admin-workflow-close">关闭</button><button data-action="admin-workflow-notice" data-message="已向客户发送余额与账户提醒（演示）">发送提醒</button><button class="primary" data-action="admin-workflow-notice" data-message="已打开客户账户状态设置">账户操作</button></footer></section>`;
  }
  if (modal.kind === "order") {
    const refund = /REF|退款/.test(modal.id || "");
    const apiOrder = /API|充值|RCG/.test(modal.id || "");
    const orderId = String(modal.id || "ORD-RPT-0182").split(" /")[0];
    return `<div class="admin-workflow-mask" data-action="admin-workflow-close"></div><section class="admin-workflow-modal admin-detail-modal"><header><div><span>ORDER DETAIL · ${orderId}</span><h2>${refund?"退款申请详情":apiOrder?"API 余额订单详情":"报告订单详情"}</h2><p>支付、商品交付、发票和退款状态统一核对</p></div><button data-action="admin-workflow-close">×</button></header><article class="admin-detail-body"><section class="admin-order-status"><div><span>当前状态</span><strong>${refund?"待退款审核":"已支付 / 已交付"}</strong><small>最后更新：今天 14:06</small></div><div><span>客户</span><strong>${refund?"远航供应链":"138****8888"}</strong><small>CUS-DEMO-0001</small></div><div><span>实付金额</span><strong>${apiOrder?"¥5,000.00":refund?"¥199.00":"¥299.00"}</strong><small>${apiOrder?"API 余额充值":"含税金额"}</small></div></section><section class="admin-detail-grid"><article><header><strong>订单内容</strong></header><dl><div><dt>商品类型</dt><dd>${apiOrder?"API 余额":"企业调查报告"}</dd></div><div><dt>企业主体</dt><dd>${apiOrder?"—":"Northstar Components"}</dd></div><div><dt>购买内容</dt><dd>${apiOrder?"充值后开放 33 个接口":"M01 / M03 / M08"}</dd></div><div><dt>计价版本</dt><dd>PRICE-20260816-V16</dd></div></dl></article><article><header><strong>支付与发票</strong></header><dl><div><dt>支付方式</dt><dd>微信支付（Mock 示例）</dd></div><div><dt>支付流水</dt><dd>MOCK-WX-884218</dd></div><div><dt>发票申请</dt><dd>增值税专票 · 已提交</dd></div><div><dt>发票抬头</dt><dd>合肥易尊数字科技有限公司</dd></div></dl></article></section><section class="admin-detail-panel"><header><strong>订单处理进度</strong><span>关键节点由系统自动记录</span></header><div class="admin-order-steps">${[["创建订单","13:36","已完成"],["支付回调","13:38","已完成"],[apiOrder?"余额入账":"报告生成","13:42","已完成"],["发票处理","待开具","进行中"]].map(([a,b,c])=>`<div><i></i><span><strong>${a}</strong><small>${b}</small></span><em>${c}</em></div>`).join("")}</div></section>${refund?`<section class="admin-detail-panel refund-evidence"><header><strong>退款审核依据</strong><span>审核后原路退回并关闭对应权益</span></header><dl><div><dt>退款原因</dt><dd>报告数据不完整</dd></div><div><dt>可退金额</dt><dd>¥199.00</dd></div><div><dt>报告访问</dt><dd>审核通过后关闭</dd></div><div><dt>原支付渠道</dt><dd>微信支付（Mock 示例）</dd></div></dl></section>`:""}</article><footer><button data-action="admin-workflow-close">关闭</button><button data-action="admin-workflow-notice" data-message="订单号已复制">复制订单号</button>${refund?`<button class="danger" data-action="admin-workflow-notice" data-message="退款申请已拒绝（演示）">拒绝退款</button><button class="primary" data-action="admin-workflow-notice" data-message="退款申请已审核通过（演示）">审核通过</button>`:`<button class="primary" data-action="admin-workflow-notice" data-message="已重新触发未完成的订单步骤（演示）">重新执行</button>`}</footer></section>`;
  }
  if (modal.kind === "invoice") {
    const invoiceId = String(modal.id || "INV-20260824-0182").split(" /")[0];
    const issued = /MOCK|已开|0182/.test(invoiceId);
    const incomplete = /0168|待补/.test(invoiceId);
    const special = !/普通|普票/.test(modal.id || "");
    return `<div class="admin-workflow-mask" data-action="admin-workflow-close"></div><section class="admin-workflow-modal admin-detail-modal"><header><div><span>INVOICE DETAIL · ${invoiceId}</span><h2>${special?"增值税专用发票":"增值税普通发票"}</h2><p>核对申请、抬头资料、关联订单、开票状态与电子发票交付记录</p></div><button data-action="admin-workflow-close">×</button></header><article class="admin-detail-body"><section class="admin-order-status"><div><span>当前状态</span><strong>${incomplete?"资料待补":issued?"已开具":"待审核"}</strong><small>最后更新：今天 15:18</small></div><div><span>开票金额</span><strong>${/M-/.test(invoiceId)?"¥5,000.00":"¥299.00"}</strong><small>${/M-/.test(invoiceId)?"3 笔订单合并":"1 笔订单"}</small></div><div><span>申请来源</span><strong>${/M-/.test(invoiceId)?"个人中心":"购买支付页"}</strong><small>两个入口进入同一队列</small></div></section><section class="admin-detail-grid"><article><header><strong>购方开票资料</strong><button data-action="admin-workflow-notice" data-message="已打开客户保存的发票抬头">查看已保存抬头</button></header><dl><div><dt>单位名称</dt><dd>合肥易尊数字科技有限公司</dd></div><div><dt>纳税人识别号</dt><dd>91340100MA8SQJ2026</dd></div><div><dt>注册地址 / 电话</dt><dd>${incomplete?"地址待补充":"安徽省合肥市高新区创新大道 88 号 / 0551-88886666"}</dd></div><div><dt>开户行 / 账号</dt><dd>${incomplete?"开户行与账号待补充":"招商银行合肥高新区支行 / 5519 8800 2026 0816"}</dd></div></dl></article><article><header><strong>交付信息</strong></header><dl><div><dt>接收邮箱</dt><dd>finance@example.com</dd></div><div><dt>开票项目</dt><dd>信息服务费</dd></div><div><dt>税率</dt><dd>6%</dd></div><div><dt>上游状态</dt><dd>${issued?"Mock 开票成功":"Mock / 示例接口待处理"}</dd></div></dl></article></section><section class="admin-detail-panel"><header><strong>关联订单</strong><span>申请金额必须等于可开票订单金额合计</span></header><div class="admin-detail-table"><div class="head"><span>订单号</span><span>业务</span><span>支付时间</span><span>可开票金额</span></div><div><span>SQJ-ORD-DEMO-2408</span><span>Northstar Components 报告</span><span>2026-08-24 13:38</span><em>¥299.00</em></div>${/M-/.test(invoiceId)?`<div><span>API-RCG-0182</span><span>API 余额充值</span><span>2026-08-23 16:20</span><em>¥4,701.00</em></div>`:""}</div></section><section class="admin-detail-panel"><header><strong>处理记录</strong><span>正式版对接税务服务商，当前接口均标记为 Mock / 示例</span></header><div class="admin-detail-timeline">${[["13:42","提交申请","客户在支付页勾选开票"],["13:43","资料校验",incomplete?"缺少专票开户行信息":"专票必填字段校验通过"],["15:02","运营复核",incomplete?"退回客户补充资料":"金额与订单核对一致"],["15:18",issued?"完成开具":"进入开票队列",issued?"电子发票已发送至邮箱":"等待上游示例接口处理"]].map(([a,b,c])=>`<div><time>${a}</time><i></i><span><strong>${b}</strong><small>${c}</small></span></div>`).join("")}</div></section></article><footer><button data-action="admin-workflow-close">关闭</button>${issued?`<button data-action="admin-workflow-notice" data-message="已打开电子发票预览（Mock 示例）">查看电子发票</button><button class="primary" data-action="admin-workflow-notice" data-message="电子发票已重新发送至客户邮箱（演示）">重新发送</button>`:incomplete?`<button class="danger" data-action="admin-workflow-notice" data-message="已退回客户补充专票资料（演示）">退回补充资料</button>`:`<button data-action="admin-workflow-notice" data-message="开票申请已驳回并记录原因（演示）">拒绝申请</button><button class="primary" data-action="admin-workflow-notice" data-message="已审核通过并提交 Mock 开票接口（演示）">审核并提交开票</button>`}</footer></section>`;
  }
  if (modal.kind === "audit") {
    const eventId = String(modal.id || "AUD-20260824-164208").split(" /")[0];
    const action = modal.action || (/PRICE/.test(eventId)?"PRICE_VERSION_UPDATE":/REF/.test(eventId)?"REFUND_APPROVE":"CONFIG_UPDATE");
    const fund = /REFUND|WALLET|FUNDS|RECHARGE/.test(action + eventId);
    return `<div class="admin-workflow-mask" data-action="admin-workflow-close"></div><section class="admin-workflow-modal admin-detail-modal"><header><div><span>操作记录 · ${eventId}</span><h2>${fund?"资金与余额变动详情":"操作记录详情"}</h2><p>核对操作人、关联业务单据、修改前后、处理依据和执行过程</p></div><button data-action="admin-workflow-close">×</button></header><article class="admin-detail-body"><section class="admin-detail-metrics">${[["执行结果","成功"],["操作人",fund?"FIN-2001 陈雨":"OP-1001 王静"],["来源 IP","10.0.0.18"],["发生时间","2026-08-24 16:42:08"]].map(([a,b])=>`<div><span>${a}</span><strong>${b}</strong></div>`).join("")}</section><section class="admin-detail-grid"><article><header><strong>业务信息</strong></header><dl><div><dt>业务动作</dt><dd><code>${action}</code></dd></div><div><dt>关联业务单据</dt><dd>${fund?"SQJ-ORD-219A1C30":"价格版本 PRICE-20260816-V16"}</dd></div><div><dt>操作入口</dt><dd>运营后台 · Web</dd></div><div><dt>复核记录</dt><dd>APR-20260824-0182 · 已通过</dd></div></dl></article><article><header><strong>安全追踪信息</strong></header><dl><div><dt>登录会话</dt><dd>SES-OP-8F42A1</dd></div><div><dt>操作设备</dt><dd>Chrome / macOS</dd></div><div><dt>请求追踪号</dt><dd>trace_a8f2c901</dd></div><div><dt>日志完整性</dt><dd>已校验 · 不可编辑</dd></div></dl></article></section><section class="admin-detail-panel audit-diff"><header><strong>修改前后</strong><span>仅展示本次操作实际修改的内容</span></header><div><article><span>修改前</span><pre>${fund?`{\n  "refund_status": "PENDING",\n  "amount": 199.00\n}`:`{\n  "discount": 100,\n  "status": "DRAFT"\n}`}</pre></article><i>→</i><article><span>修改后</span><pre>${fund?`{\n  "refund_status": "APPROVED",\n  "amount": 199.00\n}`:`{\n  "discount": 88,\n  "status": "APPROVED"\n}`}</pre></article></div></section><section class="admin-detail-panel"><header><strong>复核与执行过程</strong><span>由系统自动记录，运营人员不能删除</span></header><div class="admin-detail-timeline">${[["16:37","提交操作","OP-1001 填写业务原因"],["16:40","复核通过","复核人员确认关联单据与处理依据"],["16:42","执行成功","业务结果已生效并写入操作日志"],["16:42","发送通知","已通知对应业务负责人"]].map(([a,b,c])=>`<div><time>${a}</time><i></i><span><strong>${b}</strong><small>${c}</small></span></div>`).join("")}</div></section></article><footer><button data-action="admin-workflow-close">关闭</button><button data-action="admin-workflow-notice" data-message="操作记录编号已复制">复制记录编号</button><button class="primary" data-action="admin-workflow-notice" data-message="操作记录明细已导出（演示）">导出记录明细</button></footer></section>`;
  }
  if (modal.kind === "task") return `<div class="admin-workflow-mask" data-action="admin-workflow-close"></div><section class="admin-workflow-modal compact"><header><div><span>REPORT TASK</span><h2>${modal.id}</h2><p>查看执行步骤、错误原因与人工处理操作</p></div><button data-action="admin-workflow-close">×</button></header><div class="task-timeline">${[["主体识别","已完成"],["数据模块调用","部分失败"],["报告生成","等待处理"],["交付客户","尚未开始"]].map(([a,b],i)=>`<div class="${i===1?"error":""}"><i></i><span><strong>${a}</strong><small>${b}</small></span></div>`).join("")}</div><footer><button data-action="admin-workflow-close">关闭</button><button data-action="admin-task-retry" data-id="${modal.id}">从失败步骤重试</button><button class="primary" data-action="admin-workflow-notice" data-message="已标记为人工交付复核">转人工处理</button></footer></section>`;
  return "";
}

function adminShell(content, active) {
  const currentTab = state.adminSubtabByRoute[active] || "overview";
  const workflowSubpage = currentTab === "overview" ? "" : renderAdminWorkflowSubpage(active,currentTab);
  const workspace = currentTab === "overview" ? content : (workflowSubpage || renderAdminSubpage(active,currentTab));
  const brandName = tr("商情局","SHANGQINGJU");
  return `${prototypeBar()}<div class="admin-app"><aside class="admin-sidebar"><a class="admin-brand-v36" href="#/admin"><img src="assets/sqj-mark-v4.svg" alt="SQJ"><span><strong>${brandName}</strong></span></a>${adminNavigation(active)}</aside><main id="main-content" class="admin-main"><header class="admin-global-bar"><div><span>${icon("search",16)}<input placeholder="搜索客户、订单、报告任务或接口" /></span><small class="admin-env-badge"><i></i> Mock 运营环境</small></div><div><button data-action="admin-demo-action" data-message="通知中心：6 篇资讯待审核，2 个任务异常">${icon("alert",17)}<b>8</b></button><button data-action="go" data-target="home">返回用户端</button><div class="admin-top-account"><span>OP</span><div><strong>运营管理员</strong><small>运营账号</small></div></div><button class="admin-top-logout" data-action="admin-logout">${icon("arrow",15)}退出登录</button></div></header>${adminSubnav(active)}${workspace}</main></div>${renderAdminDrawer()}${renderAdminWorkflowModal()}${annotationPanel(active)}`;
}

function renderAdminDashboard() {
  return adminShell(`<header class="admin-top"><div><span class="kicker">OPERATIONS OVERVIEW</span><h1>经营与交付概览</h1><p>2026-08-16 · 所有指标均为演示数据</p></div><div><button class="button ghost" data-action="go" data-target="admin-insights">打开资讯 Agent</button><button class="button primary" data-action="admin-config">创建配置变更</button></div></header><section class="admin-alerts"><article><span>${icon("spark",20)}</span><div><strong>今日 5 篇市场深度文章已发布</strong><small>46 条公开信号已完成筛选、生成和人工复核</small></div><button data-action="go" data-target="admin-insights">查看工作台</button></article><article class="critical"><span>${icon("alert",20)}</span><div><strong>3 个生产前决策待登记</strong><small>价格、供应商许可、主地域尚未锁定</small></div><button data-action="show-decisions">查看决策</button></article></section><section class="admin-metrics">${[["今日搜索","18,240","+8.2%"],["付费转化","4.7%","+0.4pp"],["报告成功率","98.4%","-0.3pp"],["今日资讯","5 篇","08:30 已发"],["待人工复核","0 篇","队列清空"]].map((m)=>`<article><span>${m[0]}</span><strong>${m[1]}</strong><small class="up">${m[2]}</small></article>`).join("")}</section><section class="admin-grid"><article class="admin-chart-card"><div class="panel-title"><div><strong>近 7 日内容发布</strong><span>一级市场 / 二级市场</span></div><button data-action="go" data-target="admin-insights">管理内容</button></div><div class="stacked-chart">${[62,76,58,84,69,91,78].map((v,i)=>`<div><i class="success" style="height:${v}%"></i><i class="partial" style="height:${Math.max(8,90-v)}%"></i><span>${["一","二","三","四","五","六","日"][i]}</span></div>`).join("")}</div><div class="chart-legend"><span><i class="success"></i>二级市场</span><span><i class="partial"></i>一级市场</span></div></article><article class="coverage-card"><div class="panel-title"><div><strong>内容 Agent 健康度</strong><span>今日 07:30 批次</span></div></div>${[["采集成功率","100%",100],["来源可追溯","100%",100],["人工复核完成","100%",100],["定时发布成功","100%",100]].map((row)=>`<div class="coverage-row"><strong>${row[0]}</strong><div><i style="width:${row[2]}%"></i></div><small>${row[1]}</small></div>`).join("")}</article></section>`, "admin");
}

function renderAdminInsights() {
  const data = state.insights || fallbackInsights;
  const agentInfo = data.agent || { name:"市场情报 Agent", schedule:"每天 07:30 采集，08:30 发布", workflow:["公开市场采集","相似事件去重","来源权威性评分","文章初稿生成","人工复核","定时发布"], nextRunAt:"2026-08-17T07:30:00+08:00" };
  const edition = data.edition || { id:"DAILY-DEMO", scannedCount:46, selectedCount:allInsights(data).length, targetCount:5, status:"PUBLISHED", scheduledAt:data.capturedAt };
  const stories = allInsights(data);
  const sourceNetwork = data.discoverySources || [];
  return adminShell(`<header class="admin-top agent-admin-head"><div><span class="kicker">MARKET INTELLIGENCE AGENT</span><h1>每日资讯 Agent 工作台</h1><p>${agentInfo.schedule} · 下一次运行 ${String(agentInfo.nextRunAt).replace("T"," ").slice(0,16)}</p></div><div><button class="button ghost" data-action="go" data-target="insights">查看前台</button><button class="button primary" data-action="run-agent">${state.agentRunState==="running"?"正在扫描市场…":"立即运行一次"}</button></div></header>
    <section class="agent-status-card"><div class="agent-orb">${icon("spark",30)}<i></i></div><div><span>AGENT STATUS</span><h2>${agentInfo.name}</h2><p>从监管披露、交易所文件和公司官方公告中发现信号；形成文章初稿后必须经过人工复核。</p></div><dl><div><dt>当前批次</dt><dd>${edition.id}</dd></div><div><dt>状态</dt><dd class="published">${edition.status}</dd></div><div><dt>发布时间</dt><dd>${String(edition.scheduledAt).replace("T"," ").slice(0,16)}</dd></div></dl></section>
    <section class="agent-metrics">${[["扫描信号",edition.scannedCount || 64,`来自 ${sourceNetwork.length || 6} 个重点平台`],["今日入选",edition.selectedCount || stories.length,`目标 ${edition.targetCount || 5}–10 篇`],["内容模块",insightCategories.length,"大宗 / 投资 / 金融 / 企业 / 其他"],["线索源在线",sourceNetwork.filter((source)=>source.status==="CONNECTED").length || 6,"全部连接正常"]].map(([label,value,note])=>`<article><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`).join("")}</section>
    <section class="agent-pipeline"><div class="panel-title"><div><strong>自动化发布链路</strong><span>Agent 负责提效，工作人员负责最终发布责任</span></div><b>6 / 6 完成</b></div><div>${agentInfo.workflow.map((step,index)=>`<article class="done"><span>${index+1}</span><div><strong>${step}</strong><small>${[`${edition.scannedCount || 64} 条候选信号`,`去除 ${Math.max(11,(edition.scannedCount || 64)-stories.length-35)} 条重复事件`,"媒体线索回溯原始披露",`生成 ${stories.length} 篇结构化初稿`,"事实、标题、来源均已确认","08:30 推送至五个内容模块"][index] || "已完成"}</small></div>${icon("check",17)}</article>`).join("")}</div></section>
    ${sourceNetwork.length ? `<section class="agent-sources"><div class="panel-title"><div><strong>重点线索源</strong><span>不同平台按擅长领域路由到五个子模块</span></div><b>${sourceNetwork.length} / ${sourceNetwork.length} 在线</b></div><div>${sourceNetwork.map((source)=>`<article><span>${source.nameZh.slice(0,1)}</span><div><strong>${source.nameZh}</strong><small>${source.focusZh}</small></div><i>${source.modules.map((code)=>categoryMeta(code).zh).join(" · ")}</i><b>${source.status}</b></article>`).join("")}</div></section>` : ""}
    <section class="publish-queue"><div class="panel-title"><div><strong>今日发布队列</strong><span>每篇文章都保留独立文章页与原始参考来源</span></div><button data-action="publish-edition">重新推送本期</button></div><div class="agent-table"><div class="agent-row head"><span>模块 / 市场</span><span>文章</span><span>线索源 / 事实源</span><span>审核</span><span>发布</span></div>${stories.map((story)=>`<div class="agent-row"><span class="channel-pill ${story.channel?.toLowerCase()}">${categoryMeta(story.category).zh}<small>${story.channel==="PRIMARY"?"一级市场":story.channel==="SECONDARY"?"二级市场":"市场数据"}</small></span><a href="${insightArticleLink(story)}">${story.titleZh || story.title}</a><span>${story.discoveredBy?.join(" / ") || "Agent"}<small>${story.sourceZh || story.source}</small></span><span class="reviewed">人工已复核</span><time>08:30</time></div>`).join("")}</div></section>`, "admin-insights");
}

function renderAdminModels() {
  const editing = state.adminModels.find((model)=>model.id === state.adminModelEditingId);
  const enabled = state.adminModels.filter((model)=>model.enabled);
  const free = enabled.filter((model)=>model.publicFree);
  const form = state.adminModelFormOpen ? `<form class="admin-config-form" data-form="admin-model"><header><div><span class="kicker">MODEL CONFIG</span><h2>${editing ? "编辑模型" : "添加 AI 模型"}</h2><p>配置仅作用于演示后台；正式环境需在密钥托管服务中维护凭证。</p></div><button type="button" data-action="close-admin-model-form">×</button></header><div class="admin-form-grid"><label><span>展示名称</span><input name="name" required value="${editing?.name || ""}" placeholder="例如：通义千问 Qwen3" /></label><label><span>模型 Code</span><input name="modelCode" required value="${editing?.modelCode || ""}" placeholder="qwen3-32b" /></label><label><span>服务商</span><input name="provider" required value="${editing?.provider || ""}" placeholder="阿里云 / DeepSeek" /></label><label><span>每人每日免费额度</span><input name="dailyQuota" type="number" min="0" value="${editing?.dailyQuota ?? 20}" /></label></div><div class="admin-check-row"><label><input type="checkbox" name="enabled" ${editing?.enabled ?? true ? "checked" : ""}/> 启用模型</label><label><input type="checkbox" name="publicFree" ${editing?.publicFree ?? true ? "checked" : ""}/> 向所有用户免费开放</label></div><footer><button type="button" data-action="close-admin-model-form">取消</button><button class="primary" type="submit">保存模型配置</button></footer></form>` : "";
  return adminShell(`<header class="admin-top"><div><span class="kicker">AI MODEL ROUTING</span><h1>AI 模型配置</h1><p>配置用户可选模型、免费额度和默认路由，不需要修改前端代码。</p></div><button class="button primary" data-action="open-admin-model-form">添加模型</button></header><section class="admin-config-metrics"><article><small>模型总数</small><strong>${state.adminModels.length}</strong><span>含停用模型</span></article><article><small>当前启用</small><strong>${enabled.length}</strong><span>可进入路由池</span></article><article><small>免费模型</small><strong>${free.length}</strong><span>面向所有注册用户</span></article><article><small>默认模型</small><strong>${state.adminModels.find((model)=>model.isDefault)?.name || "未设置"}</strong><span>失败时自动切换备用</span></article></section><section class="admin-config-intro"><span>${icon("spark",22)}</span><div><strong>公共免费模型池</strong><p>用户先消耗每人每日免费额度；单模型不可用时按启用顺序自动切换。高级付费模型默认不对普通用户开放。</p></div><b>${free.reduce((sum,model)=>sum+model.dailyQuota,0)} 次 / 人 / 日</b></section><section class="admin-config-table"><header><div><strong>模型与路由</strong><span>配置变更应记录操作人、生效时间和回滚版本</span></div></header><div class="admin-model-row head"><span>模型</span><span>服务商 / Code</span><span>开放策略</span><span>每日额度</span><span>状态</span><span>操作</span></div>${state.adminModels.map((model)=>`<div class="admin-model-row"><div><strong>${model.name}</strong>${model.isDefault?'<small class="default-tag">默认</small>':""}</div><div><span>${model.provider}</span><code>${model.modelCode}</code></div><span>${model.publicFree?"所有用户免费":"付费 / 内部"}</span><strong>${model.publicFree?`${model.dailyQuota} 次` : "按套餐"}</strong><button class="config-switch ${model.enabled?"on":""}" data-action="toggle-admin-model" data-id="${model.id}" aria-label="切换模型状态"><i></i>${model.enabled?"已启用":"已停用"}</button><div><button data-action="set-default-model" data-id="${model.id}" ${!model.enabled||model.isDefault?"disabled":""}>设为默认</button><button data-action="edit-admin-model" data-id="${model.id}">编辑</button></div></div>`).join("")}</section>${form}`, "admin-models");
}

function renderAdminSources() {
  const editing = state.adminSources.find((source)=>source.id === state.adminSourceEditingId);
  const enabled = state.adminSources.filter((source)=>source.enabled);
  const form = state.adminSourceFormOpen ? `<form class="admin-config-form" data-form="admin-source"><header><div><span class="kicker">SOURCE CONFIG</span><h2>${editing ? "编辑线索来源" : "新增重点线索来源"}</h2><p>这里配置的是资讯发现入口，发布文章仍需回溯权威事实源并经过人工复核。</p></div><button type="button" data-action="close-admin-source-form">×</button></header><div class="admin-form-grid"><label><span>来源名称</span><input name="name" required value="${editing?.name || ""}" placeholder="例如：生意社" /></label><label><span>来源网址</span><input name="url" required value="${editing?.url || ""}" placeholder="https://" /></label><label><span>重点领域</span><input name="focus" required value="${editing?.focus || ""}" placeholder="大宗商品价格与产业链信号" /></label><label><span>路由模块</span><select name="modules"><option ${editing?.modules==="大宗数据"?"selected":""}>大宗数据</option><option ${editing?.modules==="投资日报"?"selected":""}>投资日报</option><option ${editing?.modules==="金融市场"?"selected":""}>金融市场</option><option ${editing?.modules==="上市企业"?"selected":""}>上市企业</option><option ${editing?.modules==="其他"?"selected":""}>其他</option></select></label><label><span>优先权重</span><input name="weight" type="number" min="0" max="100" value="${editing?.weight ?? 80}" /></label></div><div class="admin-check-row"><label><input type="checkbox" name="enabled" ${editing?.enabled ?? true ? "checked" : ""}/> 启用采集</label></div><footer><button type="button" data-action="close-admin-source-form">取消</button><button class="primary" type="submit">保存来源配置</button></footer></form>` : "";
  return adminShell(`<header class="admin-top"><div><span class="kicker">INTELLIGENCE SOURCES</span><h1>资讯来源配置</h1><p>维护 Agent 每日扫描的重点线索来源，可增加、修改、停用并调整优先级。</p></div><div><button class="button ghost" data-action="go" data-target="admin-insights">查看发布工作台</button><button class="button primary" data-action="open-admin-source-form">新增来源</button></div></header><section class="admin-config-metrics"><article><small>重点来源</small><strong>${state.adminSources.length}</strong><span>支持持续扩展</span></article><article><small>启用采集</small><strong>${enabled.length}</strong><span>进入每日扫描队列</span></article><article><small>覆盖模块</small><strong>5</strong><span>大宗 / 投资 / 金融 / 企业 / 其他</span></article><article><small>下一次扫描</small><strong>07:30</strong><span>生成后由人工复核</span></article></section><section class="admin-config-intro source"><span>${icon("shield",22)}</span><div><strong>线索源不等于事实源</strong><p>媒体和社区用于发现热点，文章中的核心事实优先引用监管、交易所、公司公告等权威原始资料。</p></div><b>人工复核后发布</b></section><section class="admin-config-table"><header><div><strong>重点线索源</strong><span>点击编辑可修改领域、模块和抓取权重</span></div></header><div class="admin-source-row head"><span>来源</span><span>重点领域</span><span>内容路由</span><span>权重</span><span>状态</span><span>操作</span></div>${state.adminSources.map((source)=>`<div class="admin-source-row"><div><span class="source-letter">${source.name.slice(0,1)}</span><div><strong>${source.name}</strong><a href="${source.url}" target="_blank" rel="noreferrer">${source.url.replace(/^https?:\/\//,"")}</a></div></div><p>${source.focus}</p><span>${source.modules}</span><strong>${source.weight}</strong><button class="config-switch ${source.enabled?"on":""}" data-action="toggle-admin-source" data-id="${source.id}"><i></i>${source.enabled?"采集中":"已停用"}</button><button data-action="edit-admin-source" data-id="${source.id}">编辑</button></div>`).join("")}</section>${form}`, "admin-sources");
}

function adminOpsHeader(kicker, title, description, actionLabel, message) {
  return `<header class="admin-top"><div><span class="kicker">${kicker}</span><h1>${title}</h1><p>${description}</p></div><button class="button primary" data-action="admin-demo-action" data-message="${message}">${actionLabel}</button></header>`;
}

function adminOpsMetrics(items) {
  return `<section class="admin-config-metrics ops-metrics">${items.map(([label,value,note,tone=""])=>`<article class="${tone}"><small>${label}</small><strong>${value}</strong><span>${note}</span></article>`).join("")}</section>`;
}

function renderAdminCoverage() {
  const rows = [["CN","中国大陆","国内数据库","10 / 10","92%","已上线"],["HK","中国香港","全球数据库","9 / 10","86%","已上线"],["US","美国","全球数据库","9 / 10","82%","已上线"],["SG","新加坡","全球数据库","8 / 10","76%","已上线"],["GB","英国","全球数据库","7 / 10","64%","核验中"],["DE","德国","全球数据库","6 / 10","58%","核验中"],["FR","法国","全球数据库","5 / 10","46%","待接入"],["JP","日本","全球数据库","4 / 10","38%","待接入"]];
  return adminShell(`${adminOpsHeader("COUNTRY & COVERAGE","国家与覆盖","维护全球库与国内库的国家范围、模块可售状态和 Provider 路由。","新增国家配置","已打开国家覆盖配置草稿（演示）")}${adminOpsMetrics([["已配置市场","10","全球 9 + 国内 1"],["正式可售","4","CN / HK / US / SG"],["核验中","2","GB / DE"],["平均模块覆盖","68%","按 10 个报告模块统计"]])}<section class="ops-layout"><article class="ops-card coverage-command"><header><div><strong>双数据库路由</strong><span>同一国家只能绑定一个主 Provider，可配置备用源</span></div><button data-action="admin-demo-action" data-message="Provider 路由检查完成，未发现交叉调用">检查路由</button></header><div><article><span>${icon("globe",21)}</span><div><strong>全球数据库</strong><small>海外及港澳台主体</small></div><b>9 个市场</b></article><i>统一主体模型</i><article><span>中</span><div><strong>国内数据库</strong><small>中国大陆工商主体</small></div><b>1 个市场</b></article></div></article><article class="ops-card coverage-rules"><header><div><strong>上线门槛</strong><span>市场达到全部条件后才允许前台售卖</span></div></header>${[["主体搜索可用",100],["M01 基础信息",100],["来源许可确认",80],["退款规则确认",70]].map(([label,value])=>`<div><span>${label}</span><b>${value}%</b><i><em style="width:${value}%"></em></i></div>`).join("")}</article></section><section class="ops-table-card"><header><div><strong>市场覆盖清单</strong><span>模块覆盖率、数据源与前台销售状态</span></div><div><button>全部状态</button><button>导出清单</button></div></header><div class="ops-table coverage"><div class="head"><span>代码 / 市场</span><span>数据库</span><span>模块覆盖</span><span>字段完整度</span><span>状态</span><span>操作</span></div>${rows.map((row)=>`<div><span><b>${row[0]}</b>${row[1]}</span><span>${row[2]}</span><strong>${row[3]}</strong><span>${row[4]}</span><em class="${row[5]==="已上线"?"ok":row[5]==="核验中"?"warn":"muted"}">${row[5]}</em><button data-action="admin-demo-action" data-message="正在编辑 ${row[1]} 覆盖配置">编辑</button></div>`).join("")}</div></section>`, "admin-coverage");
}

function renderAdminProducts() {
  const rows = state.adminReportPrices;
  return adminShell(`${adminOpsHeader("REPORT PRODUCTS","报告产品","分别管理报告包含什么、原价多少、折扣多少、最终卖多少钱，以及当前是否在前台销售。","新建报告商品","已打开报告商品创建流程")}${adminOpsMetrics([["报告商品","10 个","M01–M10"],["当前在售",`${rows.filter(row=>row.enabled).length} 个`,"前台可购买"],["平均折扣",`${Math.round(rows.reduce((s,r)=>s+r.discount,0)/rows.length)}%`,"按当前商品计算"],["待发布价格","2 项","保存后进入草稿"]])}<section class="admin-product-guide"><article><b>商品内容</b><span>字段、章节、数据来源</span></article><i>→</i><article><b>商品定价</b><span>原价 × 折扣 = 折后价</span></article><i>→</i><article><b>版本发布</b><span>审核后同步前台</span></article></section><section class="ops-table-card"><header><div><strong>报告商品与销售价格</strong><span>折扣按百分比设置；例如原价 ¥100、80% 折扣，前台售价为 ¥80</span></div><button data-action="admin-subtab" data-tab="chapters">进入批量价格管理</button></header><div class="ops-table report-price-table"><div class="head"><span>报告商品</span><span>原价</span><span>折扣</span><span>折后价</span><span>销售状态</span><span>操作</span></div>${rows.map(row=>`<div><span><b>${row.id}</b>${row.name}</span><strong>${money(row.list)}</strong><span>${row.discount}%</span><strong class="sale-price">${money(row.list*row.discount/100)}</strong><em class="${row.enabled?"ok":"muted"}">${row.enabled?"在售":"停用"}</em><button data-action="admin-price-open" data-price-type="report" data-id="${row.id}">设置价格</button></div>`).join("")}</div></section>`, "admin-products");
}

function renderAdminPricing() {
  const rows = modules.slice(0,8).map((module,index)=>[module.code,module.name,money(module.price),money(Math.max(19,module.price-10)),index<3?"组合优惠":"无自动优惠","生效中"]);
  return adminShell(`${adminOpsHeader("PRICING & PROMOTION","价格与优惠","配置报告模块、全球查同源 API 单价、预存余额和组合优惠；所有变更保留审批与回滚。","创建价格版本","新价格版本已进入草稿，发布前需要审批（演示）")}${adminOpsMetrics([["当前价格版本","v1.6","2026-08-16 生效"],["在售报告 SKU","8","覆盖 4 个正式市场"],["全球查同源 API","33","按元/次原价计费"],["本月优惠成本","¥12,860","占成交额 6.4%"]])}<section class="ops-layout pricing-layout"><article class="ops-card active-version"><header><div><strong>当前生效版本</strong><span>PRICE-20260816-V16</span></div><em>已发布</em></header><h2>模块价 + API 原价同步</h2><p>报告购买 3 个及以上模块自动优惠 12%；API 接口单价与全球查保持一致，用户先充值独立 API 余额。</p><div><button data-action="admin-demo-action" data-message="已复制 v1.6 为新草稿">复制为草稿</button><button>查看审计记录</button></div></article><article class="ops-card point-packages"><header><div><strong>API 预存余额</strong><span>与前台充值页一致</span></div></header>${[["充值 ¥200","到账 ¥200"],["充值 ¥800","到账 ¥800"],["充值 ¥2,500","到账 ¥2,500"]].map(([points,price])=>`<div><span>${points}</span><strong>${price}</strong><button data-action="admin-demo-action" data-message="正在编辑 ${points} 档位">编辑</button></div>`).join("")}</article></section><section class="ops-table-card"><header><div><strong>报告模块价格</strong><span>标准价、会员价与优惠规则</span></div><div><button>批量调价</button><button>价格预览</button></div></header><div class="ops-table pricing"><div class="head"><span>模块</span><span>标准价</span><span>会员价</span><span>优惠</span><span>状态</span><span>操作</span></div>${rows.map((row)=>`<div><span><b>${row[0]}</b>${row[1]}</span><strong>${row[2]}</strong><span>${row[3]}</span><span>${row[4]}</span><em class="ok">${row[5]}</em><button data-action="admin-demo-action" data-message="已打开 ${row[0]} 调价面板">调价</button></div>`).join("")}</div></section>`, "admin-pricing");
}

function renderAdminProviders() {
  const rows = [["GLOBALCHECK-UPSTREAM","全球查正式上游 · 33 个接口","GLOBAL + CN","待接入","--","主上游"],["GLOBALCHECK-MOCK","按全球查契约模拟 33 个接口","SANDBOX","100%","118ms","当前演示"],["PUBLIC-DISCLOSURE","资讯公开披露与原文引用","CONTENT","98.6%","2.1s","内容源"]];
  return adminShell(`${adminOpsHeader("PROVIDER ORCHESTRATION","供应商编排","企业数据只接全球查上游；当前由同契约 Mock 完成联调，正式凭证到位后切换 Adapter。","配置全球查上游","已打开全球查上游凭证与路由配置（演示）")}${adminOpsMetrics([["企业数据源","全球查","全球与国内共用上游"],["同源 API","33 个","名称、路径、参数、单价一致"],["当前运行","Mock","等待正式上游凭证"],["切换范围","Adapter","前台与购买流程不改"]])}<section class="ops-table-card"><header><div><strong>Provider 与接入状态</strong><span>企业数据源唯一；公开披露仅用于资讯文章</span></div><button>刷新健康检查</button></header><div class="ops-table providers"><div class="head"><span>Provider</span><span>范围</span><span>成功率</span><span>P95 延迟</span><span>路由角色</span><span>操作</span></div>${rows.map((row)=>`<div><span><b>${row[0]}</b>${row[1]}</span><span>${row[2]}</span><strong>${row[3]}</strong><span>${row[4]}</span><em class="${row[5]==="主上游"?"ok":"info"}">${row[5]}</em><button data-action="admin-demo-action" data-message="已打开 ${row[0]} 路由与字段映射">配置</button></div>`).join("")}</div></section>`, "admin-providers");
}

function renderAdminOrders() {
  const rows = [["SQJ-ORD-8A21F93C","138****8888","Northstar · 3 模块","¥200","微信支付","待开票","已支付"],["SQJ-ORD-7B18D102","139****2210","Atlas Medical · 5 模块","¥346","支付宝","已申请专票","已支付"],["SQJ-API-61D8F104","186****7788","API 预存余额 · ¥5,000","¥799","微信支付","不开票","已支付"],["SQJ-ORD-4A20EE91","137****6621","Harborline · 2 模块","¥128","账户余额","未申请","退款审核"],["SQJ-ORD-219A1C30","158****9032","报告模块 · M06","¥129","支付宝","不开票","已退款"]];
  return adminShell(`${adminOpsHeader("ORDER & REFUND","订单与退款","统一查看报告订单、API 余额订单、支付、发票和退款状态。","导出今日订单","今日订单清单已生成（演示）")}${adminOpsMetrics([["今日订单","128","较昨日 +8.2%"],["实付金额","¥36,420","含 API 余额订单"],["退款申请","3","1 笔待审核"],["待开发票","17","含 4 笔合并开票"]])}<section class="ops-filter"><label>${icon("search",16)}<input placeholder="搜索订单号、手机号或企业" /></label><button class="active">全部订单</button><button>已支付</button><button>退款中</button><button>已退款</button><button>待开票</button></section><section class="ops-table-card"><header><div><strong>订单流水</strong><span>演示支付与退款不会产生真实资金变化</span></div><button>下载对账单</button></header><div class="ops-table orders"><div class="head"><span>订单 / 客户</span><span>购买内容</span><span>金额 / 支付</span><span>发票</span><span>状态</span><span>操作</span></div>${rows.map((row)=>`<div><span><b>${row[0]}</b>${row[1]}</span><span>${row[2]}</span><span><strong>${row[3]}</strong><small>${row[4]}</small></span><span>${row[5]}</span><em class="${row[6]==="已支付"?"ok":row[6]==="退款审核"?"warn":"muted"}">${row[6]}</em><button data-action="admin-order-detail" data-id="${row[0]} / ${row[1]}">详情</button></div>`).join("")}</div></section>`, "admin-orders");
}

function renderAdminWallet() {
  const rows = [
    ["RCG-20260823-0186","138****8888 · 个人账户","¥500.00","微信支付","已到账","20:18"],
    ["RCG-20260823-0179","中电数产集团 · 企业账户","¥20,000.00","支付宝","已到账","18:42"],
    ["RCG-20260823-0168","139****2210 · 个人账户","¥1,000.00","微信支付","支付中","17:06"],
    ["ADJ-20260823-0041","186****7788 · API 账户","-¥120.00","人工调账","待复核","15:38"],
    ["RCG-20260823-0142","Atlas Medical · 企业账户","¥8,000.00","银行转账","已到账","11:25"]
  ];
  return adminShell(`${adminOpsHeader("WALLET & RECHARGE","余额与充值","承接个人中心的账户余额、微信/支付宝充值、企业转账、调账与资金风险审计。","创建人工调账","已打开双人复核的人工调账表单（演示）")}${adminOpsMetrics([["账户余额总额","¥8,642,180","报告余额与 API 余额分账"],["今日充值","¥186,420","微信 58% / 支付宝 34%"],["待确认转账","6 笔","企业银行转账"],["异常资金操作","1 笔","已冻结并等待复核"]])}<section class="ops-layout"><article class="ops-card"><header><div><strong>支付渠道状态</strong><span>前台充值入口与后台通道配置一致</span></div><button data-action="admin-demo-action" data-message="已打开支付渠道配置">渠道配置</button></header><div class="wallet-channel-grid">${[["微信支付","正常","58%"],["支付宝","正常","34%"],["银行转账","人工确认","8%"],["系统余额","内部结算","--"]].map(([name,status,share])=>`<article><span>${name}</span><em>${status}</em><strong>${share}</strong></article>`).join("")}</div></article><article class="ops-card"><header><div><strong>资金控制</strong><span>高风险操作必须双人复核</span></div></header>${[["单笔充值上限","¥50,000"],["人工调账审批","双人复核"],["余额退款路径","原路退回"],["资金流水保留","永久"]].map(([label,value])=>`<div class="wallet-rule-row"><span>${label}</span><strong>${value}</strong></div>`).join("")}</article></section><section class="ops-table-card"><header><div><strong>今日余额流水</strong><span>充值、消费、退款和人工调账统一追踪</span></div><button data-action="admin-demo-action" data-message="已导出今日资金流水（演示）">导出流水</button></header><div class="ops-table wallet-admin-table"><div class="head"><span>流水 / 账户</span><span>金额</span><span>渠道</span><span>状态</span><span>时间</span><span>操作</span></div>${rows.map((row)=>`<div><span><b>${row[0]}</b>${row[1]}</span><strong>${row[2]}</strong><span>${row[3]}</span><em class="${row[4]==="已到账"?"ok":row[4]==="支付中"?"info":"warn"}">${row[4]}</em><span>${row[5]}</span><button data-action="admin-demo-action" data-message="查看 ${row[0]} 的支付回调与审计轨迹">详情</button></div>`).join("")}</div></section>`,"admin-wallet");
}

function renderAdminInvoices() {
  const rows = [
    ["INV-20260823-0098","中电数产集团有限公司","增值税专用发票","¥12,680.00","合并 4 笔订单","待开票"],
    ["INV-20260823-0092","合肥易尊数字科技有限公司","增值税专用发票","¥8,420.00","API 充值","开票中"],
    ["INV-20260823-0089","上海青岚科技有限公司","增值税普通发票","¥346.00","报告订单","已开具"],
    ["INV-20260822-0082","Atlas Medical Trading GmbH","增值税普通发票","¥799.00","API 充值","资料待补"],
    ["INV-20260822-0077","138****8888","增值税普通发票","¥200.00","报告订单","已开具"]
  ];
  return adminShell(`${adminOpsHeader("INVOICE OPERATIONS","发票与开票","承接支付页和个人中心的开票申请，支持普票、专票、合并开票、抬头保存与交付追踪。","批量提交开票","已选中的合规申请将提交税务系统（演示）")}${adminOpsMetrics([["待开票","17 笔","其中专票 6 笔"],["今日已开","42 张","电子发票自动交付"],["合并开票","4 组","共关联 19 笔订单"],["资料待补","3 户","开户行或注册地址缺失"]])}<section class="ops-layout"><article class="ops-card"><header><div><strong>专票资料完整度</strong><span>名称、税号、地址电话、开户行及账号</span></div><button data-action="admin-subtab" data-tab="profiles">复核资料</button></header>${[["企业名称与税号",100],["注册地址与电话",94],["开户行与账号",91],["订单可开票金额",100]].map(([label,value])=>`<div class="file-health-row"><span>${label}</span><i><b style="width:${value}%"></b></i><strong>${value}%</strong></div>`).join("")}</article><article class="ops-card"><header><div><strong>申请来源</strong><span>两个入口进入同一开票队列</span></div></header><div class="invoice-source-flow"><article><b>购买支付页</b><span>填写并保存发票信息</span></article><i>→</i><article><b>个人中心</b><span>单笔或合并申请开票</span></article><i>→</i><article><b>统一开票队列</b><span>审核、开具、交付</span></article></div></article></section><section class="ops-table-card"><header><div><strong>开票申请</strong><span>发票抬头可复用，申请与订单金额强关联</span></div><button data-action="admin-subtab" data-tab="merged">合并开票审核</button></header><div class="ops-table invoice-admin-table"><div class="head"><span>申请 / 抬头</span><span>票种</span><span>金额</span><span>关联业务</span><span>状态</span><span>操作</span></div>${rows.map((row)=>`<div><span><b>${row[0]}</b>${row[1]}</span><span>${row[2]}</span><strong>${row[3]}</strong><span>${row[4]}</span><em class="${row[5]==="已开具"?"ok":row[5]==="开票中"?"info":row[5]==="资料待补"?"warn":"muted"}">${row[5]}</em><button data-action="admin-invoice-detail" data-id="${row[0]} / ${row[2]}">查看详情</button></div>`).join("")}</div></section>`,"admin-invoices");
}

function renderAdminApiUsage() {
  const rows = [
    ["13:41:26","company.search.resolve","中电数产集团 · Web","200 AVAILABLE","¥0.05","118ms"],
    ["13:40:18","company.profile.full.get","Demo Studio · API","200 AVAILABLE","¥0.80","682ms"],
    ["13:39:42","company.identifiers.get","MCP Agent · MCP","200 AVAILABLE","¥0.10","94ms"],
    ["13:36:10","company.sanctions.detail.get","Atlas Risk · CLI","503 PROVIDER_ERROR","¥0.00","1.84s"],
    ["13:32:55","personsShareholdingCompanies","本地联调 · API","200 NO_RECORD","¥0.20","326ms"]
  ];
  return adminShell(`${adminOpsHeader("API USAGE & BILLING","调用与计费","逐笔查看请求、返回状态、接口价格、实际扣费和扣费后的客户余额。","导出调用明细","已生成调用与人民币计费明细（演示）")}${adminOpsMetrics([["有效 API Key","86","58 个活跃应用"],["今日调用","86,420","四种渠道统一计量"],["今日扣费","¥18,642.80","按折后价扣除余额"],["异常请求","12","异常不扣费"]])}<section class="ops-filter"><label>${icon("search",16)}<input placeholder="Request ID、客户或 OperationId" /></label><button class="active">全部渠道</button><button>仅成功</button><button data-action="admin-subtab" data-tab="errors">仅异常</button><button data-action="admin-subtab" data-tab="billing">计费流水</button></section><section class="ops-table-card"><header><div><strong>实时调用记录</strong><span>点击“追踪请求”查看参数摘要、返回状态和对应余额流水</span></div><button data-action="admin-workflow-notice" data-message="已导出当前筛选条件下的调用明细">导出</button></header><div class="ops-table api-usage-admin-table"><div class="head"><span>时间 / OperationId</span><span>客户 / 渠道</span><span>数据状态</span><span>人民币计费</span><span>耗时</span><span>操作</span></div>${rows.map((row)=>`<div><span><b>${row[0]}</b><code>${row[1]}</code></span><span>${row[2]}</span><em class="${row[3].includes("200")?"ok":"danger"}">${row[3]}</em><strong>${row[4]}</strong><span>${row[5]}</span><button data-action="admin-workflow-notice" data-message="请求追踪：${row[1]} · ${row[2]} · ${row[3]} · 扣费 ${row[4]}">追踪请求</button></div>`).join("")}</div></section>`,"admin-api-usage");
}

function renderAdminTasks() {
  const rows = [["SQJ-TASK-00821","Atlas Medical","M06 财务","PARTIAL",72,"Provider A","4m18s"],["SQJ-TASK-00820","Northstar","M01/M03/M08","COMPLETED",100,"Provider A","3m42s"],["SQJ-TASK-00819","Harborline","M03 股权","RUNNING",48,"Provider B","1m51s"],["SQJ-TASK-00818","Nexa Trading","M08 合规","PROVIDER_ERROR",30,"Provider B","2m07s"],["SQJ-TASK-00817","上海青岚科技","M01 基础","QUEUED",0,"Domestic","等待中"]];
  return adminShell(`${adminOpsHeader("REPORT TASKS","报告任务","先看任务状态，再进入单个任务查看执行步骤、错误原因和交付结果；异常任务可从失败步骤重试。","创建测试任务","已创建一条 Mock 报告任务（演示）")}${adminOpsMetrics([["运行中","18","平均进度 54%"],["队列等待","7","预计 3 分钟内启动"],["今日成功率","98.4%","1,264 / 1,285"],["需人工处理","3","PARTIAL / ERROR"]])}<section class="ops-task-board">${[["QUEUED","7","等待执行"],["RUNNING","18","正在生成"],["PARTIAL","2","需要判断是否重试"],["FAILED","1","必须人工处理"]].map(([status,count,note])=>`<article><span>${status}</span><strong>${count}</strong><small>${note}</small></article>`).join("")}</section><section class="ops-table-card"><header><div><strong>任务执行队列</strong><span>点击任务查看模块级执行明细，不再打开通用配置表单</span></div><div><button data-action="admin-subtab" data-tab="failures">只看异常</button><button data-action="admin-workflow-notice" data-message="已对可重试的异常任务发起批量重试">批量重试</button></div></header><div class="ops-table tasks"><div class="head"><span>任务 / 主体</span><span>模块</span><span>状态 / 进度</span><span>Provider</span><span>耗时</span><span>操作</span></div>${rows.map((row)=>`<div><span><b>${row[0]}</b>${row[1]}</span><span>${row[2]}</span><span><em class="${row[3]==="COMPLETED"?"ok":row[3]==="PROVIDER_ERROR"?"danger":row[3]==="PARTIAL"?"warn":"info"}">${row[3]}</em><i class="task-progress"><b style="width:${row[4]}%"></b></i></span><span>${row[5]}</span><strong>${row[6]}</strong><button data-action="admin-task-open" data-id="${row[0]}">查看任务</button></div>`).join("")}</div></section>`, "admin-tasks");
}

function renderAdminDeveloperMatrix() {
  return `<section class="admin-developer-matrix">${[["API Key","凭证创建、轮换、停用和权限范围","keys","shield"],["API 文档","接口契约、示例代码与版本发布","docs","report"],["CLI 发布","安装包、命令映射和兼容版本","cli","api"],["MCP 工具","工具 Schema、API 映射与 Agent 权限","mcp","spark"]].map(([title,note,tab,iconName])=>`<button data-action="admin-subtab" data-tab="${tab}"><span>${icon(iconName,21)}</span><div><strong>${title}</strong><small>${note}</small></div>${icon("arrow",15)}</button>`).join("")}</section>`;
}

function renderAdminApiCustomers() {
  const rows = [["CUS-DEMO-0001","Demo Studio","全能力测试应用","¥13,420","1,580","正常"],["CUS-API-0182","远航供应链","供应商准入系统","¥48,600","8,420","正常"],["CUS-API-0168","星图投资","投前筛查平台","¥2,180","4,106","额度预警"],["CUS-API-0142","启明数据","企业画像中台","¥0","0","已停用"]];
  return adminShell(`${adminOpsHeader("API CUSTOMERS","API 客户","管理开发者客户、应用、API 预存余额、密钥状态和调用配额。","创建企业客户","已打开 API 企业客户创建表单（演示）")}${adminOpsMetrics([["API 客户","42","本月新增 6 家"],["活跃应用","58","近 7 日有调用"],["今日调用","86,420","成功率 98.7%"],["余额预警","3","余额低于 10%"]])}<section class="ops-table-card"><header><div><strong>开发者客户</strong><span>密钥明文不会在后台重复展示</span></div><button>余额批量调整</button></header><div class="ops-table api-customers"><div class="head"><span>客户</span><span>应用</span><span>API 余额</span><span>今日调用</span><span>状态</span><span>操作</span></div>${rows.map((row)=>`<div><span><b>${row[0]}</b>${row[1]}</span><span>${row[2]}</span><strong>${row[3]}</strong><span>${row[4]}</span><em class="${row[5]==="正常"?"ok":row[5]==="额度预警"?"warn":"muted"}">${row[5]}</em><button data-action="admin-demo-action" data-message="已打开 ${row[1]} 的应用、密钥和账单">管理</button></div>`).join("")}</div></section>`, "admin-api-customers");
}

function renderAdminAudit() {
  const records = [
    {time:"16:42:08",operator:"王静",role:"运营人员",action:"调整 API 价格",code:"PRICE_VERSION_UPDATE",object:"价格版本 v1.6",result:"已审批",ip:"10.0.0.18",type:"sensitive"},
    {time:"16:20:31",operator:"资讯 Agent",role:"系统任务",action:"发布审核通过的文章",code:"INSIGHT_PUBLISH",object:"每日刊 DAILY-0816",result:"成功",ip:"system",type:"content"},
    {time:"15:58:44",operator:"李明",role:"运营人员",action:"切换企业数据路由",code:"PROVIDER_ROUTE_CHANGE",object:"全球数据源 B",result:"已回滚",ip:"10.0.0.21",type:"sensitive"},
    {time:"15:10:06",operator:"陈雨",role:"财务复核",action:"审核退款",code:"REFUND_APPROVE",object:"退款单 REF-0824-018",result:"成功",ip:"10.0.0.32",type:"funds"},
    {time:"14:26:19",operator:"王静",role:"运营人员",action:"更新 AI 模型规则",code:"MODEL_CONFIG_UPDATE",object:"通义千问 Qwen3",result:"成功",ip:"10.0.0.18",type:"sensitive"},
    {time:"13:52:40",operator:"王静",role:"运营人员",action:"审核资讯文章",code:"INSIGHT_REVIEW_APPROVE",object:"NEWS-240824-03",result:"成功",ip:"10.0.0.18",type:"content"},
    {time:"13:18:22",operator:"王静",role:"运营人员",action:"登录运营后台",code:"ADMIN_LOGIN",object:"运营账号 OP-1001",result:"成功",ip:"10.0.0.18",type:"daily"},
    {time:"12:46:08",operator:"李明",role:"运营人员",action:"重试报告任务",code:"REPORT_TASK_RETRY",object:"SQJ-TASK-00818",result:"成功",ip:"10.0.0.21",type:"daily"}
  ];
  const filters = [["all","全部记录"],["daily","日常操作"],["sensitive","重要变更"],["funds","资金与余额"],["content","内容审核与发布"]];
  const currentFilter = state.adminAuditFilter || "all";
  const rows = currentFilter === "all" ? records : records.filter((record)=>record.type===currentFilter);
  return adminShell(`${adminOpsHeader("OPERATION & AUDIT LOG","操作与审计日志","记录谁在什么时间对哪个业务对象做了什么。普通操作用于排查问题；价格、权限、资金、数据源和内容发布等重要操作还会保留修改前后与关联单据。","导出当前日志","已按当前筛选条件生成日志文件（演示）")}${adminOpsMetrics([["今日操作","286","含 42 条自动任务"],["重要变更","18","保留修改前后与处理依据"],["已执行回滚","2","数据源路由与价格各 1 次"],["日志保留","365 天","重要操作不允许后台删除"]])}<section class="admin-v41-principles audit-explainer"><article><span>${icon("clock",20)}</span><div><strong>日常操作</strong><small>登录、查看、任务重试等，用于排查问题，不展示复杂字段差异</small></div><b>常规记录</b></article><article><span>${icon("settings",20)}</span><div><strong>重要变更</strong><small>价格、权限、模型和数据源调整，保留修改前后及回滚记录</small></div><b>需追踪</b></article><article><span>${icon("wallet",20)}</span><div><strong>资金与余额</strong><small>退款、充值到账、人工调账和红冲，必须关联原订单或流水</small></div><b>重点核对</b></article></section><section class="ops-filter admin-audit-filter"><label>${icon("search",16)}<input placeholder="可按操作人、业务对象或记录编号查找" /></label>${filters.map(([code,label])=>`<button class="${currentFilter===code?"active":""}" data-action="admin-audit-filter" data-filter="${code}" aria-pressed="${currentFilter===code}">${label}</button>`).join("")}</section><section class="ops-table-card"><header><div><strong>${filters.find(([code])=>code===currentFilter)?.[1] || "全部记录"}</strong><span>当前显示 ${rows.length} 条演示记录；点击详情查看处理依据、关联单据和安全追踪</span></div><button data-action="admin-subtab" data-tab="pricing">查看价格与规则变更</button></header><div class="ops-table audit"><div class="head"><span>时间 / 操作人</span><span>业务动作</span><span>业务对象</span><span>结果</span><span>来源</span><span>详情</span></div>${rows.map((row,index)=>`<div><span><b>${row.time}</b>${row.operator} · ${row.role}</span><span><b>${row.action}</b><small>${row.code}</small></span><span>${row.object}</span><em class="${row.result==="成功"||row.result==="已审批"?"ok":"warn"}">${row.result}</em><span>${row.ip}</span><button data-action="admin-audit-detail" data-id="AUD-20260824-${String(index+1).padStart(4,"0")}" data-audit-action="${row.code}">查看详情</button></div>`).join("")}</div></section>`, "admin-audit");
}

function renderAdminUsers() {
  const rows = [["CUS-DEMO-0001","138****8888","个人用户","已认证","¥568","正常"],["CUS-240816-0182","139****1076","中小企业","企业认证","¥8,420","正常"],["CUS-240815-0168","186****4521","API 客户","协议客户","¥2,180","额度预警"],["CUS-240812-0142","135****9033","个人用户","未认证","¥0","待核验"],["CUS-240801-0098","189****6220","企业客户","企业认证","¥12,600","限制登录"]];
  return adminShell(`${adminOpsHeader("USER & BUSINESS ACCOUNTS","用户与企业客户","统一管理 Web、小程序与 API 主账户的认证、权限、余额、企业协议和风险状态。","创建企业客户","创建企业客户并配置协议权限")}${adminOpsMetrics([["账户总数","128,420","Web 与小程序同一主账户"],["企业客户","1,286","含 42 家 API 客户"],["今日新增","368","手机号 312 / 微信 56"],["风险账户","7","限制登录或支付"]])}<section class="ops-filter"><label>${icon("search",16)}<input placeholder="手机号、客户 ID 或企业名称" /></label><button class="active">全部账户</button><button>个人用户</button><button>企业客户</button><button>风险账户</button></section><section class="ops-table-card"><header><div><strong>用户账户</strong><span>报告权限和 API 权限分别配置</span></div><div><button data-action="admin-demo-action" data-message="批量调整账户权限">批量权限</button><button data-action="admin-demo-action" data-message="导出用户清单">导出</button></div></header><div class="ops-table admin-users"><div class="head"><span>客户 / 手机号</span><span>客户类型</span><span>认证</span><span>账户余额</span><span>状态</span><span>操作</span></div>${rows.map((row)=>`<div><span><b>${row[0]}</b>${row[1]}</span><span>${row[2]}</span><strong>${row[3]}</strong><span>${row[4]}</span><em class="${row[5]==="正常"?"ok":row[5]==="额度预警"?"warn":"danger"}">${row[5]}</em><button data-action="admin-demo-action" data-message="管理 ${row[0]} 的认证、权限、余额与协议">管理</button></div>`).join("")}</div></section>`,"admin-users");
}

function renderAdminDashboardV41() {
  const work = [
    ["企业数据源","1 个主供应商运行中","33 个接口映射待正式凭证","admin-providers","查看数据源","database"],
    ["资讯审核","6 篇文章待人工审核","自动发布已关闭","admin-insights","进入审核队列","spark"],
    ["报告交付","2 个任务需要处理","1 个失败 · 1 个部分完成","admin-tasks","处理报告任务","report"],
    ["API 运营","3 个客户余额预警","充值后默认可调用全部接口","admin-api-customers","查看 API 客户","api"],
  ];
  return adminShell(`${adminOpsHeader("PLATFORM OPERATIONS","平台运营总览","从数据供给、内容审核、商品交付、API 调用到客户交易，统一查看官方平台的运营状态。","查看今日待办","已汇总今日需要人工处理的运营事项")}${adminOpsMetrics([["今日活跃客户","12,860","Web / 小程序 / API"],["今日企业检索","18,240","全球与国内数据库"],["今日成交","¥36,420","报告订单 + API 充值"],["服务可用率","99.2%","Mock 演示环境"]])}<section class="admin-v41-principles"><article><span>${icon("user",20)}</span><div><strong>操作员规则</strong><small>首期不区分角色，所有后台操作统一记录日志</small></div><b>统一权限</b></article><article><span>${icon("shield",20)}</span><div><strong>内容发布规则</strong><small>Agent 生成草稿，必须经过人工审核后才可发布</small></div><b>人工复核</b></article><article><span>${icon("database",20)}</span><div><strong>API 开通规则</strong><small>客户充值人民币余额后，默认调用全部 33 个接口</small></div><b>余额计费</b></article></section><section class="admin-v41-work"><header><div><strong>今日运营工作台</strong><span>按业务链路展示需要关注的事项</span></div><small>2026-08-24 · 演示数据</small></header><div>${work.map(([title,value,note,target,action,iconName])=>`<article><span>${icon(iconName,22)}</span><div><small>${title}</small><strong>${value}</strong><p>${note}</p></div><button data-action="go" data-target="${target}">${action} ${icon("arrow",14)}</button></article>`).join("")}</div></section><section class="ops-layout"><article class="ops-card admin-v41-flow"><header><div><strong>平台业务闭环</strong><span>后台功能与前端用户流程一一对应</span></div></header><div>${[["01","数据接入","供应商与字段质量"],["02","产品上架","报告模块与 API"],["03","客户使用","检索、购买与调用"],["04","交易交付","余额、订单、开票"],["05","监控复盘","异常与操作日志"]].map(([n,a,b])=>`<article><b>${n}</b><strong>${a}</strong><small>${b}</small></article>`).join("<i>→</i>")}</div></article><article class="ops-card"><header><div><strong>今日异常</strong><span>只展示需要人工处理的问题</span></div></header>${[["资讯待审核","6","admin-insights"],["报告异常任务","2","admin-tasks"],["API 余额预警","3","admin-api-customers"],["退款待处理","1","admin-orders"]].map(([a,b,target])=>`<button class="admin-v41-exception" data-action="go" data-target="${target}"><span>${a}</span><strong>${b}</strong>${icon("chevron",14)}</button>`).join("")}</article></section>`, "admin");
}

function renderAdminProvidersV41() {
  return adminShell(`${adminOpsHeader("ENTERPRISE DATA SOURCES","企业数据源","先管理供应商连接，再核对接口映射和数据质量。当前只有全球查一个主供应商，同时保留新增供应商入口。","添加供应商","打开供应商接入向导：填写名称、接口地址、鉴权方式并测试连接")}${adminOpsMetrics([["已接供应商","1 家","当前唯一主数据源"],["接口映射","33 / 33","与接口清单一致"],["全球 / 国内","双路由","数据库独立选择"],["今日成功率","99.2%","系统异常不扣费"]])}<section class="admin-provider-workflow"><article><span>${icon("database",24)}</span><div><small>主供应商</small><h2>全球查企业数据源</h2><p>为前端检索、报告与 API 提供同一套企业数据；全球库与国内库分别路由。</p><dl><div><dt>环境</dt><dd>Mock 联调</dd></div><div><dt>鉴权</dt><dd>X-API-Key</dd></div><div><dt>接口</dt><dd>33 / 33</dd></div><div><dt>最近检查</dt><dd>刚刚</dd></div></dl><footer><button data-action="admin-provider-test">测试连接</button><button data-action="admin-subtab" data-tab="mapping">查看接口映射</button><button data-action="admin-workflow-notice" data-message="已打开供应商凭证和路由编辑页">编辑接入</button></footer></div><em>运行中</em></article><button class="add-provider" data-action="admin-workflow-notice" data-message="供应商接入向导：基本信息 → 鉴权 → 接口映射 → 测试连接 → 启用"><b>＋</b><span><strong>添加备用供应商</strong><small>预留接入入口，不影响当前主路由</small></span></button></section><section class="ops-table-card"><header><div><strong>前端功能依赖</strong><span>清楚说明数据源变化会影响哪些用户功能</span></div></header><div class="provider-dependency-grid">${[["企业检索","主体搜索与确认"],["报告生成","股权、财务、司法等模块"],["数据 API","33 个同源接口"],["AI 问答","仅使用已购报告内容"]].map(([a,b])=>`<article><strong>${a}</strong><span>${b}</span></article>`).join("")}</div></section>`, "admin-providers");
}

function renderAdminInsightsV41() {
  const rows = state.adminReviewItems;
  const pending = rows.filter(item=>["待审核","需补来源"].includes(item.status));
  const header = `<header class="admin-top"><div><span class="kicker">EDITORIAL REVIEW</span><h1>资讯审核与发布</h1><p>先查看 Agent 今日采集并生成的文章，再逐篇核对标题、正文和来源，最后选择通过、拒绝或删除。</p></div><button class="button primary" data-action="admin-recollect">${state.adminCollectionRunning?"正在重新采集…":"重新采集今日资讯"}</button></header>`;
  return adminShell(`${header}${adminOpsMetrics([["今日采集","10 篇","07:30 批次"],["等待审核",`${pending.length} 篇`,"需要逐篇处理"],["已通过",`${rows.filter(item=>item.status==="已通过").length} 篇`,"进入待发布队列"],["自动发布","关闭","必须人工通过"]])}<section class="admin-review-flow"><div><b>1</b><span><strong>Agent 采集</strong><small>从配置来源抓取热点</small></span></div><i>→</i><div><b>2</b><span><strong>生成草稿</strong><small>去重并回溯事实来源</small></span></div><i>→</i><div class="active"><b>3</b><span><strong>人工逐篇审核</strong><small>查看全文后通过或拒绝</small></span></div><i>→</i><div><b>4</b><span><strong>定时发布</strong><small>通过后进入发布队列</small></span></div></section><section class="ops-table-card"><header><div><strong>今日文章审核队列</strong><span>点击“查看并审核”打开文章全文，不再进入通用配置侧栏</span></div><div><button data-action="admin-recollect">整批重新采集</button><button data-action="go" data-target="admin-sources">管理来源</button></div></header><div class="admin-review-list">${rows.map(item=>`<article><div class="review-list-main"><span>${item.category}</span><div><strong>${item.title}</strong><p>${item.summary}</p><small>${item.source} · 建议 ${item.time} 发布</small></div></div><em class="${item.status==="待审核"?"warn":item.status==="已通过"?"ok":"danger"}">${item.status}</em><button data-action="admin-review-open" data-id="${item.id}">${item.status==="已通过"?"查看文章":"查看并审核"}</button></article>`).join("")}</div></section>`, "admin-insights");
}

function renderAdminApiCustomersV41() {
  const prices = state.adminApiPrices;
  return adminShell(`${adminOpsHeader("API PRICING & CUSTOMERS","API 产品与客户","API 不是报告商品。这里按单次调用设置原价、折扣和实际扣费；客户充值余额后默认可调用全部接口。","新增价格版本","已创建 API 价格版本草稿")}${adminOpsMetrics([["开放 API","33 个","默认全部可调用"],["API 客户","42 家","58 个活跃应用"],["今日调用","86,420 次","成功率 98.7%"],["今日扣费","¥18,642.80","人民币余额结算"]])}<section class="admin-v41-api-policy"><span>${icon("database",22)}</span><div><strong>API 计费规则</strong><p>每次成功调用按“原价 × 折扣比例”从人民币余额扣除；系统异常和上游异常不扣费。</p></div><dl><div><dt>权限</dt><dd>全部接口</dd></div><div><dt>单位</dt><dd>元 / 次</dd></div><div><dt>异常请求</dt><dd>¥0.00</dd></div></dl></section><section class="ops-table-card"><header><div><strong>单接口价格设置</strong><span>以下为代表接口；正式系统加载完整 33 个接口，可逐个或批量调价</span></div><button data-action="go" data-target="api-market">查看前台 API 市场</button></header><div class="ops-table api-price-admin"><div class="head"><span>接口</span><span>原价</span><span>折扣</span><span>实际扣费</span><span>计费条件</span><span>操作</span></div>${prices.map(row=>`<div><span><b>${row.name}</b><code>${row.id}</code></span><strong>¥${row.list.toFixed(2)}</strong><span>${row.discount}%</span><strong class="sale-price">¥${(row.list*row.discount/100).toFixed(2)} / 次</strong><span>成功返回有效结果</span><button data-action="admin-price-open" data-price-type="api" data-id="${row.id}">设置价格</button></div>`).join("")}</div></section><section class="ops-layout"><article class="ops-card"><header><div><strong>客户与应用</strong><span>查看 Key、余额和调用范围</span></div><button data-action="admin-subtab" data-tab="quota">查看全部客户</button></header>${[["Demo Studio","¥13,420","1,580 次"],["远航供应链","¥48,600","8,420 次"],["星图投资","¥218","余额预警"]].map(([a,b,c])=>`<div class="admin-v41-balance-row"><span><b>${a}</b><small>${c}</small></span><strong>${b}</strong><button data-action="admin-workflow-notice" data-message="已打开 ${a} 的应用、密钥、余额和账单">详情</button></div>`).join("")}</article><article class="ops-card"><header><div><strong>价格发布说明</strong><span>防止误调价直接影响客户</span></div></header>${[["保存价格","生成草稿"],["运营复核","检查原价与折扣"],["发布生效","同步 API 市场和扣费服务"],["历史版本","支持回滚"]].map(([a,b])=>`<div class="wallet-rule-row"><span>${a}</span><strong>${b}</strong></div>`).join("")}</article></section>`, "admin-api-customers");
}

function renderAdminUsersV41() {
  const channels = [["Web 用户端","28,420","62%"],["微信小程序","13,860","30%"],["API 客户","400","6%"],["H5 移动网页","920","2%"]];
  return adminShell(`${adminOpsHeader("CUSTOMER USAGE","客户使用情况","统一查看客户在企业检索、报告购买、API 调用和账户交易中的使用情况。","导出客户报表","已创建客户使用情况导出任务")}${adminOpsMetrics([["账户总数","128,420","手机号与微信统一账户"],["今日活跃","43,600","四个终端合计"],["报告付费客户","4,062","今日完成支付"],["API 活跃客户","42","充值后调用全部接口"]])}<section class="ops-layout"><article class="ops-card"><header><div><strong>终端活跃分布</strong><span>同一客户可能使用多个终端</span></div></header><div class="admin-v41-channel-usage">${channels.map(([a,b,c])=>`<article><span>${a}</span><strong>${b}</strong><i><b style="width:${c}"></b></i><small>${c}</small></article>`).join("")}</div></article><article class="ops-card"><header><div><strong>客户行为漏斗</strong><span>今日 Web 与小程序</span></div></header>${[["发起企业检索","18,240","100%"],["确认企业主体","12,860","70%"],["选择报告模块","5,420","30%"],["完成支付","4,062","22%"]].map(([a,b,c])=>`<div class="admin-v41-funnel"><span>${a}</span><strong>${b}</strong><i><b style="width:${c}"></b></i></div>`).join("")}</article></section><section class="ops-table-card"><header><div><strong>客户账户</strong><span>点击客户可查看搜索、报告、API、订单和余额时间线</span></div><button data-action="admin-demo-action" data-message="已打开客户分群筛选器">客户分群</button></header><div class="ops-table admin-users"><div class="head"><span>客户 / 账号</span><span>主要使用方式</span><span>今日行为</span><span>账户余额</span><span>状态</span><span>操作</span></div>${[["CUS-DEMO-0001","138****8888","Web · 报告","检索 12 · 报告 1","¥568","正常"],["CUS-240816-0182","139****1076","小程序 · 报告","检索 8 · 报告 2","¥8,420","正常"],["CUS-240815-0168","186****4521","API","调用 4,106 次","¥218","余额预警"],["CUS-240812-0142","135****9033","Web","检索 2 · 未购买","¥0","未认证"]].map((row)=>`<div><span><b>${row[0]}</b>${row[1]}</span><span>${row[2]}</span><strong>${row[3]}</strong><span>${row[4]}</span><em class="${row[5]==="正常"?"ok":row[5]==="余额预警"?"warn":"muted"}">${row[5]}</em><button data-action="admin-customer-detail" data-id="${row[0]} / ${row[1]}">客户详情</button></div>`).join("")}</div></section>`, "admin-users");
}

function renderAdminFiles() {
  const rows = [["FILE-8821","Northstar_Annual_Report.pdf","CUS-DEMO-0001","PARSED","184 页","30 天后删除"],["FILE-8818","Atlas_Due_Diligence.docx","CUS-240816-0182","PARSING","68 页","长期保存"],["FILE-8809","Supplier_List.xlsx","CUS-240815-0168","FAILED","12 MB","待人工处理"],["FILE-8798","Harborline_Report.pdf","CUS-240812-0142","PARSED","96 页","7 天后删除"],["FILE-8781","企业年报扫描件.pdf","CUS-240801-0098","DELETING","221 页","删除队列"]];
  return adminShell(`${adminOpsHeader("USER FILE OPERATIONS","用户文件","管理用户授权文件的上传状态、解析、保存期限、异常与删除记录；后台默认不展示文件正文。","创建解析任务","创建一条受控的文件解析任务")}${adminOpsMetrics([["当前文件","18,642","对象存储加密保存"],["解析中","26","平均等待 1m42s"],["今日失败","8","OCR / 格式 / 超限"],["待删除","312","按用户策略执行"]])}<section class="ops-layout"><article class="ops-card"><header><div><strong>文件处理边界</strong><span>最小权限与可删除原则</span></div></header><div class="file-policy-list">${[["文件正文","仅授权 AI 任务读取"],["后台预览","默认关闭"],["保存期限","7 / 30 / 180 天或长期"],["删除任务","异步执行并记录审计"]].map(([a,b])=>`<div><span>${a}</span><strong>${b}</strong></div>`).join("")}</div></article><article class="ops-card"><header><div><strong>解析队列健康度</strong><span>最近 24 小时</span></div></header>${[["PDF 文本解析",99],["扫描件 OCR",94],["表格识别",91],["病毒扫描",100]].map(([label,value])=>`<div class="file-health-row"><span>${label}</span><i><b style="width:${value}%"></b></i><strong>${value}%</strong></div>`).join("")}</article></section><section class="ops-table-card"><header><div><strong>用户文件清单</strong><span>仅展示元数据，不展示正文内容</span></div><button data-action="admin-demo-action" data-message="已打开文件异常筛选">只看异常</button></header><div class="ops-table admin-files"><div class="head"><span>文件 / 名称</span><span>客户</span><span>解析状态</span><span>规模</span><span>保存策略</span><span>操作</span></div>${rows.map((row)=>`<div><span><b>${row[0]}</b>${row[1]}</span><span>${row[2]}</span><em class="${row[3]==="PARSED"?"ok":row[3]==="FAILED"?"danger":row[3]==="PARSING"?"info":"warn"}">${row[3]}</em><span>${row[4]}</span><strong>${row[5]}</strong><button data-action="admin-demo-action" data-message="查看 ${row[0]} 的解析、保存和删除记录">详情</button></div>`).join("")}</div></section>`,"admin-files");
}

function renderAdminAnalytics() {
  const funnels = [["首页访问","248,620",100],["发起企业搜索","86,420",72],["确认企业主体","51,280",53],["选择报告模块","12,640",31],["完成支付","4,062",18]];
  return adminShell(`${adminOpsHeader("BUSINESS ANALYTICS","运营分析","统一观察搜索、转化、收入、成本、报告、AI 与 API 指标，并可按渠道和市场下钻。","创建分析看板","创建自定义经营分析看板")}${adminOpsMetrics([["今日活跃用户","42,680","同比 +11.4%"],["搜索转化率","34.7%","访问 → 搜索"],["支付转化率","4.7%","搜索 → 支付"],["今日净收入","¥286,420","扣除退款与调用成本"]])}<section class="ops-layout analytics-layout"><article class="ops-card analytics-trend"><header><div><strong>近 14 日收入与成本</strong><span>报告订单 + API 充值</span></div><button data-action="admin-demo-action" data-message="切换经营指标时间范围">近 14 日</button></header><div class="analytics-bars">${[42,51,48,63,58,70,66,76,72,83,79,91,86,94].map((value,index)=>`<i style="height:${value}%"><b style="height:${Math.max(12,value*.32)}%"></b><span>${index%3===0?`${index+3}日`:""}</span></i>`).join("")}</div><footer><span><i></i>收入</span><span><i></i>数据与 AI 成本</span></footer></article><article class="ops-card analytics-funnel"><header><div><strong>用户转化漏斗</strong><span>Web 用户端 · 今日</span></div></header>${funnels.map(([label,value,width])=>`<div><span>${label}</span><strong>${value}</strong><i><b style="width:${width}%"></b></i></div>`).join("")}</article></section><section class="ops-table-card"><header><div><strong>渠道经营概览</strong><span>收入、转化与单位成本</span></div><button data-action="admin-demo-action" data-message="导出渠道经营报表">导出报表</button></header><div class="ops-table analytics"><div class="head"><span>渠道</span><span>活跃用户</span><span>成交订单</span><span>支付转化</span><span>净收入</span><span>单位成本</span></div>${[["Web 用户端","28,420","2,846","5.2%","¥168,640","¥6.42"],["微信小程序","13,860","1,064","3.8%","¥69,280","¥4.18"],["API 开放平台","400","152","38.0%","¥48,500","¥19.60"]].map((row)=>`<div>${row.map((cell,index)=>index===0?`<span><b>${cell}</b>今日</span>`:index===4?`<strong>${cell}</strong>`:`<span>${cell}</span>`).join("")}</div>`).join("")}</div></section>`,"admin-analytics");
}

function renderAdmin() {
  const nav = ["经营概览", "资讯 Agent", "国家与覆盖", "模块 / 字段 / SKU", "价格与优惠", "供应商编排", "订单与退款", "报告任务", "AI 模型与成本", "API 客户", "审计日志"];
  return renderAdminDashboardV41();
  return `${prototypeBar()}<div class="admin-app"><aside class="admin-sidebar"><a class="brand admin-brand" href="#/admin">${logo()}<span class="brand-suffix">运营后台</span></a><nav>${nav.map((x,i)=>`<button class="${i===0?"active":""}">${icon(["database","globe","report","settings","api","report","clock","spark","user","shield"][i],17)}${x}${[1,4,6,7].includes(i)?'<span class="nav-dot"></span>':''}</button>`).join("")}</nav><div class="admin-user"><span>OP</span><div><strong>演示运营员</strong><small>只读原型环境</small></div></div></aside><main id="main-content" class="admin-main"><header class="admin-top"><div><span class="kicker">OPERATIONS OVERVIEW</span><h1>经营与交付概览</h1><p>2026-08-16 · 所有指标均为演示数据</p></div><div><button class="icon-button">${icon("search",18)}</button><button class="icon-button">${icon("alert",18)}<i></i></button><button class="button primary" data-action="admin-config">创建配置变更</button></div></header><section class="admin-alerts"><article class="critical"><span>${icon("alert",20)}</span><div><strong>3 个生产前决策待登记</strong><small>价格、供应商许可、主地域尚未锁定</small></div><button data-action="show-decisions">查看决策清单</button></article><article><span>${icon("clock",20)}</span><div><strong>2 个供应商接口正在降级</strong><small>演示 Provider B · API 55.31 / 68.17</small></div><button>查看编排</button></article></section><section class="admin-metrics">${[["今日搜索", "18,240", "+8.2%"],["付费转化", "4.7%", "+0.4pp"],["报告成功率", "98.4%", "-0.3pp"],["平均生成耗时", "3m 42s", "-18s"],["AI / 报告成本", "¥0.18", "低于 ¥1 上限"]].map((m,i)=>`<article><span>${m[0]}</span><strong>${m[1]}</strong><small class="${i===2?"down":"up"}">${m[2]}</small></article>`).join("")}</section><section class="admin-grid"><article class="admin-chart-card"><div class="panel-title"><div><strong>报告任务与状态</strong><span>最近 7 天 · 演示</span></div><button>全部国家⌄</button></div><div class="stacked-chart">${[55,68,62,79,72,88,82].map((v,i)=>`<div><i class="success" style="height:${v}%"></i><i class="partial" style="height:${Math.max(5,18-v/6)}%"></i><i class="fail" style="height:${Math.max(3,12-v/10)}%"></i><span>${["一","二","三","四","五","六","日"][i]}</span></div>`).join("")}</div><div class="chart-legend"><span><i class="success"></i>成功</span><span><i class="partial"></i>部分完成</span><span><i class="fail"></i>失败</span></div></article><article class="coverage-card"><div class="panel-title"><div><strong>市场覆盖准备度</strong><span>按 PRD 建议名单</span></div><button>管理覆盖</button></div>${[["CN", "中国大陆", 92, "已明确"],["HK", "中国香港", 86, "已明确"],["US", "美国", 79, "已明确"],["SG", "新加坡", 74, "已明确"],["GB", "英国", 61, "待核验"],["DE", "德国", 48, "待核验"]].map(r=>`<div class="coverage-row"><span>${r[0]}</span><strong>${r[1]}</strong><div><i style="width:${r[2]}%"></i></div><small class="${r[3]==="待核验"?"pending":""}">${r[3]}</small></div>`).join("")}</article></section><article class="admin-table-card"><div class="panel-title"><div><strong>需要处理的任务</strong><span>失败、部分完成与成本异常</span></div><button>打开任务中心</button></div><div class="data-table admin-table"><div class="table-row table-head"><span>任务</span><span>主体 / 模块</span><span>状态</span><span>供应商</span><span>耗时 / 成本</span><span>操作</span></div>${[["SQJ-TASK-00821","Atlas Medical / M06","PARTIAL","Provider A","4m18s · ¥12.40","复核披露"],["SQJ-TASK-00818","Harborline / M03","PROVIDER_ERROR","Provider B","2m07s · ¥0","切换备用源"],["SQJ-TASK-00812","Northstar / M08","NO_RECORD","Provider A","38s · ¥3.20","已正常交付"]].map(r=>`<div class="table-row"><code>${r[0]}</code><span>${r[1]}</span><span class="state-text state-${r[2].toLowerCase()}">${r[2]}</span><span>${r[3]}</span><span>${r[4]}</span><button>${r[5]}</button></div>`).join("")}</div></article></main></div>${annotationPanel("admin")}`;
}

function miniShell(content, current, active = "home") {
  return `${prototypeBar()}<main id="main-content" class="mini-stage"><div class="phone-frame"><div class="phone-status"><span>9:41</span><span>●●● ᯤ ▰</span></div><div class="mini-app">${content}</div><nav class="mini-bottom"><button class="${active==="home"?"active":""}" data-action="go" data-target="mini-home">${icon("search",19)}<span>检索</span></button><button class="${active==="report"?"active":""}" data-action="go" data-target="mini-report">${icon("report",19)}<span>报告</span></button><button class="${active==="ai"?"active":""}" data-action="go" data-target="mini-ai">${icon("spark",19)}<span>AI 问答</span></button></nav></div><aside class="mini-notes"><span class="kicker">MOBILE EXPERIENCE</span><h1>${tr("移动端三项核心能力", "Three essential mobile capabilities")}</h1><p>${tr("移动端只保留企业检索、报告查看和基于已购报告的 AI 对话；API、CLI、MCP 与复杂配置统一留在 Web 端。", "Mobile keeps company search, report viewing and report-grounded AI chat. Developer tools stay on the web.")}</p><div class="mini-checklist"><span>${icon("search",16)} 企业主体检索与确认</span><span>${icon("report",16)} 报告摘要与章节查看</span><span>${icon("spark",16)} 基于报告证据的 AI 问答</span><span>${icon("lock",16)} 不展示 API、CLI、MCP 与密钥</span></div><button class="button ghost" data-action="switch-mode" data-mode="web" data-target="home">返回 Web 原型</button></aside></main>${annotationPanel(current)}`;
}

function miniHeader(title, back) {
  return `<header class="mini-header">${back ? `<button data-action="go" data-target="${back}" aria-label="返回">‹</button>` : '<span class="mini-mark"><img src="assets/sqj-mark-v4.svg" alt=""></span>'}<strong>${title}</strong><button aria-label="更多">•••</button></header>`;
}

function renderMiniHome() {
  return miniShell(`${miniHeader("商情局")}<section class="mini-hero"><span>全球企业情报</span><h1>${tr("随时查企业，随时看报告。", "Research companies and reports anywhere.")}</h1><p>企业检索 · 报告摘要 · AI 问答</p><form data-form="mini-search"><div>${icon("search",18)}<input name="q" value="" placeholder="企业名称或注册号"/></div><button>检索</button></form></section><section class="mini-section"><div class="mini-title"><strong>常用国家与地区</strong><button>全部 ›</button></div><div class="mini-countries">${["🇨🇳 中国","🇭🇰 香港","🇺🇸 美国","🇸🇬 新加坡"].map(x=>`<button data-action="go" data-target="mini-search">${x}</button>`).join("")}</div></section><section class="mini-section"><div class="mini-title"><strong>最近报告</strong><button data-action="go" data-target="mini-report">查看全部 ›</button></div><article class="mini-report-card"><div class="mini-report-icon">${icon("report",22)}</div><div><strong>${state.selectedCompany.name}</strong><span>美国 · ${state.selectedModules.size} 个章节</span><small>已完成 · 2026-08-16</small></div><button data-action="go" data-target="mini-report">查看</button></article></section><section class="mini-mobile-ai-entry"><span>${icon("spark",20)}</span><div><strong>向报告提问</strong><p>AI 只读取你有权限的报告章节，并附带引用。</p></div><button data-action="go" data-target="mini-ai">开始对话</button></section>`, "mini-home", "home");
}

function renderMiniSearch() {
  return miniShell(`${miniHeader("确认企业主体", "mini-home")}<section class="mini-search-top"><div>${icon("search",17)}<input value="Northstar Components" aria-label="企业关键词"/></div><span>找到 3 个演示候选</span></section><section class="mini-results">${companies.map((c,i)=>`<article><div><span>${c.flag}</span><div><strong>${c.name}</strong><small>${c.country} · ${c.registration}</small><p>${c.address}</p></div></div><div><span class="status-pill ${c.status==="在营"?"ok":"muted"}">${c.status}</span><button data-action="mini-select-company" data-company="${c.id}">${i===0?"确认此主体":"查看"}</button></div></article>`).join("")}<div class="mini-tip">${icon("alert",16)} 同名企业不会仅凭名称合并。匹配不足时需补充注册号或地址。</div></section>`, "mini-search", "home");
}

function renderMiniCompany() {
  const selected = modules.filter(m=>state.selectedModules.has(m.code));
  const total = selected.reduce((s,m)=>s+m.price,0);
  return miniShell(`${miniHeader("选择调查模块", "mini-search")}<section class="mini-company-card"><div><span>${state.selectedCompany.flag}</span><div><strong>${state.selectedCompany.name}</strong><small>${state.selectedCompany.country} · ${state.selectedCompany.registration}</small></div></div><button>已确认</button></section><section class="mini-module-list"><div class="mini-title"><strong>可购模块</strong><span>演示价</span></div>${modules.map(m=>`<label class="mini-module ${m.state==="NO_COVERAGE"?"disabled":""}"><input type="checkbox" data-module="${m.code}" ${state.selectedModules.has(m.code)?"checked":""} ${m.state==="NO_COVERAGE"?"disabled":""}/><div class="module-code ${m.tone}">${m.code}</div><div><strong>${m.name}</strong><small>${m.short}</small>${stateBadge(m.state)}</div><b>${m.state==="NO_COVERAGE"?"—":money(m.price)}</b></label>`).join("")}</section><div class="mini-checkout-bar"><div><span>已选 ${selected.length} 项</span><strong>${money(total)}</strong><small>正式价格待确认</small></div><button data-action="mini-pay">演示支付</button></div>`, "mini-company", "home");
}

function renderMiniProgress() {
  return miniShell(`${miniHeader("报告生成", "mini-company")}<section class="mini-progress"><div class="mini-progress-ring"><span>${icon("check",30)}</span></div><h1>报告已生成</h1><p>模块数据、来源与引用锚点已保存</p><div class="mini-task-list">${[...state.selectedModules].map((code,i)=>`<div><span>${icon("check",15)}</span><strong>${code} ${modules.find(m=>m.code===code).name}</strong><small>${i===2?"NO_RECORD · 有效结果":"已完成"}</small></div>`).join("")}</div><button class="button primary wide" data-action="go" data-target="mini-report">查看报告摘要</button><button class="button ghost wide">开启完成通知</button></section>`, "mini-progress", "report");
}

function renderMiniReport() {
  const reportNames = reportCompanyNames();
  return miniShell(`${miniHeader("报告摘要", "mini-home")}<section class="mini-report-head"><span>${state.selectedCompany.flag}</span><h1>${reportNames.english}</h1>${reportNames.chinese ? `<h2>${reportNames.chinese}</h2>` : ""}<p>V1 · ${state.selectedModules.size} 个模块 · 2026-08-16</p><div><span>自动化标准版</span><span>数据快照</span></div></section><section class="mini-summary"><div class="mini-title"><strong>执行摘要</strong><button data-action="go" data-target="mini-ai">问 AI ›</button></div><article><span class="summary-label fact">报告事实</span><strong>主体识别已完成</strong><p>已按国家、注册号和地址确认演示主体。</p></article><article><span class="summary-label rule">规则提示</span><strong>制裁筛查未发现记录</strong><p>NO_RECORD 是有效核查结果，不代表未来永久无风险。</p></article><article><span class="summary-label ai">AI 归纳</span><strong>两项信息建议继续核对</strong><p>财务年度有缺口；M10 暂无可靠覆盖。</p></article></section><section class="mini-chapters"><div class="mini-title"><strong>报告章节</strong><span>${state.selectedModules.size} 已购</span></div>${modules.map(m=>`<button class="${state.selectedModules.has(m.code)?"":"locked"}"><span>${m.code}</span><div><strong>${m.name}</strong><small>${state.selectedModules.has(m.code)?m.coverage:"未购买 / 无覆盖"}</small></div>${state.selectedModules.has(m.code)?icon("chevron",16):icon("lock",14)}</button>`).join("")}</section>`, "mini-report", "report");
}

function renderMiniAi() {
  return miniShell(`${miniHeader("AI 调查员", "mini-report")}<section class="mini-ai-context"><span>${icon("report",17)}</span><div><strong>${state.selectedCompany.name}</strong><small>V1 · ${state.selectedModules.size} 个已购章节 · 未联网</small></div></section><section class="mini-ai-chat"><div class="mini-ai-bubble assistant"><span>${icon("spark",14)}</span><p>我只会读取当前报告。你想先看主体、控制权，还是制裁筛查？</p></div><div class="mini-question-row"><button data-action="mini-ai-question">三个主要问题</button><button data-action="mini-ai-question">是否命中制裁</button></div><div class="mini-ai-bubble user"><p>是否命中制裁名单？</p></div><div class="mini-ai-bubble assistant"><span>${icon("spark",14)}</span><div><p>当前 M08 章节记录为 <strong>NO_RECORD</strong>：在报告列明的演示名单范围与查询时点内，未发现命中记录。这不等同于永久无风险。</p><button data-action="go" data-target="mini-report"><span>M08 · 制裁与合规</span><strong>查看报告引用 ›</strong></button></div></div></section><form class="mini-ai-input" data-form="mini-ai"><input name="question" placeholder="向当前报告提问…"/><button aria-label="发送问题">${icon("arrow",17)}</button></form>`, "mini-ai", "ai");
}

function renderApiDocsLegacy() {
  return apiShell(`<section class="simple-page-head"><span class="kicker">DOCUMENTATION</span><h1>快速开始</h1><p>原型仅展示文档信息架构：HMAC 签名、幂等、统一状态、错误码与版本记录。</p></section><section class="docs-layout"><aside><button class="active">快速开始</button><button>鉴权与签名</button><button>统一响应</button><button>数据状态</button><button>错误码</button><button>幂等</button><button>变更日志</button></aside><article><span class="kicker">01 · FIRST REQUEST</span><h2>完成第一笔测试调用</h2><p>创建测试应用后，密钥明文只显示一次。请求包含时间戳、nonce、路径和请求体摘要。</p><pre><code>curl --request GET \\
  --url http://127.0.0.1:4190/open/v1/companies/search \\
  --header 'X-API-Key: sqj_test_2026_demo_key' \\
  --data 'q=Northstar&country=US'</code></pre><div class="docs-note">${icon("alert",18)} 这是可直接调用的本地 Mock 地址与测试凭证；正式域名与签名策略待上线前配置。</div></article></section>`, "api-docs");
}

function renderApiDocs() {
  return apiShell(`<section class="simple-page-head"><span class="kicker">GLOBALCHECK API DOCUMENTATION</span><h1>快速开始</h1><p>商情局直接使用全球查同一套 33 个接口、签名方式和返回契约。</p></section><section class="docs-layout"><aside><button class="active">快速开始</button><button>鉴权与签名</button><button>通用响应</button><button>错误码</button><button>计费标记 isCost</button><button>33 个接口</button><button>变更日志</button></aside><article><span class="kicker">01 · FIRST REQUEST</span><h2>调用全球查同源接口</h2><p>正式调用使用 HTTPS 请求头 X-API-Key；本地 Mock 只用于在上游凭证到位前跑通开发闭环。</p><pre><code>curl --request POST \
  --url https://api.globalcheck.com/api/v1/companies/search/resolve \
  --header 'X-API-Key: YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"name":"ACME Corporation","countryIso2":"US"}'</code></pre><div class="docs-note">${icon("alert",18)} 正式 API 与全球查一致；商情局本地 Mock 负责模拟相同业务响应，接入上游后替换 Provider，不改前台契约。</div></article></section>`, "api-docs");
}

function developerWorkspace(active, content) {
  return `<div class="developer-workspace portal-flat"><section class="developer-main">${content}</section></div>`;
}

function developerPageHead(kicker, title, description, action = "") {
  return `<header class="developer-page-head"><div><span>${kicker}</span><h1>${title}</h1><p>${description}</p></div>${action}</header>`;
}

function codePanel(title, code, copyLabel = "复制") {
  return `<article class="developer-code-card"><header><strong>${title}</strong><button data-action="copy-demo-code">${icon("report",15)} ${copyLabel}</button></header><pre><code>${code}</code></pre></article>`;
}

function renderApiConsoleV2() {
  const calls = [
    ["13:41","companiesSearchResolve","WEB","AVAILABLE",apiDemoCharge("companiesSearchResolve"),"118ms"],
    ["13:40","companiesProfile","API","AVAILABLE",apiDemoCharge("companiesProfile"),"306ms"],
    ["13:39","companiesSanctionsDetail","MCP","NO_RECORD",apiDemoCharge("companiesSanctionsDetail"),"482ms"],
    ["12:58","companiesOwnershipStructure","CLI","PROVIDER_ERROR",apiDemoCharge("companiesOwnershipStructure", false),"1.8s"]
  ];
  return apiShell(developerWorkspace("api-console",`${developerPageHead("DEVELOPER WORKSPACE","开发者工作台","统一管理应用、密钥、调用、文档和多种接入方式。",'<button class="dev-primary" data-action="go" data-target="api-keys">创建 API Key</button>')}<section class="developer-metrics">${[["API 余额",`¥${state.apiBalance.toLocaleString()}`,"成功调用后扣费"],["今日调用","1,580","较昨日 +12.4%"],["成功率","98.7%","不含业务无记录"],["P95 延迟","1.84s","测试环境"]].map(([label,value,note])=>`<article><small>${label}</small><strong>${value}</strong><span>${note}</span></article>`).join("")}</section><section class="developer-dashboard-grid"><article class="developer-chart"><header><div><strong>近 7 日调用趋势</strong><span>Web、API、CLI 与 MCP 统一计量</span></div><button data-action="go" data-target="api-usage">查看全部</button></header><div>${[42,61,52,78,68,86,72].map((height,index)=>`<i style="--h:${height}%"><b></b><span>${["一","二","三","四","五","六","日"][index]}</span></i>`).join("")}</div></article><article class="developer-access-card"><header><strong>接入方式</strong><span>同一套能力，多种调用入口</span></header>${[["API","HTTP / JSON","api-docs"],["CLI","本地脚本与自动化","api-cli"],["MCP","Agent 与大模型工具","api-mcp"]].map(([name,note,target])=>`<button data-action="go" data-target="${target}"><b>${name}</b><span>${note}</span>${icon("arrow",15)}</button>`).join("")}</article></section><section class="developer-table-card"><header><div><strong>最近调用</strong><span>请求渠道、数据状态、计费和耗时统一追踪</span></div><button data-action="go" data-target="api-usage">调用日志</button></header><div class="developer-table"><div class="head"><span>时间</span><span>OperationId</span><span>渠道</span><span>数据状态</span><span>计费</span><span>耗时</span></div>${calls.map((row)=>`<div><time>${row[0]}</time><code>${row[1]}</code><span>${row[2]}</span><em class="${row[3]==="PROVIDER_ERROR"?"danger":"ok"}">${row[3]}</em><strong>${row[4]}</strong><span>${row[5]}</span></div>`).join("")}</div></section>`),"api-console");
}

function renderApiKeys() {
  const reveal = state.apiKeyReveal ? `<div class="api-key-reveal"><span>${icon("alert",18)}</span><div><strong>请立即保存完整密钥，仅展示这一次</strong><code>${state.apiKeyReveal}</code><small>关闭或离开页面后将无法再次查看。</small></div><button data-action="copy-demo-code">复制密钥</button></div>` : "";
  return apiShell(developerWorkspace("api-keys",`${developerPageHead("CREDENTIALS","API Key 管理","创建、停用和轮换开发者调用凭证。",'<button class="dev-secondary" data-action="go" data-target="api-docs">查看鉴权文档</button>')}<section class="api-key-create"><label><span>密钥名称</span><input id="api-key-name" value="本地开发 Key" placeholder="例如：生产环境、数据分析服务" /></label><button class="dev-primary" data-action="create-api-key">创建密钥</button></section>${reveal}<section class="developer-table-card api-key-table"><header><div><strong>当前密钥</strong><span>${state.apiKeys.length} 个凭证 · 完整密钥不可重复查看</span></div><button data-action="rotate-api-key">轮换生产密钥</button></header><div class="developer-table"><div class="head"><span>名称</span><span>前缀</span><span>状态</span><span>最近使用</span><span>创建时间</span><span>操作</span></div>${state.apiKeys.map((key)=>`<div><span><b>${key.name}</b><small>${key.id}</small></span><code>${key.prefix}••••</code><em class="${key.status==="ACTIVE"?"ok":"muted"}">${key.status}</em><span>${key.lastUsed}</span><span>2026-08-23</span><button data-action="toggle-api-key" data-key="${key.id}">${key.status==="ACTIVE"?"停用":"启用"}</button></div>`).join("")}</div></section><section class="credential-guidance"><article>${icon("shield",20)}<div><strong>服务端保存</strong><p>使用环境变量或密钥管理服务，不要写入浏览器、本地仓库或截图。</p></div></article><article>${icon("clock",20)}<div><strong>定期轮换</strong><p>建议生产密钥每 90 天轮换，并在调用日志中核对异常来源。</p></div></article><article>${icon("api",20)}<div><strong>权限隔离</strong><p>测试与生产应用分别创建密钥，配置独立额度和 IP 白名单。</p></div></article></section>`),"api-keys");
}

function renderApiUsage() {
  const operationIds = ["companiesSearchResolve","companiesProfile","companiesSanctionsDetail","companiesOwnershipStructure"];
  const rows = Array.from({length:12},(_,index)=>{
    const operationId = operationIds[index%4];
    const failed = index === 7;
    return [`SQJ-REQ-${String(8241-index).padStart(6,"0")}`,["WEB","API","MCP","CLI"][index%4],operationId,failed?"PROVIDER_ERROR":"SUCCESS",apiDemoCharge(operationId,!failed),`${118+index*37}ms`,`08-${String(23-Math.floor(index/5)).padStart(2,"0")} ${13-(index%5)}:${String(41-index).padStart(2,"0")}`];
  });
  return apiShell(developerWorkspace("api-usage",`${developerPageHead("USAGE & OBSERVABILITY","调用与用量","按渠道、时间和 OperationId 查看请求、计费与返回状态。")}<section class="usage-filter"><label>${icon("search",16)}<input placeholder="搜索 Request ID 或 OperationId" /></label><button>全部渠道</button><button>最近 30 天</button><button>全部状态</button></section><section class="developer-table-card"><header><div><strong>调用记录</strong><span>第 1 页 · 每页 20 条</span></div><button data-action="copy-demo-code">导出 CSV</button></header><div class="developer-table usage"><div class="head"><span>请求 ID</span><span>渠道</span><span>OperationId</span><span>状态</span><span>计费</span><span>耗时</span><span>请求时间</span></div>${rows.map((row)=>`<div><code>${row[0]}</code><span>${row[1]}</span><code>${row[2]}</code><em class="${row[3]==="SUCCESS"?"ok":"danger"}">${row[3]}</em><strong>${row[4]}</strong><span>${row[5]}</span><time>${row[6]}</time></div>`).join("")}</div></section>`),"api-usage");
}

function renderApiDocsV2() {
  const curl = `curl --request POST \\\n+  --url https://api.globalcheck.com/api/v1/companies/search/resolve \\\n+  --header 'X-API-Key: YOUR_API_KEY' \\\\\n+  --header 'Content-Type: application/json' \\\n+  --data '{"name":"ACME Corporation","countryIso2":"US"}'`;
  return apiShell(developerWorkspace("api-docs",`${developerPageHead("DOCUMENTATION","API 文档","从鉴权、首个请求到统一响应，快速接入全球查同源的 33 个接口。",'<button class="dev-primary" data-action="go" data-target="api-market">浏览接口</button>')}<section class="docs-quick-grid">${[["01","创建凭证","为测试与生产环境创建独立 API Key","api-keys"],["02","完成首个请求","使用 HTTPS 请求头 X-API-Key 发起调用","api-detail?code=companiesSearchResolve"],["03","处理统一状态","区分业务无记录、无覆盖与系统异常","api-usage"]].map(([n,title,note,target])=>`<button data-action="go" data-target="${target}"><i>${n}</i><span><strong>${title}</strong><small>${note}</small></span>${icon("arrow",15)}</button>`).join("")}</section><section class="docs-two-column"><article class="docs-auth-card"><span>AUTHENTICATION</span><h2>签名与请求约定</h2><p>正式接口与全球查保持同一 OperationId、路径、参数和返回契约。密钥只用于服务端调用。</p><dl><div><dt>clientKey</dt><dd>客户调用凭证</dd></div><div><dt>timestamp</dt><dd>Unix 秒级时间戳</dd></div><div><dt>sign</dt><dd>按全球查签名规则计算</dd></div><div><dt>isCost</dt><dd>本次请求是否计费</dd></div></dl><a href="#/api-keys">管理 API Key ${icon("arrow",14)}</a></article>${codePanel("首个 API 请求",curl)}</section><section class="docs-contract-grid"><article><span>200</span><strong>AVAILABLE</strong><p>请求成功并返回有效业务数据，按接口规则计费。</p></article><article><span>200</span><strong>NO_RECORD</strong><p>完成查询但没有发现记录，属于有效业务结果。</p></article><article><span>200</span><strong>NO_COVERAGE</strong><p>当前国家、主体或字段暂未覆盖，不生成推测内容。</p></article><article><span>5xx</span><strong>SYSTEM / PROVIDER ERROR</strong><p>系统或上游异常不计费，并保留 requestId 便于追踪。</p></article></section><section class="docs-resource-list"><header><div><strong>开发资源</strong><span>同一套企业数据能力，按你的技术栈接入</span></div></header>${[["API 接口目录","33 个全球查同源接口与详细契约","api-market"],["CLI 命令行","批量查询与自动化脚本","api-cli"],["MCP 工具","让 Agent 直接调用企业数据能力","api-mcp"],["调用日志","统一排查请求、计费和异常","api-usage"]].map(([title,note,target])=>`<button data-action="go" data-target="${target}"><strong>${title}</strong><span>${note}</span>${icon("chevron",15)}</button>`).join("")}</section>`),"api-docs");
}

function renderApiCli() {
  const install = `python -m venv .venv\nsource .venv/bin/activate\npip install shangqingju-cli`;
  const config = `export SQJ_API_BASE_URL=https://api.globalcheck.com\nexport SQJ_API_KEY=YOUR_API_KEY`;
  const commands = `sqj company resolve --name "ACME Corporation" --country US\nsqj company profile --eid EID-DEMO-0001\nsqj company sanctions --eid EID-DEMO-0001 --output result.json`;
  return apiShell(developerWorkspace("api-cli",`${developerPageHead("COMMAND LINE","CLI 接入","面向研发、数据分析和自动化任务的轻量命令行工具。",'<button class="dev-primary" data-action="copy-demo-code">下载 CLI</button>')}<section class="cli-steps"><article><i>1</i><div><strong>准备 Python 环境</strong><p>支持 Python 3.11+，建议在独立虚拟环境中安装。</p></div></article><article><i>2</i><div><strong>配置凭证</strong><p>通过环境变量传入密钥，不在命令历史中暴露。</p></div></article><article><i>3</i><div><strong>调用企业能力</strong><p>输出 JSON，方便连接脚本、数据管道和 CI 任务。</p></div></article></section>${codePanel("安装 CLI",install)}${codePanel("配置环境变量",config)}${codePanel("常用命令",commands)}<section class="cli-command-list"><header><strong>可用命令</strong><span>与 API 市场中的接口保持同源映射</span></header>${apiProducts.slice(0,8).map((item)=>`<button data-action="api-detail" data-api="${item.code}"><code>sqj ${item.code.replace(/[A-Z]/g,(m)=>`-${m.toLowerCase()}`)}</code><span>${item.name}</span>${icon("arrow",14)}</button>`).join("")}</section>`),"api-cli");
}

function renderApiMcp() {
  const config = `{\n  "mcpServers": {\n    "shangqingju": {\n      "command": "sqj-mcp-server",\n      "env": {\n        "SQJ_API_KEY": "YOUR_API_KEY"\n      }\n    }\n  }\n}`;
  const example = `{\n  "tool": "get_company_sanctions_detail",\n  "arguments": { "eid": "EID-DEMO-0001" }\n}`;
  return apiShell(developerWorkspace("api-mcp",`${developerPageHead("MODEL CONTEXT PROTOCOL","MCP 工具","让支持 MCP 的 Agent 在权限和计费边界内调用企业数据能力。",'<button class="dev-primary" data-action="go" data-target="api-keys">配置凭证</button>')}<section class="mcp-overview"><article><span>${icon("spark",23)}</span><div><strong>面向 Agent 的企业数据工具</strong><p>工具只包装已有 API，不改变数据来源、返回契约和计费规则。</p></div></article><article><span>${icon("shield",23)}</span><div><strong>权限可控、调用可追踪</strong><p>每次调用都绑定应用、API Key 和 requestId，可在用量中心审计。</p></div></article><article><span>${icon("database",23)}</span><div><strong>全局与国内数据库隔离</strong><p>查询时明确数据库范围，不自动混合两个独立数据源。</p></div></article></section><section class="docs-two-column mcp-config"><article class="mcp-install"><span>SETUP</span><h2>三步接入</h2><ol><li><b>01</b><span>安装 <code>sqj-mcp-server</code></span></li><li><b>02</b><span>创建独立的 Agent API Key</span></li><li><b>03</b><span>把右侧配置加入 MCP Client</span></li></ol><button data-action="copy-demo-code">复制安装命令</button></article>${codePanel("MCP Client 配置",config)}</section>${codePanel("工具调用示例",example)}<section class="mcp-tool-grid"><header><strong>可用工具</strong><span>以下工具映射商情局已开放的企业数据接口</span></header>${apiProducts.slice(0,9).map((item)=>`<button data-action="api-detail" data-api="${item.code}"><span>${item.group}</span><strong>get_${item.code.replace(/[A-Z]/g,(m)=>`_${m.toLowerCase()}`)}</strong><small>${item.name}</small>${icon("arrow",14)}</button>`).join("")}</section>`),"api-mcp");
}

function renderApiMarketStructured() {
  const keyword = state.apiSearch.trim().toLowerCase();
  const categoryCounts = apiProducts.reduce((counts,item)=>({ ...counts,[item.group]:(counts[item.group]||0)+1 }),{});
  const groupCopy = {
    "自然人主体信息":"自然人身份识别、任职和参股关系",
    "主体识别与基础信息":"企业身份解析、基础档案与公开联系方式",
    "股权、组织架构与控制权":"股东、受益所有人、投资和控制链路",
    "司法、合规与负面风险":"司法案件、行政处罚、负面信号与法律事件",
    "知识产权与科创资产":"专利、商标、创新指标、交易和诉讼",
    "经营表现与财务运营":"财务数据、经营信号、事件时间线与采购记录",
    "国际合规与制裁筛查":"制裁、PEP、出口管制与所有权延伸筛查",
    "专项风险与交易情报":"KYB、并购交易与网络安全专项数据"
  };
  const selectedGroup = state.apiFilter !== "ALL" ? state.apiFilter : null;
  const filtered = apiProducts.filter((item)=>(!selectedGroup || item.group===selectedGroup) && (!keyword || [item.name,item.code,item.endpoint,item.group,item.desc,...item.tags].join(" ").toLowerCase().includes(keyword)));
  const pageSize = 10;
  const totalPages = Math.max(1,Math.ceil(filtered.length/pageSize));
  const page = Math.min(state.apiPage,totalPages);
  const pageItems = filtered.slice((page-1)*pageSize,page*pageSize);
  const categories = apiGroups.map((group)=>{
    const items = apiProducts.filter((item)=>item.group===group);
    const getCount = items.filter((item)=>item.method==="GET").length;
    const postCount = items.length-getCount;
    return `<button class="api-category-card" data-action="api-filter" data-filter="${group}"><span class="api-category-icon">${icon(group.includes("风险")||group.includes("制裁")?"shield":group.includes("自然人")?"user":group.includes("股权")?"database":"api",21)}</span><div><small>API CATEGORY</small><h2>${group}</h2><p>${groupCopy[group] || "浏览该分类下的全球企业数据接口。"}</p><ul>${items.slice(0,3).map((item)=>`<li>${item.name}</li>`).join("")}</ul></div><footer><span><b>${items.length}</b> 个接口</span><span>${postCount} POST${getCount?` · ${getCount} GET`:""}</span>${icon("arrow",16)}</footer></button>`;
  }).join("");
  const rows = pageItems.map((item)=>`<button class="api-directory-row" data-action="api-detail" data-api="${item.code}"><b class="method-${item.method.toLowerCase()}">${item.method}</b><span class="api-directory-name"><strong>${item.name}</strong><small>${item.desc}</small></span><span class="api-directory-contract"><code>${item.code}</code><code>${item.endpoint}</code></span><span class="api-directory-price"><small>成功调用</small><strong>${item.price===0?"免费":`${apiMoney(item.price)}/次`}</strong></span><span class="api-directory-open">查看详情 ${icon("arrow",14)}</span></button>`).join("");
  const pageButtons = Array.from({length:totalPages},(_,index)=>index+1).map((number)=>`<button class="${number===page?"active":""}" data-action="api-page" data-page="${number}">${number}</button>`).join("");
  const directory = `<section class="api-category-landing"><header><div><span>API CATALOG</span><h1>选择 API 分类</h1><p>先按业务领域进入分类，再查看其中的接口清单。单个接口的参数、返回字段、调用示例和计费说明均在详情页展开。</p></div><b>8 个分类 · 33 个 API</b></header><div class="api-category-grid">${categories}</div></section>`;
  const list = `<section class="api-directory-page"><header class="api-directory-head"><div><button data-action="api-filter" data-filter="ALL">全部分类</button><span>/</span><strong>${keyword?"搜索结果":selectedGroup||"所有 API"}</strong></div><em>共 ${filtered.length} 个接口</em></header><div class="api-directory-columns"><span>请求</span><span>接口名称</span><span>OperationId / Endpoint</span><span>计费</span><span></span></div><div class="api-directory-list">${rows || '<div class="api-empty">暂无匹配接口，请调整搜索关键词。</div>'}</div>${totalPages>1?`<nav class="gc-api-pagination" aria-label="API 列表分页"><span>第 ${page} 页 / 共 ${totalPages} 页</span><button data-action="api-page" data-page="${Math.max(1,page-1)}" ${page===1?"disabled":""}>上一页</button>${pageButtons}<button data-action="api-page" data-page="${Math.min(totalPages,page+1)}" ${page===totalPages?"disabled":""}>下一页</button></nav>`:""}</section>`;
  const sidebar = `<aside class="gc-api-sidebar"><div class="gc-api-sidebar-title"><span>${icon("api",22)}</span><div><strong>API 分类</strong><small>33 CAPABILITIES</small></div></div><button class="gc-api-layer ${!selectedGroup?"active":""}" data-action="api-filter" data-filter="ALL"><span>${icon("database",17)}全部分类</span><b>${apiGroups.length}</b></button>${apiGroups.map((group)=>`<button class="gc-api-layer ${selectedGroup===group?"active":""}" data-action="api-filter" data-filter="${group}"><span>${icon(group.includes("风险")||group.includes("制裁")?"shield":group.includes("自然人")?"user":"report",17)}${group}</span><b>${categoryCounts[group]}</b></button>`).join("")}</aside>`;
  return apiShell(`<div class="gc-api-market-shell api-catalog-shell">${sidebar}<section class="gc-api-main"><div class="gc-api-toolbar api-catalog-toolbar"><div><span>GLOBAL DATA API CATALOG</span><h1>数据 API 市场</h1><p>这里是全球查同源 API 的能力目录，用于发现、比较和进入技术详情，不按报告模块方式购买。</p></div><form class="gc-api-search" data-form="api-search">${icon("search",18)}<input name="apiSearch" value="${state.apiSearch}" placeholder="搜索 API 名称、OperationId 或接口路径" /><button type="submit">搜索</button>${state.apiSearch?'<button type="button" data-action="api-clear-search">清空</button>':""}</form></div>${!selectedGroup&&!keyword?directory:list}<div class="gc-api-source-note">${icon("shield",19)}<div><strong>市场与技术文档的边界</strong><p>API 市场用于找到接口；点击具体 API 后，再查看概览、请求参数、返回字段、代码示例与每次调用的计费规则。</p></div></div></section></div>${renderApiPurchasePanel()}`,"api-market");
}

function renderApiConsoleStructured() {
  return renderApiConsoleV2()
    .replace("DEVELOPER WORKSPACE", "DEVELOPER CENTER")
    .replace("开发者工作台", "开发者中心")
    .replace("统一管理应用、密钥、调用、文档和多种接入方式。", "开通接口后，在这里管理应用、凭证、余额、调用记录与运行状态。");
}

function renderApiDocsStructured() {
  const fullDirectory = apiGroups.map((group)=>{
    const items = apiProducts.filter((item)=>item.group===group);
    return `<section class="api-doc-group-block"><header><div><strong>${group}</strong><span>${items.length} 个接口</span></div><small>${items.map((item)=>item.name).slice(0,3).join(" · ")}</small></header><div>${items.map((item)=>`<button data-action="api-detail" data-api="${item.code}"><b class="method-${item.method.toLowerCase()}">${item.method}</b><span><strong>${item.name}</strong><code>${item.code}</code></span><code class="endpoint">${item.endpoint}</code><p>${item.desc}</p><em>${item.price===0?"免费":`${apiMoney(item.price)}/次`}</em>${icon("chevron",14)}</button>`).join("")}</div></section>`;
  }).join("");
  const curl = `curl --request POST \
  --url https://api.globalcheck.com/api/v1/companies/search/resolve \
  --header 'X-API-Key: YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"name":"ACME Corporation","countryIso2":"US"}'`;
  const content = `${developerPageHead("API DOCUMENTATION","API 文档","通过稳定的 HTTP 接口调用 33 个全球企业数据能力。",'<button class="dev-secondary" data-action="go" data-target="api-market">购买与开通</button>')}
    <nav class="docs-channel-tabs"><button class="active">${icon("database",15)} 数据查询 API</button><button data-action="go" data-target="api-cli">${icon("api",15)} CLI</button><button data-action="go" data-target="api-mcp">${icon("spark",15)} MCP 工具</button></nav>
    <section class="docs-two-column docs-reference-intro"><article class="docs-auth-card"><span>AUTHENTICATION</span><h2>统一的对客鉴权契约</h2><p>客户仅通过 HTTPS 请求头 <code>X-API-Key</code> 调用商情局；全球查等上游凭证由服务端 Provider Adapter 管理，不向浏览器或客户系统暴露。</p><dl><div><dt>请求头</dt><dd>X-API-Key</dd></div><div><dt>密钥隔离</dt><dd>测试与生产分别创建</dd></div><div><dt>安全能力</dt><dd>作用域、额度、IP 白名单、轮换与审计</dd></div><div><dt>计费方式</dt><dd>按成功且可计费结果扣人民币余额</dd></div></dl><a href="#/api-keys">管理 API Key ${icon("arrow",14)}</a></article>${codePanel("数据查询 API 调用示例",curl)}</section>
    <section class="api-doc-full-directory compact-reference"><header><div><span>API REFERENCE</span><h2>数据查询 API</h2><p>共 33 个接口。点击任一项进入详情，查看 Schema、请求参数、返回字段、代码示例、CLI、MCP 与测试调用。</p></div><b>23 POST · 10 GET</b></header>${fullDirectory}</section>`;
  return apiShell(developerWorkspace("api-docs",content),"api-docs");
}

function renderApiCliStructured() {
  const commands = `<section class="cli-command-list full-capability-list"><header><strong>33 个可用命令</strong><span>每个命令与 API OperationId 一一对应</span></header>${apiProducts.map((item)=>`<button data-action="api-detail" data-api="${item.code}"><code>sqj ${item.code.replace(/[A-Z]/g,(m)=>`-${m.toLowerCase()}`)}</code><span>${item.name}</span><small>${item.group}</small>${icon("arrow",14)}</button>`).join("")}</section>`;
  return renderApiCli()
    .replace("面向研发、数据分析和自动化任务的轻量命令行工具。", "CLI 是 33 个接口的命令行适配器，适合研发联调、批量查询、脚本和自动化任务；不产生新的数据能力或计费规则。")
    .replace(/<section class="cli-command-list">[\s\S]*?<\/section>/,commands);
}

function renderApiMcpStructured() {
  const tools = `<section class="mcp-tool-grid full-capability-list"><header><strong>33 个 MCP 工具</strong><span>每个工具映射同一套 API 权限、计费和日志</span></header>${apiProducts.map((item)=>`<button data-action="api-detail" data-api="${item.code}"><span>${item.group}</span><strong>get_${item.code.replace(/[A-Z]/g,(m)=>`_${m.toLowerCase()}`)}</strong><small>${item.name}</small>${icon("arrow",14)}</button>`).join("")}</section>`;
  return renderApiMcp()
    .replace("让支持 MCP 的 Agent 在权限和计费边界内调用企业数据能力。", "MCP 把同一套 33 个接口包装成 Agent 工具，继续共用 API Key、余额、计费规则与调用日志。")
    .replace(/<section class="mcp-tool-grid">[\s\S]*?<\/section>/,tools);
}

function resetDemo() {
  state.mode = "web";
  state.loggedIn = false;
  state.adminLoggedIn = false;
  state.adminReturnAfterLogin = null;
  state.customer = null;
  state.returnAfterLogin = null;
  state.pendingPurchase = null;
  state.checkoutAttemptId = null;
  state.paymentMethod = "WECHAT";
  state.invoiceRequested = false;
  state.invoiceType = "VAT_ORDINARY";
  state.invoiceProfile = { title: "", taxId: "", registeredAddress: "", registeredPhone: "", bankName: "", bankAccount: "", email: "" };
  state.invoiceApplicationOpen = false;
  state.invoiceApplicationOrders = new Set(["SQJ-ORD-DEMO-2408"]);
  state.invoicedOrderIds = new Set();
  state.lastInvoiceApplication = null;
  state.accountBalance = 568;
  state.rechargeOpen = false;
  state.rechargeAmount = 100;
  state.rechargeMethod = "WECHAT";
  state.paymentBusy = false;
  state.lastOrder = null;
  state.insightPage = 1;
  state.selectedCompany = companies[0];
  state.selectedModules = new Set(["M01", "M03", "M08"]);
  state.progressStep = 0;
  state.progressTimerActive = false;
  state.annotationOpen = false;
  state.apiFilter = "ALL";
  state.apiSearch = "";
  state.apiPage = 1;
  state.apiBalance = 8420;
  state.apiPurchaseOpen = false;
  state.apiPurchaseProduct = null;
  state.apiRechargeAmount = 800;
  state.apiPaymentMethod = "WECHAT";
  state.apiPurchaseBusy = false;
  state.apiLastPurchase = null;
  state.apiKeys = [
    { id:"KEY-DEMO-01", name:"默认开发应用", prefix:"sqj_test_M8K2", status:"ACTIVE", lastUsed:"今天 13:41" },
    { id:"KEY-DEMO-02", name:"本地联调", prefix:"sqj_test_D7P4", status:"ACTIVE", lastUsed:"2026-08-19 15:22" },
  ];
  state.apiKeyReveal = null;
  state.adminModels = defaultAdminModels.map((item)=>({...item}));
  state.adminModelFormOpen = false;
  state.adminModelEditingId = null;
  state.adminSources = defaultAdminSources.map((item)=>({...item}));
  state.adminSourceFormOpen = false;
  state.adminSourceEditingId = null;
  state.adminSubtabByRoute = {};
  state.adminDrawer = null;
  state.searchScope = "GLOBAL";
  state.searchQuery = "Northstar Components";
  state.searchResults = companies;
  state.searchDataState = "AMBIGUOUS";
  state.mockStatus = "unknown";
  state.mockRequestId = null;
  state.searchProvider = null;
  state.mockTask = null;
  state.mockReportId = null;
  state.aiMessages = [{ role: "assistant", text: "我只读取当前报告已购章节。你可以问我主体身份、控制权、制裁命中或后续核查建议。" }];
  go("home");
  toast("演示状态已重置");
}

async function askAi(question) {
  if (!question.trim()) return;
  state.aiMessages.push({ role: "user", text: question.trim() });
  if (state.mockReportId) {
    render();
    try {
      const payload = await callMockApi(`/open/v1/reports/${state.mockReportId}/questions`, {
        method: "POST",
        body: JSON.stringify({ question: question.trim() }),
      });
      const evidence = payload.data.citations?.[0];
      state.aiMessages.push({
        role: "assistant",
        text: payload.data.answer,
        citation: evidence ? {
          section: evidence.chapter === "00" ? "section-summary" : `section-${evidence.chapter}`,
          label: `${evidence.chapter} · ${evidence.path} · Mock API`,
          quote: evidence.quote,
        } : null,
      });
      state.mockRequestId = payload.requestId;
      render();
      return;
    } catch (error) {
      toast(`Mock AI 暂不可用，已切换本地演示：${error.message}`);
    }
  }
  let answer = "当前报告没有足够证据回答这个问题。我不会联网补充或猜测。你可以增购相关模块，或上传一份授权文件。";
  let citation = null;
  if (/制裁|名单/.test(question)) {
    answer = "当前 M08 章节记录为 NO_RECORD：在报告列明的演示名单范围和查询时点内，未发现命中记录。这是有效核查结果，但不代表未来永久无风险。";
    citation = { section: "section-M08", label: "M08 · 制裁与合规 · 第 12 页", quote: "筛查结果：未发现命中记录" };
  } else if (/控制|股东|受益/.test(question)) {
    answer = "报告显示演示直接股东持股 82.0%，但最终受益人资料披露受限，现有证据不足以确认最终自然人控制者。建议补充官方登记或合规文件。";
    citation = { section: "section-M03", label: "M03 · 股东与控制权 · 第 8 页", quote: "最终受益人：资料披露受限，需进一步核验" };
  } else if (/问题|核查|风险/.test(question)) {
    answer = "建议优先核对：① 财务数据缺失年度的审计材料；② M10 暂无覆盖的知识产权与网络风险；③ 最终受益人披露受限。以上是基于当前已购章节的归纳。";
    citation = { section: "section-summary", label: "执行摘要 · 第 2 页", quote: "需人工关注：2 项数据缺口与待核对" };
  }
  state.aiMessages.push({ role: "assistant", text: answer, citation });
  render();
  setTimeout(() => document.querySelector(".ai-messages")?.scrollTo({ top: 9999, behavior: "smooth" }), 50);
}

async function createReportViaMock() {
  const payload = await callMockApi("/open/v1/report-tasks", {
    method: "POST",
    headers: { "Idempotency-Key": `prototype-${state.selectedCompany.id}-${[...state.selectedModules].sort().join("-")}` },
    body: JSON.stringify({ companyId: state.selectedCompany.id, modules: [...state.selectedModules] }),
  });
  state.mockTask = payload.data;
  state.mockReportId = payload.data.reportId;
  state.mockRequestId = payload.requestId;
  state.mockStatus = "online";
  state.progressStep = 0;
  state.progressTimerActive = true;
  go("progress");

  while (route().name === "progress" && state.mockTask?.status !== "COMPLETED") {
    await new Promise((resolve) => setTimeout(resolve, 450));
    const taskPayload = await callMockApi(`/open/v1/report-tasks/${state.mockTask.taskId}`);
    state.mockTask = taskPayload.data;
    state.progressStep = Math.min(5, Math.ceil(taskPayload.data.progress / 20));
    state.mockRequestId = taskPayload.requestId;
    if (route().name === "progress") render();
  }
  state.progressTimerActive = false;
}

async function handleClick(event) {
  const loginLink = event.target.closest('a[href="#/login"]');
  if (loginLink && route().name !== "login") {
    event.preventDefault();
    state.returnAfterLogin = location.hash.replace(/^#\/?/, "") || "home";
    go("login");
    return;
  }
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  if (action === "switch-mode") {
    state.mode = target.dataset.mode;
    go(target.dataset.target);
  } else if (action === "reset-demo") resetDemo();
  else if (action === "logout") completeLogout();
  else if (action === "admin-logout") completeAdminLogout();
  else if (action === "toggle-annotation") { state.annotationOpen = !state.annotationOpen; render(); }
  else if (action === "set-language") {
    state.locale = target.dataset.lang === "en" ? "en" : "zh";
    render();
    toast(state.locale === "en" ? "Interface switched to English" : "界面已切换为中文");
  }
  else if (action === "insight-filter") { state.insightChannel = target.dataset.filter || "ALL"; state.insightPage = 1; render(); }
  else if (action === "insight-page") { state.insightPage = Math.max(1, Number(target.dataset.page) || 1); render(); }
  else if (action === "login-mode") { state.loginMode = target.dataset.mode === "wechat" ? "wechat" : "sms"; render(); }
  else if (action === "send-code") {
    const mobile = String(document.querySelector('input[name="mobile"]')?.value || "").trim();
    try {
      const payload = await callMockApi("/open/v1/auth/sms-codes", { method:"POST", body:JSON.stringify({ mobile }) });
      toast(tr(`验证码已发送至 ${payload.data.mobileMasked}：原型码 123456`, `Code sent to ${payload.data.mobileMasked}: demo code 123456`));
    } catch (error) { toast(error.message); }
  }
  else if (action === "login-complete") {
    try {
      const payload = await callMockApi("/open/v1/auth/sessions", { method:"POST", body:JSON.stringify({ method:"WECHAT", qrToken:"demo-wechat-qr" }) });
      toast(tr("微信扫码登录成功（演示）", "WeChat sign-in successful (demo)"));
      completeLogin(payload.data);
    } catch (error) { toast(error.message); }
  }
  else if (action === "run-agent") {
    state.agentRunState = "running"; render();
    setTimeout(()=>{ state.agentRunState = "scheduled"; if (route().name === "admin-insights") { render(); toast("Agent 已完成新一轮市场扫描，5 篇候选进入人工复核"); } }, 1200);
  }
  else if (action === "publish-edition") toast("本期 5 篇文章已重新推送到一级市场与二级市场频道");
  else if (action === "search-scope") {
    state.searchScope = target.dataset.scope === "CN" ? "CN" : "GLOBAL";
    if (route().name === "home") render();
    else {
      state.searchQuery = state.searchScope === "CN" ? "上海青岚科技" : "Northstar Components";
      try {
        await searchViaMockApi(state.searchQuery);
        render();
      } catch (error) {
        state.mockStatus = "offline";
        state.searchResults = state.searchScope === "CN" ? [] : companies;
        state.searchDataState = state.searchResults.length ? "AMBIGUOUS" : "NO_RECORD";
        render();
        toast(`Mock API 未启动，查询范围已切换：${error.message}`);
      }
    }
  }
  else if (action === "quick-search") {
    const query = target.dataset.query || "Northstar Components";
    try {
      await searchViaMockApi(query);
      go("search?q=" + encodeURIComponent(query));
      toast("已从 Mock API 返回主体候选");
    } catch (error) {
      state.mockStatus = "offline";
      state.searchQuery = query;
      state.searchResults = companies;
      go("search?q=" + encodeURIComponent(query));
      toast(`Mock API 未启动，暂用内置数据：${error.message}`);
    }
  }
  else if (action === "select-company" || action === "mini-select-company") {
    state.selectedCompany = state.searchResults?.find((c) => c.id === target.dataset.company) || companies.find((c) => c.id === target.dataset.company) || companies[0];
    go(action === "mini-select-company" ? "mini-report" : "company");
  } else if (action === "toggle-module") {
    const code = target.dataset.module;
    if (state.selectedModules.has(code)) state.selectedModules.delete(code); else state.selectedModules.add(code);
    state.pendingPurchase = null;
    state.checkoutAttemptId = null;
    renderPreservingScroll();
  } else if (action === "select-recommended") {
    state.selectedModules = new Set(["M01", "M03", "M06", "M07", "M08"]);
    state.pendingPurchase = null;
    state.checkoutAttemptId = null;
    renderPreservingScroll();
    toast("已选择采购尽调组合（演示）");
  } else if (action === "to-checkout") {
    capturePendingPurchase();
    if (state.loggedIn) go("checkout");
    else {
      state.returnAfterLogin = "checkout";
      go("login");
      toast("请先登录；已选模块和金额会为你保留");
    }
  }
  else if (action === "select-payment") { state.paymentMethod = target.dataset.method || "WECHAT"; renderPreservingScroll(); }
  else if (action === "set-invoice") {
    state.invoiceRequested = target.dataset.value === "true";
    renderPreservingScroll();
    if (state.invoiceRequested) requestAnimationFrame(() => document.querySelector("#invoice-details")?.scrollIntoView({ behavior:"smooth", block:"nearest" }));
  }
  else if (action === "set-invoice-type") {
    state.invoiceType = target.dataset.type === "VAT_SPECIAL" ? "VAT_SPECIAL" : "VAT_ORDINARY";
    renderPreservingScroll();
  }
  else if (action === "save-invoice-checkout") {
    const missingFields = missingInvoiceFields();
    if (missingFields.length) return toast(`请补充${invoiceTypeLabel()}信息：${missingFields.join("、")}`);
    toast(`${invoiceTypeLabel()}信息已保存到个人中心，本次订单将继续使用`);
  }
  else if (action === "toggle-invoice-application") {
    state.invoiceApplicationOpen = !state.invoiceApplicationOpen;
    renderPreservingScroll();
    if (state.invoiceApplicationOpen) requestAnimationFrame(() => document.querySelector(".invoice-application")?.scrollIntoView({ behavior:"smooth", block:"start" }));
  }
  else if (action === "confirm-payment") {
    if (!state.loggedIn) {
      capturePendingPurchase();
      state.returnAfterLogin = "checkout";
      go("login");
      return toast("请先登录后再支付");
    }
    const quote = currentOrderQuote();
    const missingFields = state.invoiceRequested ? missingInvoiceFields() : [];
    if (missingFields.length) {
      document.querySelector("#invoice-details")?.scrollIntoView({ behavior:"smooth", block:"center" });
      return toast(`请补充${invoiceTypeLabel()}信息：${missingFields.join("、")}`);
    }
    state.paymentBusy = true;
    renderPreservingScroll();
    try {
      const orderPayload = await callMockApi("/open/v1/orders", {
        method: "POST",
        headers: { "Idempotency-Key": state.checkoutAttemptId || `order-${Date.now()}` },
        body: JSON.stringify({ customerId: state.customer?.id || "CUS-DEMO-0001", companyId: state.selectedCompany.id, modules: quote.selected.map((module)=>module.code), amount: quote.total, invoiceRequested: state.invoiceRequested, invoiceType: state.invoiceType, invoice: state.invoiceRequested ? state.invoiceProfile : null }),
      });
      const paymentPayload = await callMockApi(`/open/v1/orders/${orderPayload.data.orderId}/payments`, {
        method: "POST",
        body: JSON.stringify({ method: state.paymentMethod }),
      });
      const paymentLabels = { WECHAT:"微信支付", ALIPAY:"支付宝", BALANCE:"账户余额", BANK_TRANSFER:"其他方式（对公转账）" };
      state.lastOrder = { ...orderPayload.data, ...paymentPayload.data, paymentLabel: paymentLabels[state.paymentMethod] };
      if (state.paymentMethod === "BALANCE" && Number.isFinite(paymentPayload.data.balance)) state.accountBalance = paymentPayload.data.balance;
      if (state.invoiceRequested) {
        const application = await submitInvoiceApplication([orderPayload.data.orderId], quote.total, "CHECKOUT");
        state.lastOrder.invoiceApplication = application;
        state.lastOrder.invoice = application.invoice;
      }
      state.pendingPurchase = null;
      state.checkoutAttemptId = null;
      await createReportViaMock();
      toast(state.invoiceRequested ? "演示支付成功，开票申请已同步提交" : "演示支付成功，订单、支付记录和报告任务均已创建");
    } catch (error) {
      state.mockStatus = "offline";
      state.mockTask = null;
      state.progressStep = 0;
      state.progressTimerActive = false;
      go("progress");
      toast(`订单或报告任务创建失败，已降级为页面演示：${error.message}`);
    } finally {
      state.paymentBusy = false;
    }
  }
  else if (action === "finish-progress") { state.progressStep = 5; state.progressTimerActive = false; render(); }
  else if (action === "open-report") go("report");
  else if (action === "jump-account-reports") document.querySelector("#account-reports")?.scrollIntoView({ behavior:"smooth", block:"start" });
  else if (action === "jump-account-section") {
    target.closest("nav")?.querySelectorAll("button").forEach((button)=>button.classList.toggle("active", button === target));
    document.querySelector(`#${target.dataset.section}`)?.scrollIntoView({ behavior:"smooth", block:"start" });
  }
  else if (action === "go") go(target.dataset.target);
  else if (action === "print-report") await printReportPdf();
  else if (action === "jump-section") { document.querySelector(`#${target.dataset.section}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); }
  else if (action === "ask-ai") await askAi(target.dataset.question || "");
  else if (action === "show-lineage") toast("正式版将展示原始值、来源快照、转换版本与置信度");
  else if (action === "source-method") toast(tr("来源按监管、交易所、公司公告分级；所有摘要保留原文链接与抓取时间。", "Sources are ranked by authority; every summary keeps its original link and capture time."));
  else if (action === "app-download") toast(`${target.dataset.platform || "APP"} 下载地址将在正式上架后接入；当前为原型入口`);
  else if (action === "toggle-recharge") { state.rechargeOpen = !state.rechargeOpen; renderPreservingScroll(); }
  else if (action === "select-recharge-amount") { state.rechargeAmount = Math.max(1, Number(target.dataset.amount) || 100); renderPreservingScroll(); }
  else if (action === "select-recharge-method") { state.rechargeMethod = target.dataset.method || "WECHAT"; renderPreservingScroll(); }
  else if (action === "confirm-recharge") {
    try {
      const payload = await callMockApi(`/open/v1/customers/${state.customer?.id || "CUS-DEMO-0001"}/wallet/recharges`, { method:"POST", body:JSON.stringify({ amount:state.rechargeAmount, method:state.rechargeMethod }) });
      state.accountBalance = payload.data.balance;
      state.rechargeOpen = false;
      renderPreservingScroll();
      toast(`演示充值成功，当前余额 ${money(state.accountBalance)}`);
    } catch (error) { toast(error.message); }
  }
  else if (action === "api-filter") { state.apiFilter = target.dataset.filter || "ALL"; state.apiSearch = ""; state.apiPage = 1; render(); }
  else if (action === "api-page") { state.apiPage = Math.max(1, Number(target.dataset.page) || 1); render(); }
  else if (action === "api-clear-search") { state.apiSearch = ""; state.apiPage = 1; render(); }
  else if (action === "api-buy-from-account") {
    state.apiPurchaseProduct = null;
    state.apiPurchaseOpen = true;
    go("api-market");
  }
  else if (action === "api-detail") {
    const product = apiProducts.find((item)=>item.code === target.dataset.api);
    if (product) go(`api-detail?code=${encodeURIComponent(product.code)}`); else toast("接口详情暂不可用");
  }
  else if (action === "api-debug") toast(`${target.dataset.api || "API"} 在线调试成功：200 AVAILABLE · 118ms（Mock）`);
  else if (action === "api-favorite") toast("已收藏该 API，可在开发者控制台继续查看（演示）");
  else if (action === "api-buy") {
    const product = apiProducts.find((item)=>item.code === target.dataset.api);
    if (product?.price === 0) {
      if (!state.loggedIn) { state.returnAfterLogin = route().name; go("login"); return toast("请先登录，登录后可免费开通该接口"); }
      return toast(`${product.name} 已免费开通，可在开发者控制台创建密钥（演示）`);
    }
    state.apiPurchaseProduct = target.dataset.api || null;
    state.apiPurchaseOpen = true;
    renderPreservingScroll();
  }
  else if (action === "api-close-purchase") { state.apiPurchaseOpen = false; renderPreservingScroll(); }
  else if (action === "api-plan") { state.apiRechargeAmount = Number(target.dataset.points) || 800; renderPreservingScroll(); }
  else if (action === "api-payment") { state.apiPaymentMethod = target.dataset.method || "WECHAT"; renderPreservingScroll(); }
  else if (action === "api-free-trial") {
    if (!state.loggedIn) { state.returnAfterLogin = "api-market"; return go("login"); }
    state.apiBalance += 200;
    renderPreservingScroll();
    toast("¥200 API 试用金已到账，每个账户仅可领取一次（演示）");
  }
  else if (action === "confirm-api-purchase") {
    if (!state.loggedIn) {
      state.returnAfterLogin = "api-market";
      go("login");
      return toast("请先登录，API 预存金额和支付方式已为你保留");
    }
    const amounts = {200:200,800:800,2500:2500};
    state.apiPurchaseBusy = true;
    renderPreservingScroll();
    try {
      const payload = await callMockApi("/open/v1/api-balance-orders", { method:"POST", body:JSON.stringify({ customerId:state.customer?.id || "CUS-DEMO-0001", amount:amounts[state.apiRechargeAmount], method:state.apiPaymentMethod, apiCode:state.apiPurchaseProduct }) });
      state.apiBalance = payload.data.balance;
      state.apiLastPurchase = payload.data;
      state.apiPurchaseOpen = false;
      renderPreservingScroll();
      toast(`API 余额充值成功，当前余额 ¥${state.apiBalance.toLocaleString()}`);
    } catch (error) { toast(`API 余额订单创建失败：${error.message}`); }
    finally { state.apiPurchaseBusy = false; }
  }
  else if (action === "fake-key") toast("演示密钥：sk_test_sqj_demo_••••（不会创建真实凭证）");
  else if (action === "create-api-key") {
    const name = String(document.querySelector("#api-key-name")?.value || "新建密钥").trim() || "新建密钥";
    const suffix = String(Date.now()).slice(-4);
    state.apiKeyReveal = `sqj_test_${suffix}_D9M7K2P4X8R6`;
    state.apiKeys.unshift({ id:`KEY-DEMO-${suffix}`, name, prefix:`sqj_test_${suffix}`, status:"ACTIVE", lastUsed:"从未使用" });
    renderPreservingScroll();
    toast("API Key 已创建，请立即复制并安全保存");
  }
  else if (action === "toggle-api-key") {
    const key = state.apiKeys.find((item)=>item.id===target.dataset.key);
    if (key) key.status = key.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    renderPreservingScroll();
    toast(key?.status === "ACTIVE" ? "密钥已启用" : "密钥已停用");
  }
  else if (action === "rotate-api-key") toast("已创建密钥轮换任务：新旧密钥将并行保留 24 小时（演示）");
  else if (action === "copy-demo-code") toast("内容已复制到剪贴板（原型演示）");
  else if (action === "show-docs") go("api-docs");
  else if (action === "mini-pay") { go("mini-progress"); toast("演示微信支付成功"); }
  else if (action === "mini-ai-question") toast("移动端 AI 仅检索当前报告已购章节");
  else if (action === "open-admin-model-form") { state.adminModelEditingId = null; state.adminModelFormOpen = true; render(); }
  else if (action === "close-admin-model-form") { state.adminModelFormOpen = false; state.adminModelEditingId = null; render(); }
  else if (action === "edit-admin-model") { state.adminModelEditingId = target.dataset.id; state.adminModelFormOpen = true; render(); }
  else if (action === "toggle-admin-model") {
    const model = state.adminModels.find((item)=>item.id === target.dataset.id);
    if (model) { model.enabled = !model.enabled; if (!model.enabled) model.isDefault = false; render(); toast(`${model.name}已${model.enabled?"启用":"停用"}`); }
  }
  else if (action === "set-default-model") {
    state.adminModels.forEach((model)=>{ model.isDefault = model.id === target.dataset.id; });
    render(); toast("默认模型路由已更新");
  }
  else if (action === "open-admin-source-form") { state.adminSourceEditingId = null; state.adminSourceFormOpen = true; render(); }
  else if (action === "close-admin-source-form") { state.adminSourceFormOpen = false; state.adminSourceEditingId = null; render(); }
  else if (action === "edit-admin-source") { state.adminSourceEditingId = target.dataset.id; state.adminSourceFormOpen = true; render(); }
  else if (action === "toggle-admin-source") {
    const source = state.adminSources.find((item)=>item.id === target.dataset.id);
    if (source) { source.enabled = !source.enabled; render(); toast(`${source.name}已${source.enabled?"加入":"移出"}每日采集队列`); }
  }
  else if (action === "admin-review-open") {
    state.adminWorkflowModal = { kind:"review", id:target.dataset.id };
    renderPreservingScroll();
  }
  else if (action === "admin-review-decision") {
    const item = state.adminReviewItems.find(row=>row.id===target.dataset.id);
    const decision = target.dataset.decision;
    if (decision === "delete") state.adminReviewItems = state.adminReviewItems.filter(row=>row.id!==target.dataset.id);
    else if (item) item.status = decision === "approve" ? "已通过" : "已拒绝";
    state.adminWorkflowModal = null;
    renderPreservingScroll();
    toast(decision === "approve" ? "审核通过，文章已进入待发布队列" : decision === "delete" ? "文章已删除并写入操作日志" : "文章已拒绝，原因将反馈给 Agent");
  }
  else if (action === "admin-recollect") {
    state.adminCollectionRunning = true;
    renderPreservingScroll();
    setTimeout(()=>{ state.adminCollectionRunning = false; renderPreservingScroll(); toast("重新采集完成：发现 12 条线索，生成 5 篇新草稿（演示）"); }, 900);
  }
  else if (action === "admin-price-open") {
    state.adminWorkflowModal = { kind:"price", type:target.dataset.priceType || "report", id:target.dataset.id };
    renderPreservingScroll();
  }
  else if (action === "admin-task-open") {
    state.adminWorkflowModal = { kind:"task", id:target.dataset.id };
    renderPreservingScroll();
  }
  else if (action === "admin-task-retry") {
    state.adminWorkflowModal = null;
    renderPreservingScroll();
    toast(`${target.dataset.id} 已从失败步骤重新进入执行队列`);
  }
  else if (action === "admin-provider-test") toast("连接测试通过：鉴权有效，33 个接口契约可用，P95 118ms（演示）");
  else if (action === "admin-workflow-close") { state.adminWorkflowModal = null; renderPreservingScroll(); }
  else if (action === "admin-customer-detail") { state.adminWorkflowModal = { kind:"customer", id:target.dataset.id || "CUS-DEMO-0001" }; renderPreservingScroll(); }
  else if (action === "admin-order-detail") { state.adminWorkflowModal = { kind:"order", id:target.dataset.id || "ORD-RPT-0182" }; renderPreservingScroll(); }
  else if (action === "admin-invoice-detail") { state.adminWorkflowModal = { kind:"invoice", id:target.dataset.id || "INV-20260824-0182" }; renderPreservingScroll(); }
  else if (action === "admin-audit-filter") {
    state.adminAuditFilter = target.dataset.filter || "all";
    renderPreservingScroll();
  }
  else if (action === "admin-audit-detail") { state.adminWorkflowModal = { kind:"audit", id:target.dataset.id || "AUD-20260824-0001", action:target.dataset.auditAction || "CONFIG_UPDATE" }; renderPreservingScroll(); }
  else if (action === "admin-workflow-notice") {
    const message = target.dataset.message || "操作已完成（原型演示）";
    if (/的应用、密钥、余额和账单/.test(message)) { state.adminWorkflowModal = { kind:"customer", id:message.split(" 的应用")[0].replace("已打开 ","") }; renderPreservingScroll(); }
    else toast(message);
  }
  else if (action === "admin-subtab") {
    state.adminSubtabByRoute[route().name] = target.dataset.tab || "overview";
    render();
  }
  else if (action === "admin-config") {
    state.adminDrawer = { title:"创建配置变更", message:"配置变更需记录版本、审批人、生效时间与回滚方式。" };
    renderPreservingScroll();
  }
  else if (action === "admin-demo-action") {
    const message = target.dataset.message || "后台演示操作";
    if (/^查看 CUS-/.test(message)) { state.adminWorkflowModal = { kind:"customer", id:message.match(/CUS-[A-Z0-9-]+/)?.[0] || "CUS-DEMO-0001" }; renderPreservingScroll(); }
    else if (/^已打开订单 /.test(message)) { state.adminWorkflowModal = { kind:"order", id:message.match(/SQJ-(?:ORD|API)-[A-Z0-9]+/)?.[0] || "ORD-RPT-0182" }; renderPreservingScroll(); }
    else if (/^查看 INV-/.test(message)) { state.adminWorkflowModal = { kind:"invoice", id:message.match(/INV-[A-Z0-9-]+/)?.[0] || "INV-20260824-0182" }; renderPreservingScroll(); }
    else if (/字段差异、审批人与回滚记录/.test(message)) { state.adminWorkflowModal = { kind:"audit", id:`AUD-${Date.now()}`, action:message.match(/已打开 ([A-Z_]+)/)?.[1] || "CONFIG_UPDATE" }; renderPreservingScroll(); }
    else { state.adminDrawer = { title:message.replace(/[（(].*$/,""), message }; renderPreservingScroll(); }
  }
  else if (action === "close-admin-drawer") { state.adminDrawer = null; renderPreservingScroll(); }
  else if (action === "show-decisions") toast("待确认：价格、供应商许可、腾讯云主地域");
  else if (action === "clear-filters") toast("筛选条件已重置");
}

async function handleSubmit(event) {
  const type = event.target.dataset.form;
  if (!type) return;
  event.preventDefault();
  if (type === "search") {
    const query = String(new FormData(event.target).get("q") || "").trim();
    if (!query) return;
    toast("正在调用 Mock API 搜索企业…");
    try {
      await searchViaMockApi(query);
      go("search?q=" + encodeURIComponent(query));
    } catch (error) {
      state.mockStatus = "offline";
      state.searchQuery = query;
      state.searchResults = companies;
      state.searchDataState = "AMBIGUOUS";
      go("search?q=" + encodeURIComponent(query));
      toast(`Mock API 未启动，已使用内置备用数据：${error.message}`);
    }
  }
  else if (type === "api-search") {
    state.apiSearch = String(new FormData(event.target).get("apiSearch") || "").trim();
    state.apiPage = 1;
    render();
  }
  else if (type === "admin-model") {
    const form = new FormData(event.target);
    const values = { name:String(form.get("name") || "").trim(), modelCode:String(form.get("modelCode") || "").trim(), provider:String(form.get("provider") || "").trim(), dailyQuota:Math.max(0,Number(form.get("dailyQuota")) || 0), enabled:form.has("enabled"), publicFree:form.has("publicFree") };
    if (!values.name || !values.modelCode || !values.provider) return toast("请填写模型名称、Code 和服务商");
    const editing = state.adminModels.find((model)=>model.id === state.adminModelEditingId);
    if (editing) Object.assign(editing, values);
    else state.adminModels.push({ id:`MODEL-${Date.now()}`, ...values, isDefault:false });
    state.adminModelFormOpen = false;
    state.adminModelEditingId = null;
    render();
    toast(editing ? "模型配置已更新" : "AI 模型已加入路由池");
  }
  else if (type === "admin-source") {
    const form = new FormData(event.target);
    const values = { name:String(form.get("name") || "").trim(), url:String(form.get("url") || "").trim(), focus:String(form.get("focus") || "").trim(), modules:String(form.get("modules") || "其他"), weight:Math.min(100,Math.max(0,Number(form.get("weight")) || 0)), enabled:form.has("enabled") };
    if (!values.name || !/^https?:\/\//.test(values.url) || !values.focus) return toast("请填写来源名称、完整网址和重点领域");
    const editing = state.adminSources.find((source)=>source.id === state.adminSourceEditingId);
    if (editing) Object.assign(editing, values);
    else state.adminSources.push({ id:`SRC-${Date.now()}`, ...values });
    state.adminSourceFormOpen = false;
    state.adminSourceEditingId = null;
    render();
    toast(editing ? "来源配置已更新" : "重点线索来源已加入每日扫描");
  }
  else if (type === "admin-price") {
    const form = new FormData(event.target);
    const priceType = String(form.get("type") || "report");
    const id = String(form.get("id") || "");
    const list = priceType === "api" ? state.adminApiPrices : state.adminReportPrices;
    const item = list.find(row=>row.id===id);
    const original = Math.max(0,Number(form.get("list")) || 0);
    const discount = Math.min(100,Math.max(0,Number(form.get("discount")) || 0));
    if (!item) return toast("未找到需要调价的商品");
    item.list = original;
    item.discount = discount;
    state.adminWorkflowModal = null;
    renderPreservingScroll();
    toast(`${item.name}价格已保存为草稿：原价 ¥${original.toFixed(priceType==="api"?2:0)}，折扣 ${discount}%，折后 ¥${(original*discount/100).toFixed(priceType==="api"?2:0)}`);
  }
  else if (type === "admin-drawer") {
    const form = new FormData(event.target);
    const name = String(form.get("name") || state.adminDrawer?.title || "配置").trim();
    state.adminDrawer = null;
    renderPreservingScroll();
    toast(`${name}已保存，并生成演示审计记录`);
  }
  else if (type === "login") {
    const form = new FormData(event.target);
    const mobile = String(form.get("mobile") || "").trim();
    const code = String(form.get("code") || "").trim();
    if (!/^1\d{10}$/.test(mobile)) return toast("请输入正确的 11 位手机号");
    if (!/^\d{6}$/.test(code)) return toast("请输入 6 位验证码；原型可使用 123456");
    try {
      const payload = await callMockApi("/open/v1/auth/sessions", { method:"POST", body:JSON.stringify({ method:"SMS", mobile, code }) });
      toast("手机号登录成功（演示）");
      completeLogin(payload.data);
    } catch (error) { toast(error.message); }
  }
  else if (type === "admin-login") {
    const form = new FormData(event.target);
    const account = String(form.get("account") || "").trim();
    const password = String(form.get("password") || "").trim();
    if (account !== "operator" || password !== "123456") return toast("原型账号或密码不正确，可使用 operator / 123456");
    completeAdminLogin();
  }
  else if (type === "invoice-profile") {
    const missingFields = missingInvoiceFields();
    if (missingFields.length) return toast(`请补充${invoiceTypeLabel()}信息：${missingFields.join("、")}`);
    renderPreservingScroll();
    toast(`${invoiceTypeLabel()}常用资料已保存，收银台将自动带入`);
  }
  else if (type === "invoice-application") {
    const orderIds = [...state.invoiceApplicationOrders];
    if (!orderIds.length) return toast("请至少选择一笔可开票订单");
    const missingFields = missingInvoiceFields();
    if (missingFields.length) return toast(`请补充${invoiceTypeLabel()}信息：${missingFields.join("、")}`);
    const amount = demoInvoiceOrders.filter((order) => state.invoiceApplicationOrders.has(order.id)).reduce((sum, order) => sum + order.amount, 0);
    try {
      await submitInvoiceApplication(orderIds, amount, "ACCOUNT_CENTER");
      orderIds.forEach((orderId) => state.invoicedOrderIds.add(orderId));
      state.invoiceApplicationOpen = false;
      state.invoiceApplicationOrders = new Set();
      renderPreservingScroll();
      toast("开票申请已提交，多笔订单已按合并开票处理");
    } catch (error) {
      toast(`开票申请提交失败：${error.message}`);
    }
  }
  else if (type === "mini-search") go("mini-search");
  else if (type === "mini-ai") toast("小程序 Mock AI 仅检索当前已购报告；Web 端已接入可调用闭环。");
  else if (type === "ai") {
    const question = new FormData(event.target).get("question") || "";
    event.target.reset();
    await askAi(question);
  }
}

function render() {
  apiDetailScrollCleanup?.();
  apiDetailScrollCleanup = null;
  const current = route().name;
  persistSessionState();
  if (lastRenderedRoute && current !== lastRenderedRoute && current.startsWith("admin")) {
    state.adminDrawer = null;
    state.adminWorkflowModal = null;
  }
  lastRenderedRoute = current;
  const protectedRoutes = new Set(["account","api-console","api-keys","api-usage"]);
  const isAdminRoute = current.startsWith("admin-") || current === "admin";
  if (current === "files") { go("home"); return; }
  if (current === "library") { go("account"); return; }
  if (current === "checkout" && !state.loggedIn) {
    capturePendingPurchase();
    state.returnAfterLogin = "checkout";
    go("login");
    return;
  }
  if (isAdminRoute && current !== "admin-login" && !state.adminLoggedIn) {
    state.adminReturnAfterLogin = location.hash.replace(/^#\/?/, "") || current;
    go("admin-login");
    return;
  }
  if ((protectedRoutes.has(current) || ["progress", "report"].includes(current)) && !state.loggedIn) {
    state.returnAfterLogin = location.hash.replace(/^#\/?/, "") || current;
    go("login");
    return;
  }
  if (["progress", "report"].includes(current) && !hasPaidReportAccess()) {
    go("home");
    setTimeout(() => toast("报告进度和报告详情仅对已支付订单开放。"), 80);
    return;
  }
  if (current.startsWith("mini-")) state.mode = "mini";
  else if (current.startsWith("api-")) state.mode = "api";
  else if (current.startsWith("admin")) state.mode = "admin";
  else state.mode = "web";
  const views = {
    home: renderHomeV2,
    insights: renderInsights,
    insight: renderInsightArticle,
    login: renderLogin,
    "admin-login": renderAdminLogin,
    search: renderSearch,
    company: renderCompany,
    checkout: renderCheckout,
    progress: renderProgress,
    report: renderReport,
    library: renderLibrary,
    account: renderAccount,
    "api-market": renderApiMarketStructured,
    "api-detail": renderApiDetail,
    "api-console": renderApiConsoleStructured,
    "api-keys": renderApiKeys,
    "api-usage": renderApiUsage,
    "api-docs": renderApiDocsStructured,
    "api-cli": renderApiCliStructured,
    "api-mcp": renderApiMcpStructured,
    admin: renderAdmin,
    "admin-insights": renderAdminInsightsV41,
    "admin-models": renderAdminModels,
    "admin-sources": renderAdminSources,
    "admin-coverage": renderAdminCoverage,
    "admin-products": renderAdminProducts,
    "admin-pricing": renderAdminPricing,
    "admin-providers": renderAdminProvidersV41,
    "admin-orders": renderAdminOrders,
    "admin-wallet": renderAdminWallet,
    "admin-invoices": renderAdminInvoices,
    "admin-tasks": renderAdminTasks,
    "admin-api-customers": renderAdminApiCustomersV41,
    "admin-api-usage": renderAdminApiUsage,
    "admin-users": renderAdminUsersV41,
    "admin-files": renderAdminFiles,
    "admin-analytics": renderAdminAnalytics,
    "admin-audit": renderAdminAudit,
    "mini-home": renderMiniHome,
    "mini-search": renderMiniSearch,
    "mini-company": renderMiniCompany,
    "mini-progress": renderMiniProgress,
    "mini-report": renderMiniReport,
    "mini-ai": renderMiniAi,
  };
  let markup = (views[current] || renderHome)();
  if (current === "home") {
    markup = markup
      .replace('<section class="home-section enterprise-coverage">', '<section hidden aria-hidden="true">')
      .replace('<section class="home-section process-section">', `${renderHomeEntityNetwork()}<section class="home-section process-section">`);
  }
  if (current === "account") {
    const accountNav = `<aside class="account-side"><div class="account-side-profile"><span>${icon("user",22)}</span><div><strong>${state.customer?.mobileMasked || "138****8888"}</strong><small>${state.customer?.id || "CUS-DEMO-0001"}</small></div><b>普通用户</b></div><nav><small>个人中心</small>${[["account-overview","总览","database"],["account-reports","报告与订单","report"],["account-api","API 账户","api"],["account-wallet","账户余额","database"],["account-invoices","发票管理","report"],["account-security","账户与登录","shield"]].map(([id,label,iconName],index)=>`<button class="${index===0?"active":""}" data-action="jump-account-section" data-section="${id}">${icon(iconName,17)}<span>${label}</span>${icon("chevron",14)}</button>`).join("")}</nav><div class="account-side-actions"><a href="#/home">${icon("arrow",15)} 返回首页</a><button data-action="logout">${icon("user",15)} 退出登录</button></div></aside>`;
    markup = markup
      .replace('data-action="go" data-target="library">查看全部', 'data-action="jump-account-reports">查看全部')
      .replace('data-action="go" data-target="library">查看订单', 'data-action="jump-account-reports">查看订单')
      .replace('</div><article class="wallet-card">', `</div>${renderAccountReportCenter()}${renderAccountApiCenter()}<article class="wallet-card">`)
      .replace('<section class="account-page">', `<section class="account-page account-v2"><div class="account-workspace">${accountNav}<main class="account-main" id="account-overview">`)
      .replace('<article class="wallet-card">', '<article class="wallet-card" id="account-wallet">')
      .replace('<article class="account-security-card">', '<article class="account-security-card" id="account-security">')
      .replace('<article class="account-invoice-card">', '<article class="account-invoice-card" id="account-invoices">')
      .replace('</section></section></main><footer class="site-footer', '</section></main></div></section></main><footer class="site-footer');
  }
  if (current === "api-market") {
    markup = markup.replace('<button data-action="api-buy">充值余额</button></div></aside>', '<div class="gc-api-wallet-actions"><a href="#/account?section=api">用户中心</a><button data-action="api-buy">充值余额</button></div></div></aside>');
  }
  if (current === "api-market" || current === "api-detail") {
    markup = markup
      .replaceAll("全球查接口原价", "原型调用单价")
      .replaceAll("商情局保持同一接口单价。", "当前为原型测试价，正式价格可在运营后台配置。")
      .replaceAll("按各接口原价逐次扣费", "按各接口调用单价逐次扣费")
      .replaceAll("充值余额并使用", "充值余额并调用")
      .replace(/¥(\d+\.\d)(?!\d)/g, (_, value) => apiMoney(value));
  }
  if (current === "api-console") {
    markup = markup.replace('<span>剩余测试额度</span><strong>8,420</strong><small>点 · 2026-09-15 到期</small>', `<span>API 预存余额</span><strong>¥${state.apiBalance.toLocaleString()}</strong><small>成功调用按全球查接口原价扣费</small>`);
  }
  if (current === "admin-api-customers" && (state.adminSubtabByRoute[current] || "overview") === "overview") {
    markup = markup.replace('<section class="ops-table-card">', `${renderAdminDeveloperMatrix()}<section class="ops-table-card">`);
  }
  markup = markup.replaceAll(
    "http://127.0.0.1:4190",
    window.SQJ_RUNTIME?.publicApiBase || mockApi.baseUrl,
  );
  markup = localizeMarkup(markup);
  app.innerHTML = markup
    .replaceAll("SQJ-TASK-20260816-008", state.mockTask?.taskId || "SQJ-TASK-DEMO-008")
    .replaceAll("SQJ-RPT-20260816-0018", state.mockReportId || "SQJ-RPT-DEMO-0018");
  enforceEnglishDOM(app);
  const skipLink = document.querySelector(".skip-link");
  if (skipLink) skipLink.textContent = tr("跳到主要内容", "Skip to main content");
  document.title = state.locale === "en" ? `Shangqingju · ${current.replaceAll("-", " ")}` : `商情局 · ${current.replaceAll("-", " ")}`;
  document.documentElement.lang = state.locale === "en" ? "en" : "zh-CN";
  window.scrollTo({ top: 0, behavior: "instant" });
  if (current === "account" && route().params.get("section") === "api") {
    requestAnimationFrame(() => document.querySelector("#account-api")?.scrollIntoView({ behavior:"smooth", block:"start" }));
  }
  if (current === "api-detail") requestAnimationFrame(initApiDetailScrollSpy);
}

document.addEventListener("click", handleClick);
document.addEventListener("submit", handleSubmit);
document.addEventListener("input", (event) => {
  const field = event.target.dataset.invoiceField;
  if (field && Object.hasOwn(state.invoiceProfile, field)) state.invoiceProfile[field] = event.target.value;
});
document.addEventListener("change", (event) => {
  const invoiceOrderId = event.target.dataset.invoiceOrder;
  if (invoiceOrderId) {
    if (event.target.checked) state.invoiceApplicationOrders.add(invoiceOrderId); else state.invoiceApplicationOrders.delete(invoiceOrderId);
    renderPreservingScroll();
    return;
  }
  const code = event.target.dataset.module;
  if (!code) return;
  if (event.target.checked) state.selectedModules.add(code); else state.selectedModules.delete(code);
  renderPreservingScroll();
});
window.addEventListener("hashchange", render);
render();
loadInsights();
loadWallet();
