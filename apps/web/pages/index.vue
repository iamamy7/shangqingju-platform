<script setup lang="ts">
const scope = ref<"global" | "domestic">("global");
const query = ref("");
const config = useRuntimeConfig();
const pending = ref(false);
const searched = ref(false);
const errorMessage = ref("");
const candidates = ref<Array<Record<string, any>>>([]);
const { data: homepage, error: homepageError } = await useFetch<any>(`${config.public.apiBase}/home`);
const hero = computed(() => homepage.value?.hero);
const suggestions = computed<string[]>(() => hero.value?.suggestions?.[scope.value === "domestic" ? "CN" : "GLOBAL"] || []);
const searchPlaceholder = computed(() => hero.value?.placeholders?.[scope.value === "domestic" ? "CN" : "GLOBAL"]?.zh || "输入企业名称、注册号、品牌或地址");
const scenarios = computed(() => homepage.value?.scenarios?.items || []);

function searchSuggestion(value: string) { query.value = value; void searchCompanies(); }
function searchScenario(index: string | number) {
  const position = Number(index);
  query.value = suggestions.value[position % Math.max(suggestions.value.length, 1)] || "";
  if (query.value) void searchCompanies();
}
async function searchCompanies() {
  if (!query.value.trim()) return;
  pending.value = true; searched.value = true; errorMessage.value = "";
  try {
    const response = await $fetch<{ data: { candidates: Array<Record<string, any>> } }>(`${config.public.apiBase}/companies/search/resolve`, {
      method: "POST", body: { name: query.value.trim(), countryIso2: scope.value === "domestic" ? "CN" : undefined, limit: 10 },
    });
    candidates.value = response.data.candidates;
  } catch {
    candidates.value = [];
    errorMessage.value = "企业查询暂时没有返回结果。请检查网络后重试，或补充国家、注册号和地址。";
  } finally { pending.value = false; }
}
</script>

<template>
  <div class="home-page">
    <SqjSiteHeader />
    <main>
      <section class="hero">
        <div class="hero-orbit orbit-one"></div><div class="hero-orbit orbit-two"></div>
        <div class="sqj-container hero-inner">
          <p class="sqj-kicker">GLOBAL ENTITY INTELLIGENCE</p>
          <h1 class="sqj-display">{{ hero?.title?.zh || "查全球企业，就用商情据" }}</h1>
          <p class="hero-description">{{ hero?.description?.zh || "从主体识别到股权、司法、财务与经营证据，一次查询形成可追溯判断。" }}</p>
          <p v-if="homepageError" class="config-error">首页服务暂时不可用，搜索功能仍可继续尝试。</p>
          <div class="search-station">
            <div class="scope-row">
              <div><strong>查询范围</strong><span>两个数据库独立检索</span></div>
              <div class="scope" role="radiogroup" aria-label="企业数据库">
                <button :class="{ active: scope === 'global' }" type="button" role="radio" :aria-checked="scope === 'global'" @click="scope = 'global'"><b>全球库</b><small>海外及港澳台</small></button>
                <button :class="{ active: scope === 'domestic' }" type="button" role="radio" :aria-checked="scope === 'domestic'" @click="scope = 'domestic'"><b>国内库</b><small>中国大陆主体</small></button>
              </div>
            </div>
            <form class="search-form" @submit.prevent="searchCompanies">
              <span class="search-icon">⌕</span><label class="sr-only" for="company-search">企业名称或注册号</label>
              <input id="company-search" v-model="query" :placeholder="searchPlaceholder" autocomplete="off" />
              <button type="submit" :disabled="pending">{{ pending ? "正在识别主体…" : "查询企业" }}<span>→</span></button>
            </form>
            <div class="suggestions"><span>近期查询</span><button v-for="item in suggestions" :key="item" type="button" @click="searchSuggestion(item)">{{ item }}</button></div>
          </div>
          <SqjFlightTrace class="trace" />
        </div>
      </section>

      <section v-if="searched" class="results sqj-container" aria-live="polite">
        <header class="section-head"><div><p class="sqj-kicker">ENTITY RESOLUTION</p><h2 class="sqj-display">确认您要调查的企业</h2><p>按国家、注册号和地址区分同名主体。</p></div><span>{{ pending ? "正在查询" : `${candidates.length} 个候选主体` }}</span></header>
        <div v-if="pending" class="result-skeleton"><i v-for="n in 3" :key="n"></i></div>
        <div v-else-if="errorMessage || !candidates.length" class="empty-state"><b>没有找到可确认的企业主体</b><p>{{ errorMessage || "请补充国家、注册号或地址后重新查询。" }}</p><button class="sqj-button secondary" type="button" @click="searched = false">修改查询条件</button></div>
        <div v-else class="result-list">
          <article v-for="company in candidates" :key="String(company.id)">
            <div class="company-country"><b>{{ String(company.country || "--") }}</b><small>{{ company.countryName || "注册地" }}</small></div>
            <div class="company-copy"><h3>{{ company.name }}</h3><strong v-if="company.localName && company.localName !== company.name">{{ company.localName }}</strong><p>{{ company.registrationNumber }} · {{ company.status }}</p><small>{{ company.address }}</small></div>
            <div class="evidence"><span>主体匹配</span><b>{{ company.matchScore ? `${Math.round(company.matchScore * 100)}%` : "可确认" }}</b></div>
            <NuxtLink class="sqj-button" :to="`/company/${company.id}`">选择企业 →</NuxtLink>
          </article>
        </div>
      </section>

      <template v-else>
        <section class="decision sqj-container">
          <header class="section-head"><div><p class="sqj-kicker">DECISION ENTRY</p><h2 class="sqj-display">从正在做的决定开始</h2></div><p>不必先理解复杂字段。选择场景，系统会推荐需要核验的企业信息。</p></header>
          <div class="decision-grid">
            <button v-for="(item, index) in scenarios" :key="item.title.zh" type="button" @click="searchScenario(index)"><span>{{ String(Number(index) + 1).padStart(2, "0") }}</span><small>{{ item.tag.zh }}</small><strong>{{ item.title.zh }}</strong><em>开始查询 →</em></button>
          </div>
        </section>
        <section class="signal-section"><div class="sqj-container signal-grid"><div><p class="sqj-kicker">SOURCES · QUERY · JUDGMENT</p><h2 class="sqj-display">一条主体航迹，连接查询、报告和 API</h2><p>企业一旦确认，后续模块购买、报告交付与 API 调用都使用同一个企业主体 ID，证据来源和更新时间始终可追踪。</p></div><dl><div><dt>主体识别</dt><dd>名称、注册地与注册号交叉确认</dd></div><div><dt>证据模块</dt><dd>股权、司法、财务和经营按需组合</dd></div><div><dt>统一交付</dt><dd>Web 报告、PDF 与 API 使用同源数据</dd></div></dl></div></section>
      </template>
    </main>
    <SqjSiteFooter />
  </div>
