<script setup lang="ts">
const route = useRoute(),
  config = useRuntimeConfig(),
  { token, authHeaders } = useSqjAuth();
const companyId = String(route.query.company || ""),
  moduleCodes = String(route.query.modules || "")
    .split(",")
    .filter(Boolean);
const channel = ref<"BALANCE" | "WECHAT_MOCK" | "ALIPAY_MOCK">("BALANCE"),
  invoiceRequested = ref(false),
  pending = ref(false),
  error = ref("");
if (import.meta.client && !token.value)
  await navigateTo({ path: "/login", query: { redirect: route.fullPath } });
const { data: company } = await useFetch<Record<string, unknown>>(
  `${config.public.apiBase}/companies/${companyId}`,
  { transform: (r: any) => r.data },
);
const { data: quote } = await useFetch<any>(
  `${config.public.apiBase}/report-products/quote`,
  { method: "POST", body: { moduleCodes } },
);
async function pay() {
  if (!token.value) {
    await navigateTo({ path: "/login", query: { redirect: route.fullPath } });
    return;
  }
  pending.value = true;
  error.value = "";
  try {
    const order = await $fetch<any>(`${config.public.apiBase}/orders`, {
      method: "POST",
      headers: authHeaders(),
      body: {
        companyId,
        moduleCodes,
        invoiceRequested: invoiceRequested.value,
      },
    });
    const paid = await $fetch<any>(
      `${config.public.apiBase}/orders/${order.id}/pay`,
      {
        method: "POST",
        headers: authHeaders(),
        body: { channel: channel.value },
      },
    );
    await navigateTo(`/progress/${paid.taskId}`);
  } catch (e: any) {
    error.value = e?.data?.message || "订单提交失败";
  } finally {
    pending.value = false;
  }
}
</script>
<template>
  <main>
    <header>
      <NuxtLink to="/">SQJ 商情局</NuxtLink><b>确认订单</b
      ><NuxtLink to="/account">个人中心</NuxtLink>
    </header>
    <div class="wrap">
      <section>
        <div class="title">
          <p>REPORT CHECKOUT</p>
          <h1>确认模块与交付范围</h1>
          <span
            >{{ company?.name
            }}<b
              v-if="company?.localName && company.localName !== company.name"
            >
              / {{ company.localName }}</b
            ></span
          >
        </div>
        <article>
          <h2>已选报告模块</h2>
          <div
            v-for="item in quote?.products || []"
            :key="item.code"
            class="line"
          >
            <span>{{ item.code }} · {{ item.name }}</span
            ><b>¥{{ item.price }}</b>
          </div>
        </article>
        <article>
          <h2>支付方式</h2>
          <label
            ><input v-model="channel" value="BALANCE" type="radio" />
            账户余额</label
          ><label
            ><input v-model="channel" value="WECHAT_MOCK" type="radio" />
            微信支付 <em>示例接口</em></label
          ><label
            ><input v-model="channel" value="ALIPAY_MOCK" type="radio" /> 支付宝
            <em>示例接口</em></label
          >
        </article>
        <article>
          <h2>发票</h2>
          <label
            ><input v-model="invoiceRequested" type="checkbox" />
            本次交易申请开票</label
          >
          <p>
            支付成功后提交开票申请；当前开票上游为示例接口，发票信息可保存至个人中心。
          </p>
        </article>
      </section>
      <aside>
        <h3>订单金额</h3>
        <span
          >模块小计 <b>¥{{ quote?.subtotal }}</b></span
        ><span
          >组合优惠 <b>-¥{{ quote?.discount }}</b></span
        ><strong>应付 ¥{{ quote?.total }}</strong>
        <p v-if="channel !== 'BALANCE'">
          当前为 Mock/示例支付，不会发生真实扣款。
        </p>
        <p v-if="error" class="error">{{ error }}</p>
        <button :disabled="pending" @click="pay">
          {{ pending ? "处理中…" : "确认支付并生成报告" }}
        </button>
      </aside>
    </div>
  </main>
</template>
<style scoped>
:global(*) {
  box-sizing: border-box;
}
:global(body) {
  margin: 0;
  font-family: Inter, "PingFang SC", sans-serif;
  background: #f5f7f7;
  color: #173b33;
}
:global(a) {
  color: inherit;
  text-decoration: none;
}
header {
  height: 72px;
  padding: 0 6vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-bottom: 1px solid #dce6e3;
}
.wrap {
  max-width: 1100px;
  margin: 45px auto;
  padding: 0 22px;
  display: grid;
  grid-template-columns: 1fr 330px;
  gap: 22px;
}
.title p {
  color: #0a9f7b;
  font-weight: 900;
  letter-spacing: 0.12em;
}
.title h1 {
  font-size: 38px;
  margin: 8px 0;
}
.title > span {
  color: #667b75;
}
article,
aside {
  background: #fff;
  border: 1px solid #dae5e1;
  border-radius: 18px;
  padding: 24px;
  margin-top: 16px;
}
article h2 {
  font-size: 19px;
  margin-top: 0;
}
.line {
  display: flex;
  justify-content: space-between;
  padding: 13px 0;
  border-bottom: 1px solid #edf1ef;
}
article label {
  display: block;
  padding: 12px 0;
  font-weight: 700;
}
article em {
  font-style: normal;
  color: #e96247;
  background: #fff1ed;
  padding: 4px 7px;
  border-radius: 8px;
  font-size: 12px;
}
article p,
aside p {
  color: #6c7f7a;
  line-height: 1.6;
}
aside {
  position: sticky;
  top: 18px;
  height: max-content;
  margin: 0;
  display: grid;
  gap: 14px;
}
aside span {
  display: flex;
  justify-content: space-between;
}
aside > strong {
  font-size: 28px;
  text-align: right;
  border-top: 1px solid #e4eae8;
  padding-top: 18px;
}
aside button {
  border: 0;
  border-radius: 12px;
  padding: 15px;
  background: #0a9f7b;
  color: #fff;
  font-weight: 850;
  font-size: 16px;
}
.error {
  color: #d64b35;
}
@media (max-width: 800px) {
  .wrap {
    grid-template-columns: 1fr;
  }
  aside {
    position: static;
  }
}
</style>
