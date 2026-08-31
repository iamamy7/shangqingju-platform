# 商情据 Mock 上游 API v1.0

这是一个零第三方依赖的本地联调服务，用来在真实上游尚未接入时跑通完整业务闭环。所有企业、价格、人员、风险、财务与报告均为合成测试数据。

## 启动

```bash
cd "/Users/wangjing/Desktop/全球查数据/商情据_mock_api"
npm start
```

默认地址：`http://127.0.0.1:4190`

直接打开该地址会进入友好的 API 测试中心；产品原型仍在 `http://localhost:4180/`。

测试凭证（正式环境仅通过 HTTPS 请求头传输）：

```text
X-API-Key: sqj_test_2026_demo_key
```

## 最小调用

```bash
curl 'http://127.0.0.1:4190/open/v1/global/companies/search?q=Northstar' \
  -H 'X-API-Key: sqj_test_2026_demo_key'
```

国内数据库是独立路由，不会混用全球 Provider：

```bash
curl 'http://127.0.0.1:4190/open/v1/domestic/companies/search?q=上海青岚科技' \
  -H 'X-API-Key: sqj_test_2026_demo_key'
```

全球路由返回 `MOCK_GLOBAL_PROVIDER`，国内路由返回 `MOCK_DOMESTIC_PROVIDER`。未来可以分别在真实适配层替换两个上游数据库。

```bash
curl 'http://127.0.0.1:4190/open/v1/companies/SQJ-DEMO-US-0001/modules/M08' \
  -H 'X-API-Key: sqj_test_2026_demo_key'
```

OpenAPI：`http://127.0.0.1:4190/openapi.yaml`

内容产品接口：`GET /open/v1/insights` 返回大宗数据、投资日报、金融市场、上市企业、其他五个子模块，每个模块至少 10 条内容，以及生意社、金十数据、投中网、华尔街见闻、同花顺、雪球六个线索源；`GET /open/v1/insights/{insightId}` 返回商情据原创分析正文，原始披露只作为文末事实参考。为补足分页联调而扩展的内容会明确标记为 Mock 样稿，正式发布前必须人工复核。后台通过 `GET /open/v1/admin/insight-agent` 查看来源状态和发布队列，并可用 `POST /open/v1/admin/insight-agent/runs` 模拟启动每日批次。

商情据与全球查属于同一业务主体，面向不同客户群体并共用同一数据源。API 与余额充值：`GET /open/v1/api-products` 返回与全球查完全一致的 33 个接口 OperationId、请求方式、路径和元/次单价；`POST /open/v1/api-balance-orders` 创建微信、支付宝或对公转账的人民币 API 预存余额订单；`GET /open/v1/customers/{customerId}/api-wallet` 查询人民币余额与充值记录。商情据对客统一使用 `X-API-Key`，全球查等上游鉴权仅保存在服务端适配层，不暴露给客户。

支付、充值与开票响应中的 `integrationMode: MOCK_EXAMPLE` 表示当前只是流程示例，不会发起真实扣款或开票；正式接口接入时替换 Provider Adapter 即可。

## 可验证的闭环

1. `GET /open/v1/global/companies/search` 或 `GET /open/v1/domestic/companies/search` 分别搜索两个独立数据库并确认主体。
2. `GET /open/v1/companies/{companyId}/modules/{moduleCode}` 取得 M01–M10 的测试数据。
3. 未登录用户先通过 `POST /open/v1/auth/sessions` 创建客户会话；前端保留待支付模块并在登录后返回收银台。
4. `GET /open/v1/customers/{customerId}/wallet` 查询账户余额；`POST /open/v1/customers/{customerId}/wallet/recharges` 用微信、支付宝或对公转账完成演示充值。
5. `POST /open/v1/orders` 创建待支付订单，保存客户、主体、模块、金额与普票/专票资料。专票完整资料包括单位名称、纳税人识别号、注册地址、注册电话、开户行、银行账号及电子发票接收邮箱。
6. `POST /open/v1/orders/{orderId}/payments` 使用微信、支付宝、余额或其他方式创建演示支付记录；余额支付会同步扣减 Mock 余额。
7. 支付成功后，收银台选择“需要发票”会调用 `POST /open/v1/invoice-applications` 直接提交开票申请；个人中心也调用同一契约，传入多个 `orderId` 即为合并开票。
8. 开发者可先读取全球查同源的 33 个 API 目录，再充值 API 预存余额并确认到账；这条购买链路同样要求登录客户身份。
9. 支付成功后，`POST /open/v1/report-tasks` 使用 `Idempotency-Key` 创建任务。
10. `GET /open/v1/report-tasks/{taskId}` 轮询 `QUEUED → RUNNING → COMPLETED`。
11. `GET /open/v1/reports/{reportId}` 取得带章节状态和来源的结构化报告。
12. `POST /open/v1/reports/{reportId}/questions` 验证“仅基于报告、必须引用”的 AI 问答。

## 异常场景

在任一业务请求中增加 `X-Mock-Scenario`：

- `no-record`：`200 + NO_RECORD`，有效结果。
- `partial`：`200 + PARTIAL`，包含缺失字段。
- `ambiguous`：`200 + AMBIGUOUS`，需主体消歧。
- `no-coverage`：`422 + NO_COVERAGE`，不可售、不计费。
- `provider-error`：`503 + PROVIDER_ERROR`，可重试、不计费。
- `slow`：额外等待 1.2 秒，用于测试 loading、超时和取消。

场景自述接口：`GET /open/v1/mock/scenarios`。

## 一键闭环测试

```bash
npm run test:e2e
```

测试会自动在 4191 端口启动临时服务，验证搜索、深度文章、资讯 Agent 发布队列、33 个全球查同源 API、API 余额充值、账户与发票、数据状态、上游异常、幂等、报告轮询与 AI 引用，结束后自动关闭。

## 真实上游到位后如何切换

1. 复制 `.env.example` 中的真实上游配置到运行环境。
2. 设置 `UPSTREAM_MODE=real`、`REAL_UPSTREAM_BASE_URL` 和 `REAL_UPSTREAM_API_KEY`。
3. 只在 `adapters/real-adapter.mjs` 完成请求参数、返回字段、数据状态和错误码的转换。
4. 对下游继续保持 `/open/v1` 契约，前端、订单、报告任务与 AI 服务无需换调用方式。
5. 用相同的契约测试同时回归 Mock 和 Real 模式，再逐步放量。

`real-adapter.mjs` 目前提供透传骨架。因为真实上游的请求与字段契约尚未提供，现在不猜测映射规则。
