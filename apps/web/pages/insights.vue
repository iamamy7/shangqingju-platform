<script setup lang="ts">
const items = useInsights();
const category = ref("全部");
const categories = ["全部", "大宗数据", "投资日报", "金融市场", "上市企业", "其他"];
const filtered = computed(() => category.value === "全部" ? items : items.filter((item) => item.category === category.value));
const lead = computed(() => filtered.value[0]);
const rest = computed(() => filtered.value.slice(1));
</script>

<template>
  <div class="insights-page">
    <SqjSiteHeader />
    <main>
      <section class="insights-hero">
        <div class="sqj-container hero-grid">
          <div><p class="sqj-kicker">VERIFIED MARKET SIGNALS</p><h1 class="sqj-display">值得继续追踪的全球商业信号</h1><p>公开来源用于发现线索，核心事实回到公告与监管资料核验。文章经过人工审核后发布，不把采集时间冒充新闻发生时间。</p></div>
          <aside><span>今日流程</span><dl><div><dt>07:30</dt><dd>自动采集</dd></div><div><dt>人工</dt><dd>逐篇审核</dd></div><div><dt>发布</dt><dd>前端可见</dd></div></dl><small>每篇文章保留来源与发布时间</small></aside>
        </div>
      </section>

      <div class="sqj-container intelligence-layout">
        <aside class="channels sqj-panel"><header><b>资讯频道</b><small>MARKET CHANNELS</small></header><button v-for="item in categories" :key="item" type="button" :class="{ active: item === category }" @click="category = item"><span>{{ item }}</span><b>{{ item === '全部' ? items.length : items.filter(article => article.category === item).length }}</b></button><div class="principle"><strong>只发布已审核内容</strong><p>线索来源帮助发现事件；关键事实优先引用企业公告、交易所和监管机构资料。</p></div></aside>

        <section class="feed">
          <header class="feed-head"><div><p class="sqj-kicker">{{ category === '全部' ? 'TODAY' : 'CHANNEL' }}</p><h2>{{ category === '全部' ? '今日重点' : category }}</h2></div><span>共 {{ filtered.length }} 篇</span></header>
          <article v-if="lead" class="lead-story sqj-panel">
            <div class="lead-visual"><span>{{ lead.category }}</span><b>SQJ</b><small>SIGNAL / {{ lead.id }}</small></div>
            <div class="lead-copy"><div class="meta"><span>{{ lead.tag }}</span><time>今日 {{ lead.time }} 发布</time></div><NuxtLink :to="`/insight/${lead.id}`"><h2>{{ lead.title }}</h2></NuxtLink><p>{{ lead.summary }}</p><footer><span>来源：{{ lead.source }}</span><NuxtLink :to="`/insight/${lead.id}`">阅读全文 →</NuxtLink></footer></div>
          </article>
          <div class="story-list">
            <article v-for="item in rest" :key="item.id" class="sqj-panel"><div class="story-mark"><span>{{ item.category }}</span><b>{{ item.id.slice(0, 2) }}</b></div><div><div class="meta"><span>{{ item.tag }}</span><time>今日 {{ item.time }} 发布</time></div><NuxtLink :to="`/insight/${item.id}`"><h3>{{ item.title }}</h3></NuxtLink><p>{{ item.summary }}</p><footer><span>{{ item.source }}</span><NuxtLink :to="`/insight/${item.id}`">查看分析 →</NuxtLink></footer></div></article>
          </div>
          <div v-if="!filtered.length" class="empty sqj-panel"><strong>该频道暂无已审核文章</strong><p>新内容通过人工审核后会在这里发布。</p></div>
        </section>
      </div>
    </main>
    <SqjSiteFooter />
  </div>
</template>

