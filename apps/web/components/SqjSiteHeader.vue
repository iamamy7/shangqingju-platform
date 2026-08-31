<script setup lang="ts">
const route = useRoute();
const { user } = useSqjAuth();
const menuOpen = ref(false);
const nav = [
  { to: "/", label: "首页" },
  { to: "/insights", label: "热门资讯" },
  { to: "/api-market", label: "数据 API" },
];
function active(to: string) {
  return to === "/" ? route.path === "/" : route.path.startsWith(to);
}
</script>

<template>
  <header class="sqj-site-header">
    <div class="header-inner">
      <NuxtLink class="brand" to="/" aria-label="商情据首页">
        <img src="/assets/sqj-mark-v4.svg" alt="" />
        <span><strong>商情据</strong><small>全球企业情报 · 一查即明</small></span>
      </NuxtLink>
      <nav :class="{ open: menuOpen }" aria-label="主导航">
        <NuxtLink v-for="item in nav" :key="item.to" :to="item.to" :class="{ active: active(item.to) }" @click="menuOpen = false">
          {{ item.label }}
        </NuxtLink>
      </nav>
      <div class="actions">
        <span class="language"><b>中</b><span>EN</span></span>
        <NuxtLink class="account" :to="user ? '/account' : '/login'">
          <span class="account-dot">{{ user ? "✓" : "○" }}</span>{{ user ? user.displayName : "登录" }}
        </NuxtLink>
        <button class="menu" type="button" :aria-expanded="menuOpen" aria-label="打开导航" @click="menuOpen = !menuOpen">
          <i></i><i></i><i></i>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.sqj-site-header { position: sticky; top: 0; z-index: 50; height: 76px; background: rgba(255,255,255,.92); border-bottom: 1px solid rgba(216,228,224,.9); backdrop-filter: blur(18px); }
.header-inner { width: min(calc(100% - 48px), var(--sqj-container)); height: 100%; margin: auto; display: grid; grid-template-columns: 235px 1fr 235px; align-items: center; }
.brand { height: 54px; display: flex; align-items: center; gap: 11px; overflow: hidden; }
.brand img { width: 96px; height: 42px; object-fit: contain; object-position: left center; }
.brand > span { display: grid; line-height: 1.2; }
.brand strong { color: var(--sqj-ink); font-family: var(--sqj-display); font-size: 20px; letter-spacing: .06em; }
.brand small { margin-top: 3px; color: var(--sqj-muted); font-size: 10px; white-space: nowrap; }
nav { display: flex; justify-content: center; align-self: stretch; gap: 42px; }
nav a { position: relative; display: flex; align-items: center; color: var(--sqj-ink-soft); font-size: 15px; font-weight: 650; }
nav a::after { content: ""; position: absolute; left: 50%; bottom: -1px; width: 0; height: 3px; background: var(--sqj-flight); transform: translateX(-50%); transition: width .2s ease; }
nav a:hover, nav a.active { color: var(--sqj-ink); }
nav a.active::after { width: 26px; }
.actions { display: flex; justify-content: flex-end; align-items: center; gap: 10px; }
.language { height: 38px; display: flex; align-items: center; gap: 8px; padding: 3px 10px 3px 3px; border: 1px solid var(--sqj-line); border-radius: 99px; color: var(--sqj-muted); font: 700 11px var(--sqj-body); }
.language b { width: 31px; height: 31px; display: grid; place-items: center; border-radius: 50%; color: var(--sqj-ink); background: var(--sqj-flight); }
.account { min-height: 40px; display: flex; align-items: center; gap: 7px; padding: 0 14px; color: #fff; background: var(--sqj-ink); border-radius: 99px; font-size: 14px; font-weight: 700; }
.account-dot { font-size: 13px; }
.menu { display: none; width: 40px; height: 40px; border: 0; border-radius: 50%; background: var(--sqj-mist); }
.menu i { display: block; width: 17px; height: 2px; margin: 3px auto; background: var(--sqj-ink); }
@media (max-width: 860px) {
  .header-inner { grid-template-columns: 1fr auto; width: min(calc(100% - 32px), var(--sqj-container)); }
  .brand img { width: 82px; }
  .brand strong { font-size: 18px; }
  .brand small { display: none; }
  nav { position: absolute; top: 76px; left: 16px; right: 16px; display: none; align-self: auto; flex-direction: column; gap: 0; padding: 10px; border: 1px solid var(--sqj-line); border-radius: var(--sqj-radius); background: #fff; box-shadow: var(--sqj-shadow); }
  nav.open { display: flex; }
  nav a { min-height: 46px; padding: 0 14px; border-radius: 8px; }
  nav a.active { background: rgba(0,183,132,.1); }
  nav a::after { display: none; }
  .language { display: none; }
  .menu { display: block; }
}
@media (max-width: 470px) { .brand img { width: 72px; } .brand strong { font-size: 17px; } .account { padding: 0 11px; } }
</style>
