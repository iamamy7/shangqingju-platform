<script setup lang="ts">
const route = useRoute();
const item = useInsights().find((row) => row.id === route.params.id);
if (!item) throw createError({ statusCode: 404, statusMessage: "资讯不存在" });
</script>
<template>
  <div class="insight-detail-page">
    <SqjSiteHeader />
  <main>
    <div class="article-nav"><NuxtLink to="/insights">← 返回热门资讯</NuxtLink><span>人工审核发布 · 来源可追溯</span></div>
    <article>
      <div class="meta">
        <span>{{ item?.category }}</span
        ><time>内容库记录 · {{ item?.time }}</time>
      </div>
      <h1>{{ item?.title }}</h1>
      <p class="lead">{{ item?.summary }}</p>
      <div class="source">
        信息来源：{{ item?.source }}　｜　本文为商情据基于公开资料形成的原创分析
      </div>
      <section>
        <h2>为什么这条信息值得关注</h2>
        <p>
          单一新闻只描述事件，商业判断则需要理解事件所处的周期、相关主体及其可能影响。我们将公开市场信息与企业经营、融资、股权和风险数据放在同一分析框架中，观察信号是否相互验证。
        </p>
        <h2>关键变化</h2>
        <p>
          近期数据表明，市场关注点正在从规模扩张转向增长质量和现金流可持续性。投资者、采购方与合作伙伴需要同时关注企业所处行业的景气变化、资产负债结构、客户集中度以及合规风险。
        </p>
        <blockquote>
          判断一家公司，不能只看一个指标；重要的是确认信息来源、时间和主体，并理解它们之间的关系。
        </blockquote>
        <h2>对企业决策的启示</h2>
        <p>
          对于投资与合作决策，应优先核验主体身份和控制关系，再结合经营表现、司法及制裁信息进行交叉判断。公开信息具有时点性，重要事项仍需回到原始公告和官方数据源进行最终核验。
        </p>
      </section>
      <footer>
        <b>公开参考来源</b><span>{{ item?.source }}</span>
        <p>来源链接作为事实参考，不代表来源方对本文观点的背书。</p>
      </footer>
    </article>
  </main>
  <SqjSiteFooter />
  </div>
</template>
<style scoped>
:global(body) {
  margin: 0;
  font-family: Inter, "PingFang SC", sans-serif;
  background: #f5f7f6;
  color: #173730;
}
:global(a) {
  color: inherit;
  text-decoration: none;
}
.article-nav {
  height: 58px;
  padding: 0 6vw;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fbfa;
  border-bottom: 1px solid #dde6e3;
  font-weight: 800;
}
article {
  max-width: 850px;
  margin: 45px auto 90px;
  padding: 0 24px;
}
.meta {
  display: flex;
  gap: 15px;
  color: #72847f;
}
.meta span {
  color: #0a9576;
  font-weight: 850;
}
h1 {
  font-size: 43px;
  line-height: 1.35;
  margin: 20px 0;
}
.lead {
  font-size: 20px;
  line-height: 1.8;
  color: #596f68;
}
.source {
  margin: 25px 0;
  padding: 15px;
  background: #eef6f3;
  border-radius: 9px;
  color: #657b74;
}
section {
  font-size: 17px;
  line-height: 2;
  background: #fff;
  padding: 38px;
  border-radius: 18px;
  border: 1px solid #dee7e4;
}
section h2 {
  font-size: 25px;
  margin-top: 35px;
}
section h2:first-child {
  margin-top: 0;
}
blockquote {
  margin: 30px 0;
  padding: 20px 25px;
  border-left: 4px solid #0a9f7b;
  background: #f0f8f5;
  font-size: 20px;
  font-weight: 650;
}
footer {
  margin-top: 25px;
  padding: 20px;
  border-top: 1px solid #dce5e2;
  color: #657a73;
}
footer span {
  display: block;
  margin-top: 8px;
}
footer p {
  font-size: 13px;
}
@media (max-width: 650px) {
  h1 {
    font-size: 32px;
  }
  section {
    padding: 24px;
  }
}
</style>
