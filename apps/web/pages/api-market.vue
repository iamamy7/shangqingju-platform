<script setup lang="ts">
const config = useRuntimeConfig();
const activeCategory = ref("");
const keyword = ref("");
const { data: categoryData } = await useFetch<{ items: Array<{ name: string; count: number }> }>(`${config.public.apiBase}/api-products/categories`);
const { data: productData, refresh, pending, error } = await useFetch<{ total: number; items: Array<Record<string, any>> }>(`${config.public.apiBase}/api-products`, {
  query: computed(() => ({ category: activeCategory.value || undefined, q: keyword.value || undefined })),
});
watch(activeCategory, () => refresh());
</script>

<template>
  <div class="api-page">
    <SqjSiteHeader />
    <header class="developer-bar"><div class="sqj-container"><div><b>API 市场</b><small>人民币余额 · 成功调用后扣费</small></div><nav><NuxtLink class="active" to="/api-market">能力目录</NuxtLink><NuxtLink to="/account">API Key</NuxtLink><NuxtLink to="/account">调用与账单</NuxtLink></nav><NuxtLink class="console" to="/account">进入开发者中心 →</NuxtLink></div></header>

    <main class="sqj-container api-workspace">
      <aside class="taxonomy">
        <header><span>&lt;/&gt;</span><div><h2>API 分类</h2><p>{{ productData?.total || 33 }} CAPABILITIES</p></div></header>
        <button :class="{ active: !activeCategory }" type="button" @click="activeCategory = ''"><span>所有 API</span><b>{{ productData?.total || 33 }}</b></button>
        <button v-for="category in categoryData?.items || []" :key="category.name" :class="{ active: activeCategory === category.name }" type="button" @click="activeCategory = category.name"><span>{{ category.name }}</span><b>{{ category.count }}</b></button>
        <div class="billing-note"><strong>统一余额计费</strong><p>充值后默认可调用全部接口；只有成功返回的请求才扣除人民币余额。</p></div>
      </aside>

      <section class="catalog">
        <header class="catalog-intro">
          <div><p class="sqj-kicker">DISCOVER · COMPARE · INTEGRATE</p><h1 class="sqj-display">全球企业数据能力目录</h1><span>先按业务场景筛选接口，再进入详情查看参数、返回字段、调用示例和每次调用价格。</span></div>
          <form @submit.prevent="refresh()"><label for="api-search">搜索接口</label><div><input id="api-search" v-model="keyword" placeholder="名称、OperationId 或接口路径" /><button type="submit">搜索</button></div></form>
        </header>

        <div class="catalog-summary"><div><p class="sqj-kicker">{{ activeCategory || "ALL CAPABILITIES" }}</p><h2>{{ activeCategory || "所有 API" }}</h2></div><span>共 {{ productData?.total || 0 }} 个接口</span></div>

        <div class="api-table" :aria-busy="pending">
          <div class="table-head"><span>接口能力</span><span>请求路径</span><span>计费</span><span></span></div>
          <div v-if="pending" class="loading">正在读取接口目录…</div>
          <div v-else-if="error" class="loading error">接口目录暂时不可用，请稍后刷新。</div>
          <NuxtLink v-for="product in productData?.items || []" v-else :key="String(product.operationId)" :to="`/api/${product.operationId}`" class="api-row">
            <div class="capability"><small>{{ product.apiId }} · {{ product.category }}</small><h3>{{ product.nameZh }}</h3><p>{{ product.description }}</p></div>
            <code><b>{{ product.method }}</b>{{ product.path }}</code>
            <div class="price"><strong>¥{{ Number(product.unitPrice).toFixed(2) }}</strong><small>/ 成功调用</small></div>
            <span class="detail-link">查看技术文档 →</span>
          </NuxtLink>
        </div>
      </section>
    </main>
    <SqjSiteFooter />
  </div>
</template>

