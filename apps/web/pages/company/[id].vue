<script setup lang="ts">
const route = useRoute();
const config = useRuntimeConfig();
const selected = ref<string[]>([]);
const { data: company } = await useFetch<Record<string, unknown>>(
  `${config.public.apiBase}/companies/${route.params.id}`,
  { transform: (response: any) => response.data },
);
const { data: products } = await useFetch<Array<any>>(
  `${config.public.apiBase}/report-products`,
);
const quote = computed(() => {
  const picked = (products.value || []).filter((item) =>
    selected.value.includes(item.code),
  );
  const subtotal = picked.reduce((sum, item) => sum + item.price, 0);
  const discount = picked.length >= 3 ? Math.round(subtotal * 0.12) : 0;
  return { subtotal, discount, total: subtotal - discount };
});
function toggle(code: string) {
  selected.value = selected.value.includes(code)
    ? selected.value.filter((item) => item !== code)
    : [...selected.value, code];
}
function checkout() {
  if (selected.value.length)
    navigateTo({
      path: "/checkout",
      query: {
        company: String(route.params.id),
        modules: selected.value.join(","),
      },
    });
}
</script>
<template>
  <main>
    <header class="top">
      <NuxtLink to="/">SQJ 商情据</NuxtLink><span>选择调查模块</span
      ><NuxtLink to="/account">个人中心</NuxtLink>
    </header>
    <section class="subject">
      <p>已确认企业主体</p>
      <h1>{{ company?.name }}</h1>
      <h2 v-if="company?.localName && company.localName !== company.name">
        {{ company.localName }}
      </h2>
      <span
        >{{ company?.countryName || company?.country }} ·
        {{ company?.registrationNumber }} · {{ company?.status }}</span
      >
    </section>
    <div class="layout">
      <section class="modules">
        <article
          v-for="product in products || []"
          :key="product.code"
          :class="{ selected: selected.includes(product.code) }"
          @click="toggle(product.code)"
        >
          <div class="tag">{{ product.code }}</div>
          <div class="state">{{ product.coverage }}</div>
          <h3>{{ product.name }}</h3>
          <p>{{ product.summary }}</p>
          <div class="fields">
            <span v-for="field in product.fields" :key="field">{{
              field
            }}</span>
          </div>
          <footer>
            <strong>¥{{ product.price }}</strong
            ><button>
              {{ selected.includes(product.code) ? "✓ 已选择" : "选择模块" }}
            </button>
          </footer>
        </article>
      </section>
      <aside>
        <h3>本次调查</h3>
        <p v-if="!selected.length">请选择需要的报告模块</p>
        <ul>
          <li v-for="code in selected" :key="code">
            <span
              >{{ code }}
              {{ products?.find((item) => item.code === code)?.name }}</span
            ><button @click.stop="toggle(code)">×</button>
          </li>
        </ul>
        <div class="money">
          <span
            >模块小计 <b>¥{{ quote.subtotal }}</b></span
          ><span v-if="quote.discount"
            >组合优惠 12% <b>-¥{{ quote.discount }}</b></span
          ><strong>应付 ¥{{ quote.total }}</strong>
        </div>
        <button class="checkout" :disabled="!selected.length" @click="checkout">
          查看订单与交付范围 →</button
        ><small>支付前检查覆盖 · 自动生成 PDF · 报告内 AI 问答</small>
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
  background: #f4f7f6;
  color: #12332c;
}
:global(a) {
  color: inherit;
  text-decoration: none;
}
.top {
  height: 72px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 6vw;
  background: #fff;
  border-bottom: 1px solid #dce7e3;
  font-weight: 800;
}
.subject {
  max-width: 1220px;
  margin: 0 auto;
  padding: 54px 24px 34px;
}
.subject p {
  color: #0a9f7b;
  font-weight: 800;
}
.subject h1 {
  font-size: 38px;
  margin: 8px 0;
}
.subject h2 {
  font-size: 22px;
  margin: 0 0 12px;
}
.subject span {
  color: #61756f;
}
.layout {
  max-width: 1220px;
  margin: 0 auto;
  padding: 0 24px 80px;
  display: grid;
  grid-template-columns: 1fr 330px;
  gap: 22px;
  align-items: start;
}
.modules {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.modules article {
  position: relative;
  padding: 24px;
  background: #fff;
  border: 1px solid #d8e4e0;
  border-radius: 18px;
  cursor: pointer;
  min-width: 0;
}
.modules article.selected {
  border: 2px solid #655cf6;
  box-shadow: 0 12px 30px rgba(64, 55, 200, 0.08);
}
.tag {
  display: inline-block;
  color: #655cf6;
  font-weight: 900;
}
.state {
  position: absolute;
  right: 20px;
  top: 20px;
  padding: 5px 9px;
  border-radius: 12px;
  background: #e3f7f0;
  color: #08785f;
  font-size: 12px;
}
.modules h3 {
  font-size: 21px;
  margin: 22px 0 8px;
}
.modules p {
  color: #647771;
  min-height: 42px;
}
.fields {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin: 18px 0;
}
.fields span {
  font-size: 12px;
  background: #f1f4f5;
  padding: 5px 7px;
  border-radius: 5px;
}
.modules footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #e4ebe8;
  padding-top: 18px;
}
.modules footer strong {
  font-size: 23px;
}
.modules button,
aside button {
  border: 0;
  border-radius: 9px;
  padding: 10px 14px;
  color: #4942d3;
  background: #eef0ff;
  font-weight: 750;
}
aside {
  position: sticky;
  top: 20px;
  padding: 22px;
  background: #fff;
  border: 1px solid #d8e4e0;
  border-radius: 18px;
  box-shadow: 0 18px 45px rgba(23, 59, 51, 0.08);
}
aside ul {
  list-style: none;
  padding: 0;
}
aside li {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #edf1ef;
  font-size: 13px;
}
aside li button {
  padding: 2px 7px;
  background: transparent;
}
.money {
  display: grid;
  gap: 10px;
  margin: 22px 0;
}
.money span {
  display: flex;
  justify-content: space-between;
  color: #647771;
}
.money > strong {
  text-align: right;
  font-size: 28px;
}
.checkout {
  width: 100%;
  padding: 14px;
  background: linear-gradient(90deg, #555cf5, #a24fe5);
  color: #fff;
}
.checkout:disabled {
  opacity: 0.4;
}
aside small {
  display: block;
  text-align: center;
  margin-top: 14px;
  color: #647771;
}
@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .modules {
    grid-template-columns: 1fr;
  }
  aside {
    position: static;
  }
}
</style>
