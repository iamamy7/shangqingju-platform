<script setup lang="ts">
const { token, logout } = useAdminAuth();
const active = ref("总览");
if (import.meta.client && !token.value) await navigateTo("/login");
const menus = [
  { group: "工作台", items: ["总览"] },
  { group: "数据运营", items: ["企业数据源", "覆盖与质量"] },
  { group: "内容运营", items: ["资讯审核与发布", "资讯来源"] },
  { group: "商品与交付", items: ["报告产品", "报告任务"] },
  { group: "API 运营", items: ["API 产品与客户", "调用与计费"] },
  {
    group: "客户与交易",
    items: ["客户使用情况", "订单与退款", "余额与充值", "发票管理"],
  },
  { group: "系统设置", items: ["AI 与 Agent", "操作日志"] },
];
const insightRows = ref([
  { title: "全球半导体供应链投资热度回升", source: "投中网", status: "待审核" },
  { title: "铜价波动与制造业成本传导", source: "生意社", status: "待审核" },
  { title: "上市公司年度现金流质量观察", source: "同花顺", status: "已通过" },
]);
function signOut() {
  logout();
  navigateTo("/login");
}
</script>
<template>
  <main class="shell">
    <aside>
      <div class="brand"><img src="/assets/sqj-mark-v4.svg" alt="" /><span><b>商情据</b><small>官方运营工作台</small></span></div>
      <nav v-for="group in menus" :key="group.group">
        <p>{{ group.group }}</p>
        <button
          v-for="item in group.items"
          :key="item"
          :class="{ active: item === active }"
          @click="active = item"
        >
          {{ item }}
        </button>
      </nav>
    </aside>
    <section class="stage">
      <header>
        <input placeholder="搜索客户、订单、报告任务或接口" /><span
          >● 测试运营环境</span
        >
        <div><b>运营管理员</b><button @click="signOut">退出登录</button></div>
      </header>
      <div class="content">
        <p>OFFICIAL OPERATIONS</p>
        <h1>{{ active }}</h1>
        <template v-if="active === '总览'"
          ><div class="stats">
            <article>
              <span>今日活跃客户</span><strong>1,286</strong
              ><small>Web / 小程序 / API</small>
            </article>
            <article>
              <span>今日企业检索</span><strong>1,824</strong
              ><small>全球与国内数据库</small>
            </article>
            <article>
              <span>今日成交</span><strong>¥3,642</strong
              ><small>报告订单 + API 充值</small>
            </article>
            <article>
              <span>服务可用率</span><strong>99.2%</strong
              ><small>Mock 演示环境</small>
            </article>
          </div>
          <section class="panel">
            <h2>今日运营待办</h2>
            <div class="todo">
              <b>6 篇资讯等待人工审核</b><b>2 个报告任务需要处理</b
              ><b>3 个 API 客户余额预警</b>
            </div>
          </section></template
        ><template v-else-if="active === '资讯审核与发布'"
          ><div class="toolbar">
            <button>重新采集今日资讯</button><button>批量通过</button>
          </div>
          <section class="panel">
            <h2>Agent 今日采集 · 逐篇人工审核</h2>
            <table>
              <thead>
                <tr>
                  <th>文章标题</th>
                  <th>来源</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in insightRows" :key="row.title">
                  <td>{{ row.title }}</td>
                  <td>{{ row.source }}</td>
                  <td>{{ row.status }}</td>
                  <td>
                    <button @click="row.status = '已通过'">查看并审核</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </section></template
        ><template v-else-if="active === '报告产品'"
          ><section class="panel">
            <h2>报告产品与折扣</h2>
            <table>
              <thead>
                <tr>
                  <th>产品</th>
                  <th>原价</th>
                  <th>折扣</th>
                  <th>折后价</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>企业基础与注册</td>
                  <td>¥39</td>
                  <td><input value="100%" /></td>
                  <td>¥39</td>
                  <td>上架</td>
                </tr>
                <tr>
                  <td>股东与控制权</td>
                  <td>¥89</td>
                  <td><input value="88%" /></td>
                  <td>¥78</td>
                  <td>上架</td>
                </tr>
              </tbody>
            </table>
          </section></template
        ><template v-else-if="active === 'API 产品与客户'"
          ><section class="panel">
            <h2>API 产品配置</h2>
            <div class="toolbar">
              <button>新增 API 产品</button><button>同步 33 个接口</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>接口</th>
                  <th>分类</th>
                  <th>调用单价</th>
                  <th>客户数</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>企业主体识别</td>
                  <td>主体信息</td>
                  <td>¥0.10 / 次</td>
                  <td>36</td>
                  <td>已启用</td>
                </tr>
                <tr>
                  <td>企业完整档案</td>
                  <td>基础信息</td>
                  <td>¥1.50 / 次</td>
                  <td>12</td>
                  <td>已启用</td>
                </tr>
              </tbody>
            </table>
          </section></template
        ><template v-else-if="active === '调用与计费'"
          ><section class="panel">
            <h2>客户调用与人民币余额计费</h2>
            <div class="stats mini">
              <article><span>今日调用</span><strong>15,802</strong></article>
              <article><span>成功计费</span><strong>¥628.40</strong></article>
              <article><span>失败不计费</span><strong>148 次</strong></article>
            </div>
            <table>
              <thead>
                <tr>
                  <th>客户</th>
                  <th>接口</th>
                  <th>状态</th>
                  <th>扣费</th>
                  <th>耗时</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Demo Studio</td>
                  <td>company.profile.get</td>
                  <td>成功</td>
                  <td>¥0.20</td>
                  <td>118ms</td>
                </tr>
              </tbody>
            </table>
          </section></template
        ><template v-else
          ><section class="panel">
            <h2>{{ active }}工作台</h2>
            <p class="desc">
              此页面按
              {{
                active
              }}
              的实际运营流程配置，支持列表、筛选、详情、状态变更与审计记录。正式开发将继续连接数据库和真实上游。
            </p>
            <div class="actions">
              <button>新建</button><button>筛选</button><button>导出</button
              ><button>查看详情</button>
            </div>
          </section></template
        >
      </div>
    </section>
  </main>
