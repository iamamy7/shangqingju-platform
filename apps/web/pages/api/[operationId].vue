<script setup lang="ts">
const route = useRoute();
const config = useRuntimeConfig();
const operationId = String(route.params.operationId);
const { data: product, error } = await useFetch<Record<string, any>>(
  `${config.public.apiBase}/api-products/${operationId}`,
);
if (error.value)
  throw createError({ statusCode: 404, statusMessage: "未找到 API 接口" });
const curlExample = computed(
  () =>
    `curl -X ${product.value?.method || "POST"} '${config.public.apiBase}${String(product.value?.path || "").replace(/^\/api\/v1/, "")}' \\\n  -H 'X-API-Key: <YOUR_API_KEY>' \\\n  -H 'Content-Type: application/json' \\\n  -d '{"eid":"EID-MOCK-0001"}'`,
);
const activeSection = ref("overview");
let sectionObserver: IntersectionObserver | undefined;
onMounted(() => {
  sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) activeSection.value = visible.target.id;
    },
    { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.2, 0.6] },
  );
  ["overview", "parameters", "example", "billing"].forEach((id) => {
    const element = document.getElementById(id);
    if (element) sectionObserver?.observe(element);
  });
});
onBeforeUnmount(() => sectionObserver?.disconnect());
</script>

<template>
  <div class="detail-page">
  <SqjSiteHeader />
  <main v-if="product" class="detail">
    <header>
      <NuxtLink to="/api-market">← 返回 API 市场</NuxtLink
      ><strong>SQJ 商情据开发文档</strong>
    </header>
    <section class="hero">
      <p>{{ product.apiId }} · {{ product.category }}</p>
      <h1>{{ product.nameZh }}</h1>
      <span>{{ product.description }}</span>
      <div>
        <code>{{ product.method }}</code
        ><code>{{ product.path }}</code
        ><strong>¥{{ product.unitPrice }} / 次</strong>
      </div>
    </section>
    <div class="body">
      <aside>
        <strong>接口文档</strong><a :class="{ active: activeSection === 'overview' }" href="#overview">01 概览</a
        ><a :class="{ active: activeSection === 'parameters' }" href="#parameters">02 请求参数</a><a :class="{ active: activeSection === 'example' }" href="#example">03 调用示例</a
        ><a :class="{ active: activeSection === 'billing' }" href="#billing">04 计费说明</a>
      </aside>
      <article>
        <section id="overview">
          <small>OVERVIEW</small>
          <h2>接口概览</h2>
          <dl>
            <div>
              <dt>OperationId</dt>
              <dd>{{ product.operationId }}</dd>
            </div>
            <div>
              <dt>鉴权方式</dt>
              <dd>X-API-Key</dd>
            </div>
            <div>
              <dt>请求方式</dt>
              <dd>{{ product.method }}</dd>
            </div>
            <div>
              <dt>接口地址</dt>
              <dd>{{ product.path }}</dd>
            </div>
          </dl>
        </section>
        <section id="parameters">
          <small>REQUEST</small>
          <h2>请求参数</h2>
          <div
            class="parameter"
            v-for="field in product.request"
            :key="field[0]"
          >
            <code>{{ field[0] }}</code
            ><span>{{ field[1] }}</span
            ><span>{{ field[2] === "是" ? "必填" : "可选" }}</span
            ><span>{{ field[4] }}</span>
          </div>
        </section>
        <section id="example">
          <small>EXAMPLE</small>
          <h2>调用示例</h2>
          <pre>{{ curlExample }}</pre>
        </section>
        <section id="billing">
          <small>BILLING</small>
          <h2>计费说明</h2>
          <p>
            成功并返回可用数据后扣除人民币余额 ¥{{
              product.unitPrice
            }}。上游或系统异常不扣费，调用记录保留 requestId 以便追踪。
          </p>
        </section>
      </article>
    </div>
  </main>
  <SqjSiteFooter />
  </div>
</template>

<style scoped>
:global(*) {
  box-sizing: border-box;
}
:global(html) {
  scroll-behavior: smooth;
}
:global(body) {
  margin: 0;
  font-family: Inter, "PingFang SC", sans-serif;
  background: #f4f7f6;
  color: #183a33;
}
:global(a) {
  color: inherit;
  text-decoration: none;
}
.detail > header {
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 max(4vw, 22px);
  background: #f8fbfa;
  border-bottom: 1px solid #dbe6e2;
}
.detail {
  min-width: 0;
  overflow-x: hidden;
}
.detail > header a {
  color: #08785f;
}
.hero {
  padding: 54px max(7vw, 28px);
  background: linear-gradient(125deg, #123f37, #176e5e);
  color: #fff;
}
.hero p {
  color: #78e0c3;
  font-weight: 800;
}
.hero h1 {
  font-size: 44px;
  margin: 10px 0;
}
.hero > span {
  font-size: 18px;
  color: #d7ebe5;
}
.hero > div {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 28px;
}
.hero code,
.hero strong {
  padding: 10px 13px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 10px;
}
.hero code {
  max-width: 100%;
  white-space: normal;
  overflow-wrap: anywhere;
}
.body {
  display: grid;
  grid-template-columns: 210px minmax(0, 900px);
  justify-content: center;
  gap: 24px;
  padding: 32px 24px 100px;
}
.body aside {
  position: sticky;
  top: 24px;
  height: max-content;
  display: grid;
  gap: 8px;
  padding: 20px;
  background: #fff;
  border: 1px solid #dae6e2;
  border-radius: 16px;
}
.body aside a {
  padding: 10px;
  border-radius: 8px;
  color: #60736f;
}
.body aside a:hover,
.body aside a.active {
  background: #e6f5f0;
  color: #08785f;
  font-weight:800;
}
.body article {
  display: grid;
  gap: 18px;
  min-width: 0;
}
.body article section {
  scroll-margin-top: 24px;
  padding: 28px;
  background: #fff;
  border: 1px solid #dae6e2;
  border-radius: 16px;
}
.body section > small {
  color: #0a9f7b;
  font-weight: 900;
}
.body h2 {
  font-size: 28px;
}
.body dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.body dl div {
  padding: 16px;
  background: #f3f7f6;
  border-radius: 10px;
}
.body dt {
  color: #667b75;
}
.body dd {
  margin: 7px 0 0;
  font-weight: 700;
  overflow-wrap: anywhere;
}
.parameter {
  display: grid;
  grid-template-columns: 1fr 1fr 80px 80px;
  gap: 10px;
  padding: 13px 0;
  border-bottom: 1px solid #e1e9e6;
}
.parameter > * {
  min-width: 0;
  overflow-wrap: anywhere;
}
.body pre {
  max-width: 100%;
  overflow: auto;
  padding: 22px;
  border-radius: 12px;
  background: #071d1a;
  color: #d6f5eb;
  line-height: 1.65;
}
@media (max-width: 760px) {
  .hero h1 {
    font-size: 34px;
  }
  .hero > div {
    align-items: flex-start;
    flex-direction: column;
  }
  .body {
    grid-template-columns: 1fr;
  }
  .body aside {
    position: static;
    grid-template-columns: 1fr 1fr;
  }
  .body aside strong {
    grid-column: 1/-1;
  }
  .body dl {
    grid-template-columns: 1fr;
  }
  .parameter {
    grid-template-columns: 1fr 1fr;
  }
  .body article section {
    padding: 20px;
  }
}
</style>