<style scoped>
.insights-hero{padding:70px 0 52px;background:linear-gradient(118deg,#f1f8f6 0%,#fff 56%,#fff7ec 100%);border-bottom:1px solid var(--sqj-line)}.hero-grid{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:60px;align-items:end}.hero-grid h1{max-width:780px;margin:14px 0 18px;font-size:clamp(38px,4vw,52px)}.hero-grid>div>p:last-child{max-width:700px;margin:0;color:var(--sqj-muted);font-size:17px}.hero-grid>aside{padding:22px;border-left:3px solid var(--sqj-flight);background:rgba(255,255,255,.72)}.hero-grid aside>span{color:var(--sqj-flight-deep);font-size:13px;font-weight:800}.hero-grid dl{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:18px 0}.hero-grid dl div{display:grid}.hero-grid dt{font:800 18px var(--sqj-mono)}.hero-grid dd{margin:0;color:var(--sqj-muted);font-size:12px}.hero-grid aside small{color:var(--sqj-muted)}
.intelligence-layout{display:grid;grid-template-columns:230px minmax(0,1fr);gap:28px;padding-top:36px;align-items:start}.channels{position:sticky;top:96px;padding:16px;box-shadow:none}.channels header{display:grid;padding:7px 9px 16px;border-bottom:1px solid var(--sqj-line)}.channels header b{font-size:18px}.channels header small{color:var(--sqj-muted);font:10px var(--sqj-mono);letter-spacing:.12em}.channels button{width:100%;min-height:46px;display:flex;justify-content:space-between;align-items:center;margin-top:5px;padding:0 12px;border:0;border-radius:8px;color:var(--sqj-muted);background:transparent;text-align:left;cursor:pointer}.channels button b{min-width:26px;padding:2px 7px;border-radius:99px;background:var(--sqj-mist);font-size:11px;text-align:center}.channels button.active{color:var(--sqj-flight-deep);background:rgba(0,183,132,.1);font-weight:750}.channels button.active b{color:#fff;background:var(--sqj-flight)}.principle{margin-top:18px;padding:16px;border-radius:10px;color:#d8e6e2;background:var(--sqj-ink)}.principle strong{color:#fff;font-size:14px}.principle p{margin:8px 0 0;font-size:12px;line-height:1.65;color:#a9bdb7}
.feed-head{display:flex;align-items:end;justify-content:space-between;margin-bottom:16px}.feed-head h2{margin:4px 0 0;font-size:30px}.feed-head>span{color:var(--sqj-muted);font-size:13px}.lead-story{display:grid;grid-template-columns:310px minmax(0,1fr);overflow:hidden;box-shadow:none}.lead-visual{position:relative;min-height:330px;display:flex;flex-direction:column;justify-content:space-between;padding:25px;color:#fff;background:radial-gradient(circle at 70% 75%,rgba(0,183,132,.55),transparent 35%),var(--sqj-ink);overflow:hidden}.lead-visual:after{content:"";position:absolute;width:270px;height:270px;right:-90px;bottom:-110px;border:1px solid rgba(255,255,255,.16);border-radius:50%;box-shadow:0 0 0 40px rgba(255,255,255,.035),0 0 0 80px rgba(255,255,255,.025)}.lead-visual span{position:relative;z-index:1;width:max-content;padding:5px 9px;border:1px solid rgba(255,255,255,.25);border-radius:6px;font-size:12px}.lead-visual b{position:relative;z-index:1;color:var(--sqj-flight);font:900 64px var(--sqj-display);letter-spacing:-.08em}.lead-visual small{position:relative;z-index:1;color:#9fb8b1;font:10px var(--sqj-mono)}.lead-copy{display:flex;flex-direction:column;padding:30px}.meta{display:flex;align-items:center;gap:12px;color:var(--sqj-muted);font-size:12px}.meta span{color:var(--sqj-flight-deep);font-weight:750}.lead-copy h2{margin:17px 0 12px;font-size:clamp(27px,3vw,38px);line-height:1.32}.lead-copy>p,.story-list p{color:var(--sqj-muted)}.lead-copy footer,.story-list footer{display:flex;justify-content:space-between;gap:20px;margin-top:auto;padding-top:18px;border-top:1px solid var(--sqj-line);color:var(--sqj-muted);font-size:12px}.lead-copy footer a,.story-list footer a{color:var(--sqj-flight-deep);font-weight:750}
.story-list{display:grid;gap:12px;margin-top:12px}.story-list article{display:grid;grid-template-columns:92px 1fr;gap:21px;padding:22px;box-shadow:none}.story-mark{display:flex;flex-direction:column;justify-content:space-between;padding-right:18px;border-right:1px solid var(--sqj-line)}.story-mark span{color:var(--sqj-flight-deep);font-size:12px;font-weight:700}.story-mark b{color:#bdd0cb;font:900 31px var(--sqj-mono)}.story-list h3{margin:9px 0 6px;font-size:21px;line-height:1.45}.story-list p{margin:0 0 14px;font-size:14px}.empty{padding:50px;text-align:center}.empty p{color:var(--sqj-muted)}
@media(max-width:900px){.hero-grid{grid-template-columns:1fr;gap:35px}.intelligence-layout{grid-template-columns:1fr}.channels{position:static;display:flex;flex-wrap:wrap;align-items:center}.channels header,.principle{width:100%}.channels button{width:auto}.lead-story{grid-template-columns:1fr}.lead-visual{min-height:220px}}@media(max-width:620px){.insights-hero{padding:52px 0 38px}.hero-grid h1{font-size:40px}.intelligence-layout{padding-top:22px}.channels{overflow-x:auto;flex-wrap:nowrap}.channels header,.principle{display:none}.channels button{flex:none}.story-list article{grid-template-columns:1fr}.story-mark{min-height:42px;flex-direction:row;border-right:0;border-bottom:1px solid var(--sqj-line);padding:0 0 10px}.lead-copy{padding:22px}.lead-copy footer,.story-list footer{align-items:flex-start;flex-direction:column}.hero-grid>aside{display:none}}
</style>