</template>

<style scoped>
.home-page{min-height:100vh;overflow:clip}.hero{position:relative;min-height:650px;padding:92px 0 54px;background:radial-gradient(circle at 15% 10%,rgba(0,183,132,.11),transparent 34%),linear-gradient(115deg,#f8fbfa 0%,#f2f8f6 52%,#fff9f3 100%);border-bottom:1px solid var(--sqj-line)}.hero-inner{position:relative;z-index:1;text-align:center}.hero h1{max-width:920px;margin:18px auto;font-size:clamp(42px,5.3vw,72px)}.hero-description{max-width:730px;margin:0 auto;color:var(--sqj-muted);font-size:18px}.config-error{color:var(--sqj-risk);font-size:14px}.hero-orbit{position:absolute;border:1px solid rgba(0,183,132,.12);border-radius:50%}.orbit-one{width:470px;height:470px;left:-220px;top:90px}.orbit-two{width:330px;height:330px;right:-140px;bottom:-100px;border-color:rgba(255,180,74,.18)}
.search-station{max-width:980px;margin:42px auto 24px;padding:18px;text-align:left;background:rgba(255,255,255,.94);border:1px solid var(--sqj-line);border-radius:var(--sqj-radius-lg);box-shadow:var(--sqj-shadow)}.scope-row{display:flex;align-items:center;justify-content:space-between;gap:22px;margin-bottom:14px}.scope-row>div:first-child{display:grid}.scope-row strong{font-size:14px}.scope-row span{color:var(--sqj-muted);font-size:12px}.scope{display:flex;gap:8px}.scope button{min-width:150px;display:grid;padding:9px 14px;border:1px solid transparent;border-radius:var(--sqj-radius-sm);color:var(--sqj-muted);background:var(--sqj-cloud);text-align:left;cursor:pointer}.scope button b{color:var(--sqj-ink-soft);font-size:14px}.scope button small{font-size:11px}.scope button.active{border-color:rgba(0,183,132,.38);background:rgba(0,183,132,.09)}.scope button.active b{color:var(--sqj-flight-deep)}
.search-form{height:64px;display:grid;grid-template-columns:34px 1fr auto;align-items:center;padding:6px 6px 6px 17px;border:1px solid #c7d8d3;border-radius:12px;background:#fff}.search-icon{color:var(--sqj-flight-deep);font-size:28px;line-height:1;transform:rotate(-18deg)}.search-form input{min-width:0;height:100%;padding:0 12px;border:0;outline:0;color:var(--sqj-ink);background:transparent;font-size:16px}.search-form button{align-self:stretch;min-width:132px;border:0;border-radius:8px;color:#fff;background:var(--sqj-flight);font-weight:750;cursor:pointer}.search-form button:disabled{opacity:.65}.suggestions{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:13px 4px 0;color:var(--sqj-muted);font-size:12px}.suggestions button{padding:4px 8px;border:0;border-radius:6px;color:var(--sqj-ink-soft);background:var(--sqj-mist);cursor:pointer}.trace{max-width:650px;margin:0 auto}
.section-head{display:flex;align-items:end;justify-content:space-between;gap:32px;margin-bottom:25px}.section-head h2{margin-top:9px;font-size:clamp(30px,3vw,43px)}.section-head p:not(.sqj-kicker){max-width:530px;margin:8px 0 0;color:var(--sqj-muted)}.section-head>span{padding:7px 11px;border-radius:99px;color:var(--sqj-flight-deep);background:rgba(0,183,132,.1);font-size:13px;font-weight:700}.results,.decision{padding-top:78px;padding-bottom:45px}
.result-list{display:grid;gap:12px}.result-list article{display:grid;grid-template-columns:116px minmax(0,1fr) 100px auto;gap:22px;align-items:center;padding:22px;border:1px solid var(--sqj-line);border-radius:var(--sqj-radius);background:#fff}.company-country{align-self:stretch;display:grid;align-content:center;padding-right:20px;border-right:1px solid var(--sqj-line)}.company-country b{font:800 20px var(--sqj-mono)}.company-country small,.company-copy small{color:var(--sqj-muted)}.company-copy h3{margin:0 0 3px;font-size:19px}.company-copy strong{font-size:14px}.company-copy p{margin:5px 0;color:var(--sqj-muted);font-size:14px}.evidence{display:grid;text-align:right}.evidence span{color:var(--sqj-muted);font-size:11px}.evidence b{color:var(--sqj-flight-deep)}.empty-state{padding:58px 24px;border:1px dashed #b8cdc7;border-radius:var(--sqj-radius);background:#fff;text-align:center}.empty-state b{font-size:20px}.empty-state p{color:var(--sqj-muted)}.result-skeleton{display:grid;gap:12px}.result-skeleton i{height:100px;border-radius:var(--sqj-radius);background:linear-gradient(90deg,#e8efed 20%,#f7faf9 50%,#e8efed 80%);background-size:200% 100%;animation:shimmer 1.5s infinite}
.decision-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.decision-grid button{min-height:190px;display:flex;flex-direction:column;align-items:flex-start;padding:22px;border:1px solid var(--sqj-line);border-radius:var(--sqj-radius);background:#fff;text-align:left;cursor:pointer;transition:transform .18s,border-color .18s}.decision-grid button:hover{transform:translateY(-3px);border-color:var(--sqj-flight)}.decision-grid span{color:var(--sqj-flight-deep);font:700 11px var(--sqj-mono)}.decision-grid small{margin:34px 0 5px;color:var(--sqj-muted)}.decision-grid strong{font-size:18px;line-height:1.45}.decision-grid em{margin-top:auto;color:var(--sqj-flight-deep);font-style:normal;font-size:13px;font-weight:700}
.signal-section{margin-top:38px;padding:70px 0;color:#fff;background:var(--sqj-ink)}.signal-section .sqj-kicker{color:var(--sqj-flight)}.signal-grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:90px;align-items:center}.signal-grid h2{margin:12px 0 18px;font-size:clamp(31px,3.5vw,48px)}.signal-grid>div>p:last-child{color:#aac0ba}.signal-grid dl{margin:0}.signal-grid dl div{display:grid;grid-template-columns:150px 1fr;gap:24px;padding:18px 0;border-bottom:1px solid rgba(255,255,255,.12)}.signal-grid dt{color:var(--sqj-flight);font-weight:700}.signal-grid dd{margin:0;color:#c1d2cd}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@keyframes shimmer{from{background-position:200% 0}to{background-position:-200% 0}}
@media(max-width:900px){.decision-grid{grid-template-columns:1fr 1fr}.result-list article{grid-template-columns:90px 1fr}.evidence{text-align:left}.result-list article .sqj-button{grid-column:2;justify-self:start}.signal-grid{grid-template-columns:1fr;gap:35px}}@media(max-width:640px){.hero{min-height:auto;padding:64px 0 40px}.hero h1{font-size:40px}.hero-description{font-size:16px}.scope-row{align-items:flex-start;flex-direction:column}.scope{width:100%}.scope button{min-width:0;flex:1}.search-form{height:auto;grid-template-columns:28px 1fr}.search-form input{height:52px}.search-form button{grid-column:1/-1;min-height:48px}.section-head{align-items:flex-start;flex-direction:column}.decision-grid{grid-template-columns:1fr}.decision-grid button{min-height:150px}.result-list article{grid-template-columns:1fr}.company-country{border-right:0;border-bottom:1px solid var(--sqj-line);padding:0 0 12px}.result-list article .sqj-button{grid-column:1}.signal-grid dl div{grid-template-columns:1fr;gap:3px}}
</style>