</template>
<style scoped>
:global(*) {
  box-sizing: border-box;
}
:global(body) {
  margin: 0;
  font-family: Inter, "PingFang SC", sans-serif;
  color: #183b33;
  background: #f5f8f7;
}
.shell {
  display: grid;
  grid-template-columns: 264px 1fr;
  min-height: 100vh;
}
aside {
  padding: 22px 14px;
  background: #123a33;
  color: white;
}
.brand {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 5px 10px 24px;
  border-bottom: 1px solid #ffffff27;
}
.brand img{width:64px;height:40px;object-fit:contain}.brand span{display:grid;gap:2px}.brand b{font-size:20px}.brand small{color:#a9c9c0;font-size:11px;font-weight:500}
nav p {
  margin: 22px 10px 6px;
  color: #91b9af;
  font-size: 12px;
  letter-spacing:.08em;
}
nav button {
  display: block;
  width: 100%;
  border: 0;
  background: transparent;
  color: #dcece7;
  text-align: left;
  padding: 11px 13px;
  border-radius: 9px;
  font-size: 15px;
}
nav button.active {
  background: #dff5ed;
  color: #006f56;
  font-weight: 850;
}
.stage header {
  height: 70px;
  padding: 0 28px;
  display: flex;
  align-items: center;
  gap: 15px;
  background: #fff;
  border-bottom: 1px solid #dbe6e2;
}
.stage header input {
  width: 360px;
  padding: 12px;
  border: 1px solid #d6e1de;
  border-radius: 9px;
  font-size: 15px;
}
.stage header > span {
  color: #008f6a;
}
.stage header > div {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}
.stage header button {
  border: 1px solid #efc4b9;
  color: #c64d36;
  background: #fff6f3;
  border-radius: 9px;
  padding: 9px 13px;
}
.content {
  padding: 35px;
}
.content > p {
  color: #008f6a;
  font-size: 13px;
  letter-spacing: 0.16em;
  font-weight: 900;
}
.content > h1 {
  font-size: 32px;
  margin: 6px 0 25px;
}
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 13px;
}
.stats article {
  display: grid;
  gap: 8px;
  padding: 20px;
  background: #fff;
  border: 1px solid #dce6e3;
  border-radius: 12px;
}
.stats strong {
  font-size: 26px;
}
.stats span,
.stats small {
  color: #677b75;
}
.panel {
  margin-top: 17px;
  padding: 22px;
  background: #fff;
  border: 1px solid #dce6e3;
  border-radius: 14px;
}
.panel h2 {
  font-size: 19px;
  margin-top: 0;
}
.todo {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.todo b {
  padding: 20px;
  background: #f0f7f4;
  border-radius: 10px;
}
.toolbar,
.actions {
  display: flex;
  gap: 10px;
  margin: 14px 0;
}
.toolbar button,
.actions button,
.panel td button {
  border: 0;
  border-radius: 8px;
  background: #e4f5ef;
  color: #00765a;
  padding: 10px 14px;
  font-weight: 750;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  text-align: left;
  padding: 14px 10px;
  border-bottom: 1px solid #e4ebe8;
  font-size: 15px;
}
th {
  color: #687c76;
  background: #f6f8f7;
}
td input {
  width: 80px;
  padding: 8px;
}
.mini {
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 20px;
}
.desc {
  font-size: 16px;
  color: #687b75;
}
@media (max-width: 900px) {
  .shell {
    grid-template-columns: 1fr;
  }
  aside {
    display: block;
    max-height: 250px;
    overflow: auto;
  }
  aside nav {
    display: inline-block;
    width: 49%;
    vertical-align: top;
  }
  aside .brand {
    position: sticky;
    top: 0;
    z-index: 2;
    background: #123a33;
  }
  .stats {
    grid-template-columns: 1fr 1fr;
  }
  .stage header input {
    width: 180px;
  }
  .content {
    padding: 20px;
  }
}
</style>
