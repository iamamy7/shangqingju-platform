<script setup lang="ts">
const config = useRuntimeConfig(),
  { token, user, logout, authHeaders } = useSqjAuth();
const route = useRoute();
const active = ref(String(route.query.tab || "overview"));
const balance = ref<any>(),
  orders = ref<any[]>([]),
  error = ref("");
async function load() {
  if (!token.value) {
    await navigateTo({ path: "/login", query: { redirect: "/account" } });
    return;
  }
  try {
    [balance.value, orders.value] = await Promise.all([
      $fetch<any>(`${config.public.apiBase}/account/balance`, {
        headers: authHeaders(),
      }),
      $fetch<any[]>(`${config.public.apiBase}/orders`, {
        headers: authHeaders(),
      }),
    ]);
  } catch (e: any) {
    error.value = e?.data?.message || "账户信息读取失败";
  }
}
onMounted(load);
async function signOut() {
  logout();
  await navigateTo("/");
}
</script>
<template>
  <main>
    <header>
      <NuxtLink to="/">SQJ <span>商情据</span></NuxtLink
      ><b>个人中心</b><button @click="signOut">退出登录</button>
    </header>
    <div class="shell">
      <aside>
        <div class="profile">
          <i>{{ user?.displayName?.slice(-2) || "用户" }}</i
          ><strong>{{ user?.displayName }}</strong
          ><span>{{ user?.phone }}</span>
        </div>
        <button
          :class="{ active: active === 'overview' }"
          @click="active = 'overview'"
        >
          账户总览</button
        ><button
          :class="{ active: active === 'reports' }"
          @click="active = 'reports'"
        >
          我的报告</button
        ><button
          :class="{ active: active === 'wallet' }"
          @click="active = 'wallet'"
        >
          余额与充值</button
        ><button
          :class="{ active: active === 'invoice' }"
          @click="active = 'invoice'"
        >
          发票信息与申请</button
        ><button
          :class="{ active: active === 'security' }"
          @click="active = 'security'"
        >
          登录与账号
        </button>
      </aside>
      <section class="content">
        <p v-if="error" class="error">{{ error }}</p>
        <template v-if="active === 'overview'"
          ><h1>账户总览</h1>
          <div class="stats">
            <article>
              <span>可用余额</span
              ><strong
                >¥{{
                  balance?.available?.toFixed?.(2) ||
                  balance?.available ||
                  "0.00"
                }}</strong
              ><small>人民币余额结算</small>
            </article>
            <article>
              <span>报告订单</span><strong>{{ orders.length }}</strong
              ><small>含待支付与已交付</small>
            </article>
            <article>
              <span>已完成报告</span
              ><strong>{{
                orders.filter((o) => o.status === "PAID").length
              }}</strong
              ><small>仅本人登录后可查看</small>
            </article>
          </div>
          <h2>最近订单</h2>
          <OrderList :orders="orders" /></template
        ><template v-else-if="active === 'reports'"
          ><h1>我的报告</h1>
          <OrderList :orders="orders" reports-only /></template
        ><template v-else-if="active === 'wallet'"
          ><h1>余额与充值</h1>
          <article class="panel">
            <p>当前可用余额</p>
            <strong class="big"
              >¥{{
                balance?.available?.toFixed?.(2) || balance?.available
              }}</strong
            >
            <div class="methods">
              <button>微信充值 <em>示例</em></button
              ><button>支付宝充值 <em>示例</em></button>
            </div>
            <small>正式支付接口待确定；当前按钮仅展示未来接入位置。</small>
          </article></template
        ><template v-else-if="active === 'invoice'"
          ><h1>发票信息与申请</h1>
          <article class="panel">
            <h2>增值税专用发票抬头</h2>
            <div class="form">
              <label>企业名称<input value="合肥易尊数字科技有限公司" /></label
              ><label
                >纳税人识别号<input
                  placeholder="请输入统一社会信用代码" /></label
              ><label>注册地址<input placeholder="请输入注册地址" /></label
              ><label>注册电话<input placeholder="请输入注册电话" /></label
              ><label>开户银行<input placeholder="请输入开户银行" /></label
              ><label>银行账号<input placeholder="请输入银行账号" /></label
              ><label
                >电子发票接收邮箱<input placeholder="invoice@example.com"
              /></label>
            </div>
            <button class="primary">保存发票信息</button>
            <p>
              可对未开票的已支付订单合并申请开票；购买页勾选开票与此处提交具有相同效果。当前开票上游为示例接口。
            </p>
          </article></template
        ><template v-else
          ><h1>登录与账号</h1>
          <article class="panel">
            <h2>登录手机号</h2>
            <strong>{{ user?.phone }}</strong>
            <h2>微信账号</h2>
            <p>尚未绑定，后续支持微信扫码登录与账号绑定。</p>
            <button class="primary" @click="signOut">退出当前账号</button>
          </article></template
        >
      </section>
    </div>
  </main>
