<script setup lang="ts">
const scope = ref<"global" | "domestic">("global");
const query = ref("");
const config = useRuntimeConfig();
const pending = ref(false);
const searched = ref(false);
const errorMessage = ref("");
const candidates = ref<Array<Record<string, unknown>>>([]);
const { user } = useSqjAuth();

async function searchCompanies() {
  if (!query.value.trim()) return;
  pending.value = true;
  searched.value = true;
  errorMessage.value = "";
  try {
    const response = await $fetch<{
      data: { candidates: Array<Record<string, unknown>> };
    }>(`${config.public.apiBase}/companies/search/resolve`, {
      method: "POST",
      body: {
        name: query.value.trim(),
        countryIso2: scope.value === "domestic" ? "CN" : undefined,
        limit: 10,
      },
    });
    candidates.value = response.data.candidates;
  } catch {
    candidates.value = [];
    errorMessage.value = "查询服务暂时不可用，请稍后再试。";
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <main class="page">
    <header class="header">
      <NuxtLink class="brand" to="/"><img src="/sqj-lockup-v4.svg" alt="商情据" /></NuxtLink>
      <nav>
        <NuxtLink to="/">首页</NuxtLink
        ><NuxtLink to="/insights">热门资讯</NuxtLink
        ><NuxtLink to="/api-market">数据 API</NuxtLink>
      </nav>
      <NuxtLink class="login" :to="user ? '/account' : '/login'">{{
        user ? user.displayName : "登录"
      }}</NuxtLink>
    </header>
    <section class="hero">
      <p class="eyebrow">GLOBAL BUSINESS INTELLIGENCE</p>
      <h1>查清企业，洞见商业真相</h1>
      <p>从全球企业数据到可信判断，让每一次合作、采购与投资更有依据。</p>
      <div class="search-card">
        <div class="scope">
          <button
            :class="{ active: scope === 'global' }"
            @click="scope = 'global'"
          >
            全球库
          </button>
          <button
            :class="{ active: scope === 'domestic' }"
            @click="scope = 'domestic'"
          >
            国内库
          </button>
        </div>
        <form @submit.prevent="searchCompanies">
          <input
            v-model="query"
            placeholder="输入企业名称、注册号、品牌或地址"
          />
          <button type="submit" :disabled="pending">
            {{ pending ? "查询中…" : "查企业" }}
          </button>
        </form>
      </div>
      <div class="hot-search"><span>热门搜索</span><button @click="query='Northstar Components'; searchCompanies()">Northstar Components</button><button @click="query='OpenAI'; searchCompanies()">OpenAI</button><button @click="query='上海青岚科技'; searchCompanies()">上海青岚科技</button></div>
    </section>
    <section v-if="searched" class="results" aria-live="polite">
      <header>
        <div>
          <p>主体识别结果</p>
          <h2>确认您要调查的企业</h2>
        </div>
        <span>{{ candidates.length }} 个候选主体</span>
      </header>
      <p v-if="errorMessage" class="empty">{{ errorMessage }}</p>
      <p v-else-if="!pending && !candidates.length" class="empty">
        没有找到匹配企业，请补充国家、注册号或地址。
      </p>
      <div v-else class="result-list">
        <article v-for="company in candidates" :key="String(company.id)">
          <div class="company-mark">{{ String(company.country || "--") }}</div>
          <div class="company-copy">
            <h3>{{ company.name }}</h3>
            <strong
              v-if="company.localName && company.localName !== company.name"
              >{{ company.localName }}</strong
            >
            <p>
              {{ company.countryName || company.country }} ·
              {{ company.registrationNumber }} · {{ company.status }}
            </p>
            <small>{{ company.address }}</small>
          </div>
          <NuxtLink class="select" :to="`/company/${company.id}`"
            >选择企业</NuxtLink
          >
        </article>
      </div>
    </section>
    <section v-if="!searched" class="use-cases"><article><span>01</span><h3>跨境合作</h3><p>确认主体、股权与合规风险</p></article><article><span>02</span><h3>采购准入</h3><p>核查经营、司法与履约能力</p></article><article><span>03</span><h3>投资研究</h3><p>串联融资、年报与控制关系</p></article><article><span>04</span><h3>求职背调</h3><p>了解企业状态与经营风险</p></article></section>
    <footer class="site-footer"><div><img src="/sqj-lockup-v4.svg" alt="商情据" /><p>查企业、读资讯、买报告，用可追溯的信息支持商业判断。</p></div><nav><strong>产品</strong><NuxtLink to="/">企业查询</NuxtLink><NuxtLink to="/insights">热门资讯</NuxtLink><NuxtLink to="/api-market">数据 API</NuxtLink></nav><nav><strong>服务</strong><NuxtLink to="/account">个人中心</NuxtLink><NuxtLink to="/login">登录 / 注册</NuxtLink></nav><aside><strong>微信扫码进入小程序</strong><div class="qr">商<br/>情<br/>局</div></aside><small>© 2026 商情据 · 合肥易尊数字科技有限公司</small></footer>
  </main>
</template>

<style scoped>
:global(*) {
  box-sizing: border-box;
}
:global(body) {
  margin: 0;
  font-family: Inter, "PingFang SC", sans-serif;
  color: #102f29;
  background: #f6f9f8;
}
:global(a) {
  color: inherit;
  text-decoration: none;
}
.page {
  min-height: 100vh;
}
.header {
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 max(5vw, 28px);
  background: #fff;
  border-bottom: 1px solid #e3ebe8;
}
.brand{display:block;width:205px;height:54px}.brand img{width:100%;height:100%;object-fit:contain}
.header nav {
  display: flex;
  gap: 36px;
  font-weight: 650;
}
.header button,
.search-card button,
.results article > button {
  border: 0;
  border-radius: 12px;
  padding: 12px 20px;
  background: #0a9f7b;
  color: #fff;
  font-weight: 700;
}
.hero {
  max-width: 1120px;
  margin: 0 auto;
  padding: 82px 24px 58px;
  text-align: center;
}
.eyebrow {
  font-size: 13px;
  letter-spacing: 0.16em;
  color: #0a9f7b;
  font-weight: 800;
}
.hero h1 {
  font-family:"Songti SC",serif;font-size:clamp(40px,5vw,62px);letter-spacing:-.03em;
  margin: 18px 0 16px;
}
.hero > p:not(.eyebrow) {
  font-size: 18px;
  color: #60736f;
}
.search-card {
  margin: 48px auto 0;
  padding: 18px;
  background: #fff;
  border: 1px solid #dce7e3;
  max-width:940px;border-radius:18px;
  box-shadow: 0 20px 50px rgba(16, 47, 41, 0.1);
}
.scope {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}
.hot-search{display:flex;justify-content:center;gap:8px;align-items:center;margin-top:14px;color:#6d7e78;font-size:12px}.hot-search button{padding:6px 10px;border:0;border-radius:7px;background:#edf3f1;color:#566a64;cursor:pointer}
.scope button {
  background: #edf4f2;
  color: #516963;
}
.scope .active {
  background: #092f2a;
  color: #fff;
}
.search-card form {
  display: flex;
  gap: 10px;
}
.search-card input {
  flex: 1;
  min-width: 0;
  border: 1px solid #cddbd7;
  border-radius: 14px;
  padding: 17px 18px;
  font-size: 17px;
}
.search-card button:disabled {
  opacity: 0.6;
}
.results {
  max-width: 1120px;
  margin: 0 auto;
  padding: 10px 24px 90px;
}
.results > header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 22px;
}
.results header p {
  margin: 0 0 7px;
  color: #0a9f7b;
  font-weight: 800;
}
.results h2 {
  font-size: 30px;
  margin: 0;
}
.results header span {
  color: #60736f;
}
.result-list {
  display: grid;
  gap: 14px;
}
.result-list article {
  display: grid;
  grid-template-columns: 52px 1fr auto;
  gap: 18px;
  align-items: center;
  padding: 22px;
  background: white;
  border: 1px solid #dce7e3;
  border-radius: 18px;
}
.company-mark {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 15px;
  background: #e5f6f0;
  color: #08785f;
  font-weight: 900;
}
.company-copy h3 {
  margin: 0 0 6px;
  font-size: 20px;
}
.company-copy strong {
  display: block;
  margin-bottom: 6px;
}
.company-copy p,
.company-copy small {
  margin: 0;
  color: #60736f;
}
.empty {
  padding: 36px;
  text-align: center;
  background: white;
  border: 1px dashed #c5d6d1;
  border-radius: 18px;
  color: #60736f;
}
.use-cases{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;max-width:1120px;margin:0 auto;padding:0 24px 86px}.use-cases article{padding:25px;background:#fff;border:1px solid #dce7e3;border-radius:14px;box-shadow:0 10px 30px #1738310a}.use-cases span{color:#08a47d;font-size:11px;font-weight:900}.use-cases h3{margin:16px 0 8px;font-size:18px}.use-cases p{margin:0;color:#6d7c77;font-size:13px}.site-footer{display:grid;grid-template-columns:1.4fr .6fr .6fr .9fr;gap:40px;padding:48px max(5vw,28px) 30px;background:#082d29;color:#d7e4df}.site-footer img{width:210px;filter:brightness(0) invert(1)}.site-footer p,.site-footer a{color:#92aaa3;font-size:12px}.site-footer nav{display:grid;align-content:start;gap:12px}.site-footer aside{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center}.qr{display:grid;place-items:center;width:74px;height:74px;background:#fff;color:#082d29;border-radius:8px;font-size:11px;line-height:1}.site-footer>small{grid-column:1/-1;padding-top:22px;border-top:1px solid #ffffff1c;color:#78918a}
@media (max-width: 720px) {
  .header nav {
    display: none;
  }
  .hero {
    padding-top: 64px;
  }
  .search-card form {
    flex-direction: column;
  }
  .results > header {
    align-items: flex-start;
    gap: 12px;
    flex-direction: column;
  }
  .result-list article {
    grid-template-columns: 44px 1fr;
  }
  .result-list article > button {
    grid-column: 1/-1;
  }
  .company-mark {
    width: 44px;
    height: 44px;
  }
  .brand{width:155px}.use-cases{grid-template-columns:1fr 1fr}.site-footer{grid-template-columns:1fr}.site-footer>small{grid-column:auto}
}
</style>
<style scoped>
.login,
.select {
  border: 0;
  border-radius: 12px;
  padding: 12px 20px;
  background: #0a9f7b;
  color: #fff;
  font-weight: 700;
  text-align: center;
}
@media (max-width: 720px) {
  .result-list article > .select {
    grid-column: 1/-1;
  }
}
</style>
