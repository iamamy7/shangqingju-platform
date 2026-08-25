<script setup lang="ts">
const config = useRuntimeConfig();
const activeCategory = ref("");
const keyword = ref("");

const { data: categoryData } = await useFetch<{ items: Array<{ name: string; count: number }> }>(
  `${config.public.apiBase}/api-products/categories`
);

const { data: productData, refresh, pending } = await useFetch<{ total: number; items: Array<Record<string, unknown>> }>(
  `${config.public.apiBase}/api-products`,
  { query: computed(() => ({ category: activeCategory.value || undefined, q: keyword.value || undefined })) }
);

watch(activeCategory, () => refresh());
</script>

<template>
  <main class="api-page">
    <header class="topbar"><NuxtLink to="/" class="brand"><img src="/sqj-lockup-v4.svg" alt="商情局" /></NuxtLink><strong>数据 API 市场</strong><NuxtLink to="/">返回产品首页</NuxtLink></header>
    <div class="workspace">
      <aside>
        <h2>API 分类</h2><p>33 个企业数据接口</p>
        <button :class="{ active: !activeCategory }" @click="activeCategory = ''"><span>所有 API</span><b>33</b></button>
        <button v-for="category in categoryData?.items || []" :key="category.name" :class="{ active: activeCategory === category.name }" @click="activeCategory = category.name"><span>{{ category.name }}</span><b>{{ category.count }}</b></button>
      </aside>
      <section class="catalog">
        <div class="intro"><p>GLOBAL DATA API MARKET</p><h1>企业数据能力目录</h1><span>按分类查找接口，查看参数、返回字段、调用示例和按次价格。</span><form @submit.prevent="refresh()"><input v-model="keyword" placeholder="搜索接口名称、OperationId 或路径" /><button>搜索</button></form></div>
        <div class="summary"><strong>{{ activeCategory || "所有 API" }}</strong><span>共 {{ productData?.total || 0 }} 个接口</span></div>
        <div class="table" :aria-busy="pending">
          <NuxtLink v-for="product in productData?.items || []" :key="String(product.operationId)" :to="`/api/${product.operationId}`" class="row">
            <div><small>{{ product.apiId }} · {{ product.category }}</small><h3>{{ product.nameZh }}</h3><p>{{ product.description }}</p></div>
            <code>{{ product.method }} {{ product.path }}</code>
            <strong>¥{{ product.unitPrice }} / 次</strong><span>查看详情 →</span>
          </NuxtLink>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
:global(*){box-sizing:border-box}:global(body){margin:0;font-family:Inter,"PingFang SC",sans-serif;background:#f3f7f6;color:#173b33}:global(a){color:inherit;text-decoration:none}.topbar{height:76px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 32px;background:#fff;border-bottom:1px solid #dce7e3}.topbar>a:last-child{text-align:right;color:#08785f}.brand{font-size:24px;font-weight:900}.brand span{font-size:18px;margin-left:6px}.workspace{display:grid;grid-template-columns:270px minmax(0,1fr);gap:24px;max-width:1500px;margin:0 auto;padding:28px}aside{position:sticky;top:24px;height:max-content;padding:22px;background:#fff;border:1px solid #dae6e2;border-radius:18px}aside h2{margin:0}aside p{margin:6px 0 20px;color:#6e827d}aside button{width:100%;display:flex;justify-content:space-between;gap:10px;margin:7px 0;padding:13px 14px;border:0;border-radius:11px;background:transparent;text-align:left;color:#506b64}aside button.active{background:#ddf4ec;color:#08785f;font-weight:800}.intro,.summary,.row{background:#fff;border:1px solid #dae6e2;border-radius:18px}.intro{padding:30px}.intro>p{color:#0a9f7b;font-weight:900;letter-spacing:.12em}.intro h1{font-size:38px;margin:8px 0 10px}.intro>span{color:#60736f}.intro form{display:flex;gap:10px;margin-top:24px}.intro input{flex:1;padding:14px;border:1px solid #cddbd7;border-radius:11px;font-size:16px}.intro button{border:0;border-radius:11px;background:#0a9f7b;color:#fff;padding:0 22px;font-weight:800}.summary{display:flex;justify-content:space-between;padding:20px 24px;margin:16px 0}.summary span{color:#60736f}.table{display:grid;gap:12px}.row{display:grid;grid-template-columns:minmax(320px,1fr) minmax(280px,.7fr) 130px 100px;align-items:center;gap:20px;padding:22px;transition:.18s}.row:hover{border-color:#20af8b;box-shadow:0 10px 30px rgba(16,70,58,.08)}.row small{color:#0a9f7b}.row h3{margin:6px 0;font-size:20px}.row p{margin:0;color:#60736f}.row code{overflow-wrap:anywhere}.row>strong{color:#e96745}.row>span{color:#08785f;font-weight:750}@media(max-width:980px){.workspace{grid-template-columns:1fr}aside{position:static}.row{grid-template-columns:1fr}.topbar{grid-template-columns:1fr auto}.topbar>strong{display:none}}@media(max-width:640px){.topbar{padding:0 18px}.workspace{padding:16px}.intro h1{font-size:30px}.intro form{flex-direction:column}.intro button{padding:13px}.row{min-width:0}}
.brand{display:block;width:190px;height:54px}.brand img{width:100%;height:100%;object-fit:contain}
</style>