</template>
<script lang="ts">
const OrderList = {
  props: { orders: { type: Array, default: () => [] }, reportsOnly: Boolean },
  template: `<div class="orders"><article v-for="order in orders" :key="order.id" v-show="!reportsOnly || order.status==='PAID'"><div><b>{{ order.id }}</b><p>{{ order.moduleCodes.join('、') }} · {{ order.status==='PAID'?'已支付':'待支付' }}</p></div><strong>¥{{ order.amount }}</strong><a v-if="order.reportId" :href="'/report/'+order.reportId">查看报告 →</a></article><p v-if="!orders.length">暂无订单</p></div>`,
};
export default { components: { OrderList } };
</script>
<style scoped>
:global(*) {
  box-sizing: border-box;
}
:global(body) {
  margin: 0;
  font-family: Inter, "PingFang SC", sans-serif;
  background: #f4f7f6;
  color: #163630;
}
:global(a) {
  color: inherit;
  text-decoration: none;
}
header {
  height: 72px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 5vw;
  background: #fff;
  border-bottom: 1px solid #dbe6e2;
}
header > a {
  font-size: 22px;
  font-weight: 900;
}
header > a span {
  font-size: 18px;
}
header button {
  justify-self: end;
  border: 1px solid #e4bdb3;
  background: #fff5f2;
  color: #c84e36;
  border-radius: 10px;
  padding: 10px 16px;
}
.shell {
  max-width: 1240px;
  margin: 28px auto;
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 20px;
  padding: 0 22px;
}
.shell > aside,
.content {
  background: #fff;
  border: 1px solid #dbe6e2;
  border-radius: 18px;
}
.shell > aside {
  padding: 18px;
  height: max-content;
}
.profile {
  display: grid;
  justify-items: center;
  padding: 18px;
}
.profile i {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #dff5ed;
  color: #08785f;
  font-style: normal;
  font-weight: 900;
}
.profile strong {
  font-size: 18px;
  margin-top: 12px;
}
.profile span {
  font-size: 15px;
  color: #657972;
  margin-top: 5px;
}
.shell > aside > button {
  width: 100%;
  border: 0;
  background: transparent;
  text-align: left;
  padding: 14px;
  border-radius: 10px;
  font-size: 16px;
  color: #526c65;
}
.shell > aside > button.active {
  background: #e1f5ee;
  color: #08785f;
  font-weight: 800;
}
.content {
  padding: 32px;
  min-height: 650px;
}
.content h1 {
  font-size: 30px;
}
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.stats article,
.panel {
  padding: 22px;
  border: 1px solid #dde7e4;
  border-radius: 15px;
}
.stats article {
  display: grid;
  gap: 8px;
}
.stats article span,
.stats article small {
  color: #6a7c77;
}
.stats article strong,
.big {
  font-size: 28px;
}
.orders article {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 20px;
  border-top: 1px solid #e8edeb;
  padding: 17px 5px;
}
.orders p {
  color: #6b7d77;
}
.orders a {
  color: #08785f;
  font-weight: 800;
}
.methods {
  display: flex;
  gap: 12px;
  margin: 22px 0;
}
.methods button,
.primary {
  border: 0;
  border-radius: 10px;
  padding: 13px 18px;
  background: #0a9f7b;
  color: #fff;
  font-weight: 800;
}
.methods em {
  font-size: 11px;
  font-style: normal;
  background: #fff2ed;
  color: #d85b41;
  padding: 3px 6px;
  border-radius: 6px;
}
.panel > p,
.panel > small {
  color: #687b75;
  line-height: 1.7;
}
.form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 22px 0;
}
.form label {
  font-size: 15px;
  font-weight: 700;
}
.form input {
  display: block;
  width: 100%;
  margin-top: 8px;
  padding: 13px;
  border: 1px solid #d6e1de;
  border-radius: 9px;
  font-size: 15px;
}
.error {
  color: #d64b35;
}
@media (max-width: 800px) {
  header {
    grid-template-columns: 1fr auto;
  }
  header > b {
    display: none;
  }
  .shell {
    grid-template-columns: 1fr;
  }
  .stats,
  .form {
    grid-template-columns: 1fr;
  }
  .orders article {
    grid-template-columns: 1fr auto;
  }
}
</style>
