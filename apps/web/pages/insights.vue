<script setup lang="ts">
const items = useInsights(),
  category = ref("全部");
const categories = [
  "全部",
  "大宗数据",
  "投资日报",
  "金融市场",
  "上市企业",
  "其他",
];
const filtered = computed(() =>
  category.value === "全部"
    ? items
    : items.filter((item) => item.category === category.value),
);
</script>
<template>
  <main>
    <header>
      <NuxtLink to="/">SQJ 商情据</NuxtLink>
      <nav>
        <NuxtLink to="/">首页</NuxtLink><b>热门资讯</b
        ><NuxtLink to="/api-market">数据 API</NuxtLink>
      </nav>
      <NuxtLink to="/login">登录</NuxtLink>
    </header>
    <section class="hero">
      <p>MARKET INTELLIGENCE</p>
      <h1>今日商业情报</h1>
      <span
        >由 Agent 聚合公开信息，经过人工审核，并形成商情据原创深度解读。</span
      >
    </section>
    <div class="layout">
      <aside>
        <h3>资讯分类</h3>
        <button
          v-for="item in categories"
          :key="item"
          :class="{ active: item === category }"
          @click="category = item"
        >
          {{ item }}
        </button>
        <div>
          <b>内容原则</b>
          <p>资讯免费阅读；每篇均保留公开信息来源，不直接跳转代替原创分析。</p>
        </div>
      </aside>
      <section class="feed">
        <article v-for="item in filtered" :key="item.id">
          <div class="meta">
            <span>{{ item.category }}</span
            ><time>{{ item.time }}</time>
          </div>
          <NuxtLink :to="`/insight/${item.id}`"
            ><h2>{{ item.title }}</h2></NuxtLink
          >
          <p>{{ item.summary }}</p>
          <footer>
            <span>{{ item.source }}</span
            ><b>{{ item.tag }}</b
            ><NuxtLink :to="`/insight/${item.id}`">阅读全文 →</NuxtLink>
          </footer>
        </article>
      </section>
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
  background: #f6f7f5;
  color: #173730;
}
:global(a) {
  color: inherit;
  text-decoration: none;
}
header {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6vw;
  background: #fff;
  border-bottom: 1px solid #dee6e3;
  font-weight: 800;
}
header nav {
  display: flex;
  gap: 34px;
}
.hero {
  padding: 62px 24px 42px;
  text-align: center;
  background: linear-gradient(120deg, #eff9f5, #f4f3ff);
}
.hero p {
  color: #eb694d;
  font-size: 13px;
  letter-spacing: 0.18em;
  font-weight: 900;
}
.hero h1 {
  font-size: 43px;
  margin: 10px;
}
.hero span {
  color: #687a75;
  font-size: 17px;
}
.layout {
  max-width: 1180px;
  margin: 28px auto 80px;
  padding: 0 22px;
  display: grid;
  grid-template-columns: 230px 1fr;
  gap: 20px;
  align-items: start;
}
aside {
  position: sticky;
  top: 20px;
  background: #fff;
  border: 1px solid #dce6e3;
  border-radius: 15px;
  padding: 18px;
}
aside h3 {
  padding: 0 10px;
}
aside button {
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  padding: 13px;
  border-radius: 9px;
  font-size: 16px;
  color: #5b716b;
}
aside button.active {
  background: #e2f5ee;
  color: #08755e;
  font-weight: 850;
}
aside div {
  margin-top: 22px;
  padding: 15px;
  background: #f7f8f7;
  border-radius: 10px;
}
aside div p {
  font-size: 13px;
  line-height: 1.7;
  color: #71817d;
}
.feed {
  display: grid;
  gap: 12px;
}
.feed article {
  padding: 25px 28px;
  background: #fff;
  border: 1px solid #dce6e3;
  border-radius: 15px;
}
.meta,
footer {
  display: flex;
  align-items: center;
  gap: 14px;
}
.meta span {
  color: #0a9475;
  font-weight: 850;
}
.meta time {
  color: #84928e;
}
.feed h2 {
  font-size: 23px;
  line-height: 1.45;
  margin: 14px 0 10px;
}
.feed article > p {
  color: #657873;
  line-height: 1.7;
}
.feed footer {
  border-top: 1px solid #edf1ef;
  padding-top: 15px;
  color: #768783;
  font-size: 13px;
}
.feed footer b {
  padding: 4px 8px;
  background: #fff1ec;
  color: #d85a40;
  border-radius: 6px;
}
.feed footer a {
  margin-left: auto;
  color: #08755e;
  font-weight: 800;
}
@media (max-width: 750px) {
  header nav {
    display: none;
  }
  .layout {
    grid-template-columns: 1fr;
  }
  aside {
    position: static;
  }
  .hero h1 {
    font-size: 34px;
  }
}
</style>