<style scoped>
.developer-bar{height:60px;background:#fff;border-bottom:1px solid var(--sqj-line)}.developer-bar>.sqj-container{height:100%;display:grid;grid-template-columns:280px 1fr auto;align-items:center;gap:30px}.developer-bar>div>div{display:flex;align-items:center;gap:10px}.developer-bar span{color:var(--sqj-muted);font-size:12px}.developer-bar b{font-size:15px}.developer-bar small{padding-left:10px;border-left:1px solid var(--sqj-line);color:var(--sqj-signal);font-size:11px}.developer-bar nav{display:flex;justify-content:center;gap:28px}.developer-bar nav a{color:var(--sqj-muted);font-size:13px}.developer-bar nav a.active{color:var(--sqj-flight-deep);font-weight:750}.console{color:var(--sqj-flight-deep);font-size:13px;font-weight:700}
.api-workspace{display:grid;grid-template-columns:250px minmax(0,1fr);gap:26px;padding-top:30px;align-items:start}.taxonomy{position:sticky;top:106px;padding:16px;border:1px solid var(--sqj-line);border-radius:var(--sqj-radius-lg);background:#fff}.taxonomy header{display:flex;gap:12px;align-items:center;padding:7px 8px 17px;border-bottom:1px solid var(--sqj-line)}.taxonomy header>span{width:42px;height:42px;display:grid;place-items:center;border-radius:10px;color:var(--sqj-flight-deep);background:rgba(0,183,132,.1);font:800 15px var(--sqj-mono)}.taxonomy h2{margin:0;font-size:18px}.taxonomy header p{margin:1px 0 0;color:var(--sqj-muted);font:10px var(--sqj-mono);letter-spacing:.09em}.taxonomy button{width:100%;min-height:46px;display:flex;justify-content:space-between;align-items:center;margin-top:6px;padding:0 12px;border:1px solid transparent;border-radius:9px;color:var(--sqj-muted);background:transparent;text-align:left;cursor:pointer}.taxonomy button b{min-width:28px;padding:2px 7px;border-radius:99px;background:var(--sqj-mist);font-size:11px;text-align:center}.taxonomy button.active{border-color:rgba(0,183,132,.35);color:var(--sqj-flight-deep);background:rgba(0,183,132,.09);font-weight:750}.taxonomy button.active b{color:#fff;background:var(--sqj-flight)}.billing-note{margin-top:18px;padding:15px;border-radius:10px;color:#d9e7e3;background:var(--sqj-ink)}.billing-note strong{color:#fff;font-size:13px}.billing-note p{margin:7px 0 0;color:#a9bdb7;font-size:12px}
.catalog-intro{display:grid;grid-template-columns:1fr minmax(310px,.7fr);gap:50px;align-items:end;padding:34px;border:1px solid var(--sqj-line);border-radius:var(--sqj-radius-lg);background:linear-gradient(125deg,#fff 0%,#f5faf8 72%,#fff8ee 100%)}.catalog-intro h1{margin:11px 0 12px;font-size:clamp(34px,3.5vw,44px)}.catalog-intro>div>span{display:block;max-width:680px;color:var(--sqj-muted)}.catalog-intro form label{display:block;margin-bottom:7px;color:var(--sqj-muted);font-size:12px}.catalog-intro form>div{height:50px;display:flex;padding:5px;border:1px solid #c9d9d4;border-radius:10px;background:#fff}.catalog-intro input{min-width:0;flex:1;padding:0 12px;border:0;outline:0}.catalog-intro form button{padding:0 18px;border:0;border-radius:7px;color:#fff;background:var(--sqj-flight);font-weight:700;cursor:pointer}.catalog-summary{display:flex;justify-content:space-between;align-items:end;padding:24px 3px 15px}.catalog-summary h2{margin:4px 0 0;font-size:24px}.catalog-summary>span{color:var(--sqj-muted);font-size:13px}
.api-table{overflow:hidden;border:1px solid var(--sqj-line);border-radius:var(--sqj-radius);background:#fff}.table-head,.api-row{display:grid;grid-template-columns:minmax(300px,1.25fr) minmax(260px,.9fr) 125px 130px;gap:20px;align-items:center}.table-head{min-height:43px;padding:0 20px;color:var(--sqj-muted);background:#f1f6f4;font-size:12px;font-weight:700}.api-row{min-height:122px;padding:18px 20px;border-top:1px solid var(--sqj-line);transition:background .18s}.api-row:hover{background:#f8fbfa}.capability small{color:var(--sqj-flight-deep);font:10px var(--sqj-mono)}.capability h3{margin:5px 0 4px;font-size:18px}.capability p{margin:0;color:var(--sqj-muted);font-size:13px;line-height:1.55}.api-row code{display:flex;align-items:flex-start;gap:9px;overflow-wrap:anywhere;color:var(--sqj-ink-soft);font:12px/1.55 var(--sqj-mono)}.api-row code b{padding:2px 5px;border-radius:4px;color:var(--sqj-flight-deep);background:rgba(0,183,132,.1);font-size:10px}.price{display:grid}.price strong{color:var(--sqj-ink);font-size:17px}.price small{color:var(--sqj-muted);font-size:10px}.detail-link{color:var(--sqj-flight-deep);font-size:12px;font-weight:750;text-align:right}.loading{padding:50px;text-align:center;color:var(--sqj-muted)}.loading.error{color:var(--sqj-risk)}
@media(max-width:1050px){.developer-bar>.sqj-container{grid-template-columns:1fr auto}.developer-bar nav{display:none}.api-workspace{grid-template-columns:1fr}.taxonomy{position:static;display:flex;gap:6px;overflow-x:auto}.taxonomy header,.billing-note{display:none}.taxonomy button{flex:none;width:auto}.table-head,.api-row{grid-template-columns:minmax(280px,1.2fr) minmax(220px,.8fr) 100px}.table-head span:last-child,.detail-link{display:none}}@media(max-width:720px){.developer-bar>div>div small{display:none}.console{display:none}.developer-bar>.sqj-container{display:flex}.catalog-intro{grid-template-columns:1fr;padding:24px}.api-workspace{padding-top:18px}.table-head{display:none}.api-row{grid-template-columns:1fr;gap:10px}.api-row code{padding:10px;border-radius:7px;background:var(--sqj-cloud)}.detail-link{display:block;text-align:left}.price{display:flex;align-items:baseline;gap:5px}}
</style>
