<template>
  <footer class="sqj-footer">
    <div class="footer-main sqj-container">
      <div class="footer-brand">
        <img src="/sqj-lockup-v4.svg" alt="商情据" />
        <p>连接全球企业数据，把每一次商业判断落到可追溯的证据上。</p>
        <span>SOURCES · QUERY · JUDGMENT</span>
      </div>
      <nav><strong>产品</strong><NuxtLink to="/">全球企业查询</NuxtLink><NuxtLink to="/insights">热门资讯</NuxtLink><NuxtLink to="/api-market">数据 API</NuxtLink></nav>
      <nav><strong>账户</strong><NuxtLink to="/account">个人中心</NuxtLink><NuxtLink to="/login">登录 / 注册</NuxtLink><NuxtLink to="/api-market">开发者接入</NuxtLink></nav>
    </div>
    <div class="footer-legal sqj-container"><span>© 2026 商情据 · 合肥易尊数字科技有限公司</span><span>用户协议 · 隐私政策</span></div>
  </footer>
</template>

<style scoped>
.sqj-footer { margin-top: 96px; color: #d9e7e3; background: var(--sqj-ink); }
.footer-main { display: grid; grid-template-columns: 1fr 180px 180px; gap: 70px; padding-top: 56px; padding-bottom: 44px; }
.footer-brand img { width: 205px; height: 52px; object-fit: contain; object-position: left; filter: brightness(0) invert(1); }
.footer-brand p { max-width: 480px; margin: 20px 0 18px; color: #a7bbb5; font-size: 14px; }
.footer-brand span { color: var(--sqj-flight); font: 700 11px var(--sqj-mono); letter-spacing: .14em; }
nav { display: grid; align-content: start; gap: 12px; }
nav strong { margin-bottom: 4px; color: #fff; font-size: 14px; }
nav a { color: #a7bbb5; font-size: 14px; }
nav a:hover { color: var(--sqj-flight); }
.footer-legal { display: flex; justify-content: space-between; padding-top: 22px; padding-bottom: 24px; border-top: 1px solid rgba(255,255,255,.1); color: #829b94; font-size: 12px; }
@media (max-width: 720px) { .sqj-footer { margin-top: 64px; } .footer-main { grid-template-columns: 1fr 1fr; gap: 34px; } .footer-brand { grid-column: 1 / -1; } .footer-legal { flex-direction: column; gap: 8px; } }
</style>
