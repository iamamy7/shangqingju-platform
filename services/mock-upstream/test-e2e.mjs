import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const port = 4191;
const baseUrl = `http://127.0.0.1:${port}`;
const headers = {
  "content-type": "application/json",
  "x-api-key": "sqj_test_2026_demo_key"
};
const child = spawn(process.execPath, ["server.mjs"], {
  cwd: new URL(".", import.meta.url),
  env: { ...process.env, PORT: String(port), UPSTREAM_MODE: "mock", MOCK_TASK_DURATION_MS: "650" },
  stdio: ["ignore", "pipe", "pipe"]
});

async function request(path, options = {}) {
  const response = await fetch(baseUrl + path, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  const payload = await response.json();
  return { response, payload };
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
  console.log(`✓ ${message}`);
}

try {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const health = await fetch(baseUrl + "/health");
      if (health.ok) break;
    } catch {}
    await delay(50);
  }

  const search = await request("/open/v1/global/companies/search?q=Northstar&country=US");
  assert(search.response.status === 200, "主体搜索返回 200");
  assert(search.payload.dataState === "AMBIGUOUS", "同名主体返回 AMBIGUOUS");
  assert(search.payload.data.candidates.length === 3, "返回 3 个 Northstar 测试候选");
  assert(search.payload.provider.code === "MOCK_GLOBAL_PROVIDER", "全球搜索路由到全球数据库 Provider");

  const domesticSearch = await request("/open/v1/domestic/companies/search?q=上海青岚科技");
  assert(domesticSearch.response.status === 200 && domesticSearch.payload.data.candidates.length === 1, "国内搜索返回中国大陆测试主体");
  assert(domesticSearch.payload.provider.code === "MOCK_DOMESTIC_PROVIDER", "国内搜索路由到国内数据库 Provider");
  assert(domesticSearch.payload.data.query.dataSource === "DOMESTIC", "国内响应保留独立数据源标识");

  const insights = await request("/open/v1/insights");
  assert(insights.response.status === 200, "公开资讯聚合返回 200");
  assert(insights.payload.provider.code === "MOCK_PUBLIC_DISCLOSURE_AGGREGATOR", "资讯响应标记公开披露聚合 Provider");
  assert(insights.payload.data.primaryMarket.length >= 2 && insights.payload.data.secondaryMarket.length >= 3, "返回一级市场与二级市场两类资讯");
  assert(insights.payload.data.secondaryMarket.every((item) => item.sourceUrl && item.articleZh?.length >= 3), "每条热点保留来源并形成深度文章");
  const insightItems = [...insights.payload.data.primaryMarket, ...insights.payload.data.secondaryMarket];
  assert(new Set(insightItems.map((item) => item.category)).size === 5, "资讯覆盖大宗、投资、金融、上市企业与其他五个子模块");
  assert(["COMMODITIES", "INVEST_DAILY", "FINANCIAL_MARKET", "LISTED_COMPANY", "OTHER"].every((category) => insightItems.filter((item) => item.category === category).length >= 10), "每个资讯子模块至少返回 10 条内容");
  assert(insightItems.length >= 50, "资讯列表至少提供 50 条内容用于每页 10 条分页");
  assert(insights.payload.data.discoverySources.length === 6, "Agent 配置六个指定市场线索源");
  assert(insightItems.every((item) => item.discoveredBy?.length), "每篇文章保留线索发现平台");

  const insightArticle = await request(`/open/v1/insights/${insights.payload.data.primaryMarket[0].id}`);
  assert(insightArticle.response.status === 200 && insightArticle.payload.data.articleZh.length >= 3, "独立文章接口返回完整分析正文");
  assert(insightArticle.payload.provider.code === "MOCK_EDITORIAL_CONTENT_SERVICE", "文章由商情局内容服务交付而非跳转来源");

  const insightAgent = await request("/open/v1/admin/insight-agent");
  assert(insightAgent.response.status === 200 && insightAgent.payload.data.queue.length >= 5, "资讯 Agent 后台返回每日发布队列");
  assert(insightAgent.payload.data.queue.every((item) => item.reviewStatus === "HUMAN_APPROVED"), "发布文章均经过人工复核");

  const insightRun = await request("/open/v1/admin/insight-agent/runs", { method: "POST", body: "{}" });
  assert(insightRun.response.status === 202 && insightRun.payload.data.status === "RUNNING", "可模拟启动每日资讯 Agent 批次");

  const smsCode = await request("/open/v1/auth/sms-codes", { method: "POST", body: JSON.stringify({ mobile: "13800138888" }) });
  assert(smsCode.response.status === 202 && smsCode.payload.data.demoCode === "123456", "手机号登录可获取 Mock 验证码");
  const smsSession = await request("/open/v1/auth/sessions", { method: "POST", body: JSON.stringify({ method: "SMS", mobile: "13800138888", code: "123456" }) });
  assert(smsSession.response.status === 200 && smsSession.payload.data.loginMethod === "SMS", "手机号验证码可创建客户会话");
  const wechatSession = await request("/open/v1/auth/sessions", { method: "POST", body: JSON.stringify({ method: "WECHAT", qrToken: "demo-wechat-qr" }) });
  assert(wechatSession.response.status === 200 && wechatSession.payload.data.loginMethod === "WECHAT", "微信扫码可创建客户会话");

  const apiCatalog = await request("/open/v1/api-products");
  assert(apiCatalog.response.status === 200 && apiCatalog.payload.data.items.length === 33, "API 市场返回全球查同源的 33 个接口");
  assert(apiCatalog.payload.data.items.every((item) => item.price >= 0 && item.priceUnit === "元/次" && item.compatibility.includes("API")), "每个接口都保留全球查单价与 API 兼容性");
  const apiProductDetail = await request("/open/v1/api-products/companiesProfile");
  assert(apiProductDetail.response.status === 200 && apiProductDetail.payload.data.endpoint === "/api/v1/companies/profile" && apiProductDetail.payload.data.price === 0.10 && apiProductDetail.payload.data.commonFields.includes("isCost"), "API 详情返回全球查同源路径、按次调用价与通用计费字段");
  const apiBalanceOrder = await request("/open/v1/api-balance-orders", { method:"POST", body:JSON.stringify({ customerId:smsSession.payload.data.customer.id, amount:800, method:"WECHAT", apiCode:"companiesProfile" }) });
  assert(apiBalanceOrder.response.status === 201 && apiBalanceOrder.payload.data.status === "PAID", "登录客户可通过微信充值 API 人民币预存余额");
  assert(apiBalanceOrder.payload.data.balance === 9220 && apiBalanceOrder.payload.data.currency === "CNY", "API 人民币余额充值后立即到账");
  const apiWallet = await request(`/open/v1/customers/${smsSession.payload.data.customer.id}/api-wallet`);
  assert(apiWallet.response.status === 200 && apiWallet.payload.data.balance === 9220 && apiWallet.payload.data.unit === "YUAN" && apiWallet.payload.data.recentOrders.length === 1, "开发者 API 钱包统一使用人民币余额与充值记录");

  const wallet = await request(`/open/v1/customers/${smsSession.payload.data.customer.id}/wallet`);
  assert(wallet.response.status === 200 && wallet.payload.data.balance === 568, "个人中心可查询账户余额");
  assert(wallet.payload.data.rechargeMethods.length === 3, "账户余额提供微信、支付宝与对公转账三种充值方式");
  const recharge = await request(`/open/v1/customers/${smsSession.payload.data.customer.id}/wallet/recharges`, { method:"POST", body:JSON.stringify({ amount:300, method:"WECHAT" }) });
  assert(recharge.response.status === 200 && recharge.payload.data.status === "PAID", "微信演示充值生成充值记录");
  assert(recharge.payload.data.integrationMode === "MOCK_EXAMPLE", "充值接口明确标记为 Mock 示例");
  assert(recharge.payload.data.balance === 868, "充值后账户余额实时增加");

  const specialInvoice = { title: "商情局演示科技有限公司", taxId: "91310000DEMO202608", registeredAddress: "上海市浦东新区演示路 88 号", registeredPhone: "021-60000000", bankName: "中国工商银行上海演示支行", bankAccount: "100100000000000001", email: "invoice@example.com" };
  const orderBody = JSON.stringify({ customerId: smsSession.payload.data.customer.id, companyId: "SQJ-DEMO-US-0001", modules: ["M01", "M03", "M08"], amount: 200, invoiceRequested: true, invoiceType: "VAT_SPECIAL", invoice: specialInvoice });
  const order = await request("/open/v1/orders", { method: "POST", body: orderBody, headers: { "idempotency-key": "e2e-demo-order" } });
  assert(order.response.status === 201 && order.payload.data.status === "PENDING_PAYMENT", "登录客户可创建待支付订单");
  assert(order.payload.data.customerId === smsSession.payload.data.customer.id, "订单保留客户 ID 用于开票与售后");
  assert(order.payload.data.invoice.type === "VAT_SPECIAL" && order.payload.data.invoice.status === "PENDING_PAYMENT", "收银台可保存专票类型并等待支付");
  assert(order.payload.data.invoice.registeredAddress === specialInvoice.registeredAddress && order.payload.data.invoice.bankAccount === specialInvoice.bankAccount, "专票订单保存注册地址、电话、开户行及账号");
  const incompleteSpecialOrder = await request("/open/v1/orders", { method: "POST", body: JSON.stringify({ customerId: smsSession.payload.data.customer.id, companyId: "SQJ-DEMO-US-0001", modules: ["M01"], amount: 88, invoiceRequested: true, invoiceType: "VAT_SPECIAL", invoice: { title: "缺少资料公司", email: "invoice@example.com" } }) });
  assert(incompleteSpecialOrder.response.status === 400 && incompleteSpecialOrder.payload.error.code === "INCOMPLETE_SPECIAL_INVOICE_PROFILE", "专票资料不完整时拒绝创建开票订单");
  const orderReplay = await request("/open/v1/orders", { method: "POST", body: orderBody, headers: { "idempotency-key": "e2e-demo-order" } });
  assert(orderReplay.payload.data.orderId === order.payload.data.orderId && orderReplay.payload.idempotentReplay === true, "订单幂等重试不会重复下单");
  const payment = await request(`/open/v1/orders/${order.payload.data.orderId}/payments`, { method: "POST", body: JSON.stringify({ method: "ALIPAY" }) });
  assert(payment.response.status === 200 && payment.payload.data.status === "PAID" && payment.payload.data.method === "ALIPAY", "支付宝演示支付生成 PAID 记录");
  assert(payment.payload.data.integrationMode === "MOCK_EXAMPLE", "支付接口明确标记为 Mock 示例");
  const checkoutInvoiceApplication = await request("/open/v1/invoice-applications", { method: "POST", body: JSON.stringify({ customerId: smsSession.payload.data.customer.id, orderIds: [order.payload.data.orderId], invoiceType: "VAT_SPECIAL", invoice: specialInvoice, source: "CHECKOUT" }) });
  assert(checkoutInvoiceApplication.response.status === 201 && checkoutInvoiceApplication.payload.data.status === "PENDING_ISSUE", "收银台支付后选择开票会直接提交开票申请");
  assert(checkoutInvoiceApplication.payload.data.integrationMode === "MOCK_EXAMPLE", "开票接口明确标记为 Mock 示例");
  assert(checkoutInvoiceApplication.payload.data.source === "CHECKOUT" && checkoutInvoiceApplication.payload.data.invoice.type === "VAT_SPECIAL", "收银台开票申请保留来源和专票资料");
  const mergedInvoiceApplication = await request("/open/v1/invoice-applications", { method: "POST", body: JSON.stringify({ customerId: smsSession.payload.data.customer.id, orderIds: ["SQJ-ORD-DEMO-2408", "SQJ-ORD-DEMO-2381"], amount: 440, invoiceType: "VAT_SPECIAL", invoice: specialInvoice, source: "ACCOUNT_CENTER" }) });
  assert(mergedInvoiceApplication.response.status === 201 && mergedInvoiceApplication.payload.data.merge === true && mergedInvoiceApplication.payload.data.orderCount === 2, "个人中心支持多笔已支付订单合并开票");
  const duplicateInvoiceApplication = await request("/open/v1/invoice-applications", { method: "POST", body: JSON.stringify({ customerId: smsSession.payload.data.customer.id, orderIds: ["SQJ-ORD-DEMO-2408"], amount: 176, invoiceType: "VAT_SPECIAL", invoice: specialInvoice, source: "ACCOUNT_CENTER" }) });
  assert(duplicateInvoiceApplication.response.status === 409 && duplicateInvoiceApplication.payload.error.code === "INVOICE_ALREADY_APPLIED", "已提交开票申请的订单不能重复申请");
  const paidOrder = await request(`/open/v1/orders/${order.payload.data.orderId}`);
  assert(paidOrder.payload.data.status === "PAID" && paidOrder.payload.data.payment.paymentId && paidOrder.payload.data.invoice.status === "PENDING_ISSUE", "支付后订单可查询支付凭证与开票申请状态");

  const sanctions = await request("/open/v1/companies/SQJ-DEMO-US-0001/modules/M08");
  assert(sanctions.payload.dataState === "NO_RECORD", "M08 返回可计费的 NO_RECORD");
  assert(sanctions.payload.billable === true, "NO_RECORD 保持 billable=true");

  const noCoverage = await request("/open/v1/companies/SQJ-DEMO-US-0001/modules/M10");
  assert(noCoverage.response.status === 422, "M10 无覆盖返回 422");
  assert(noCoverage.payload.dataState === "NO_COVERAGE" && noCoverage.payload.billable === false, "NO_COVERAGE 不可售且不计费");

  const providerError = await request("/open/v1/companies/SQJ-DEMO-US-0001/basic", { headers: { "x-mock-scenario": "provider-error" } });
  assert(providerError.response.status === 503, "可强制演示 503 上游异常");
  assert(providerError.payload.dataState === "PROVIDER_ERROR", "上游异常返回 PROVIDER_ERROR");

  const taskBody = JSON.stringify({ companyId: "SQJ-DEMO-US-0001", modules: ["M01", "M03", "M08"] });
  const created = await request("/open/v1/report-tasks", { method: "POST", body: taskBody, headers: { "idempotency-key": "e2e-demo-report" } });
  assert(created.response.status === 202, "报告任务创建返回 202");
  const taskId = created.payload.data.taskId;
  const reportId = created.payload.data.reportId;

  const replay = await request("/open/v1/report-tasks", { method: "POST", body: taskBody, headers: { "idempotency-key": "e2e-demo-report" } });
  assert(replay.payload.data.taskId === taskId && replay.payload.idempotentReplay === true, "幂等重试不会重复创建任务");

  let task;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    task = await request(`/open/v1/report-tasks/${taskId}`);
    if (task.payload.data.status === "COMPLETED") break;
    await delay(80);
  }
  assert(task.payload.data.status === "COMPLETED", "报告任务轮询至 COMPLETED");

  const report = await request(`/open/v1/reports/${reportId}`);
  assert(report.payload.data.chapters.length === 3, "报告仅包含 3 个已请求章节");
  assert(report.payload.data.chapterStates.M08 === "NO_RECORD", "报告保留章节数据状态");

  const answer = await request(`/open/v1/reports/${reportId}/questions`, { method: "POST", body: JSON.stringify({ question: "是否命中制裁名单？" }) });
  assert(answer.payload.data.citations[0].chapter === "M08", "AI 回答引用 M08 证据");
  assert(answer.payload.data.groundedOnly === true, "AI 回答标记仅基于报告");

  console.log("\n商情局 Mock API 端到端闭环验证通过。");
} finally {
  child.kill("SIGTERM");
}
