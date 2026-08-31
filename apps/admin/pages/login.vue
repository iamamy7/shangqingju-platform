<script setup lang="ts">
const username = ref("operator");
const password = ref("123456");
const error = ref("");
const pending = ref(false);
const config = useRuntimeConfig();
const { setToken } = useAdminAuth();

async function login() {
  pending.value = true;
  error.value = "";
  try {
    const response = await $fetch<any>(`${config.public.apiBase}/auth/admin/login`, {
      method: "POST",
      body: { username: username.value, password: password.value },
    });
    setToken(response.session.accessToken);
    await navigateTo("/");
  } catch (exception: any) {
    error.value = exception?.data?.message || "登录失败，请检查运营账号与服务状态";
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <main class="login-page">
    <section class="intro">
      <NuxtLink class="brand" to="/login"><img src="/assets/sqj-mark-v4.svg" alt="" /><span><strong>商情据</strong><small>官方运营管理后台</small></span></NuxtLink>
      <div class="intro-copy">
        <p>OFFICIAL OPERATIONS</p>
        <h1>让每一次平台运营，<br /><em>都有依据可追溯</em></h1>
        <span>从数据接入、内容审核到商品交付、客户交易与系统审计，在一个工作台完成闭环。</span>
        <dl>
          <div><dt>01</dt><dd><b>数据可信</b><small>来源、覆盖与质量状态</small></dd></div>
          <div><dt>02</dt><dd><b>内容可控</b><small>采集、审核与前端发布</small></dd></div>
          <div><dt>03</dt><dd><b>交易可查</b><small>余额、订单、发票与审计</small></dd></div>
        </dl>
      </div>
    </section>

    <section class="entry">
      <form class="card" @submit.prevent="login">
        <p>OPERATOR ACCESS</p>
        <h2>登录运营工作台</h2>
        <span>仅供商情据平台运营人员使用</span>
        <label>运营账号<input v-model="username" autocomplete="username" /></label>
        <label>密码<input v-model="password" type="password" autocomplete="current-password" /></label>
        <strong v-if="error" class="error" role="alert">{{ error }}</strong>
        <button type="submit" :disabled="pending">{{ pending ? "正在验证…" : "进入运营工作台 →" }}</button>
        <small>测试环境账号已预填。用户端账号不能登录本后台。</small>
      </form>
    </section>
  </main>
</template>

<style scoped>
:global(*){box-sizing:border-box}:global(body){margin:0;font-family:Inter,"PingFang SC","Microsoft YaHei",sans-serif;color:#102b28;background:#f6faf8}.login-page{min-height:100vh;display:grid;grid-template-columns:minmax(0,1.08fr) minmax(440px,.92fr);background:linear-gradient(120deg,#eef9f5 0%,#f7faf9 52%,#fff8f1 100%)}.intro{padding:42px max(38px,7vw);display:flex;flex-direction:column;border-right:1px solid #dce9e5}.brand{display:flex;align-items:center;gap:12px;color:inherit;text-decoration:none}.brand img{width:62px;height:40px;object-fit:contain}.brand span{display:grid}.brand strong{font-size:22px}.brand small{margin-top:2px;color:#60756f;font-size:12px}.intro-copy{max-width:680px;margin:auto 0}.intro-copy>p,.card>p{margin:0;color:#008f6a;font-size:12px;font-weight:850;letter-spacing:.18em}.intro h1{margin:18px 0 20px;font-family:"Noto Serif SC","Songti SC",serif;font-size:clamp(40px,4.1vw,58px);line-height:1.16;letter-spacing:-.045em}.intro h1 em{color:#008f6a;font-style:normal}.intro-copy>span{display:block;max-width:620px;color:#5d716c;font-size:17px;line-height:1.8}.intro dl{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:36px 0 0}.intro dl div{display:flex;gap:12px;padding:18px 16px;border:1px solid #d9e7e3;border-radius:12px;background:rgba(255,255,255,.66)}.intro dt{color:#ff9e3d;font:800 12px/1 Inter}.intro dd{display:grid;gap:5px;margin:0}.intro dd b{font-size:15px}.intro dd small{color:#70827d;font-size:12px;line-height:1.5}.entry{display:grid;place-items:center;padding:48px}.card{width:min(410px,100%);padding:34px;border:1px solid #d8e4e1;border-top:3px solid #00b784;border-radius:16px;background:#fff;box-shadow:0 24px 65px rgba(16,43,40,.12)}.card h2{margin:10px 0 5px;font-family:"Noto Serif SC","Songti SC",serif;font-size:28px;letter-spacing:-.02em}.card>span{color:#6a7c77;font-size:14px}.card label{display:grid;gap:8px;margin-top:22px;color:#273f3a;font-size:14px;font-weight:750}.card input{width:100%;height:48px;padding:0 13px;border:1px solid #cfddda;border-radius:9px;outline:0;font-size:15px}.card input:focus{border-color:#00a579;box-shadow:0 0 0 3px rgba(0,183,132,.12)}.card button{width:100%;height:50px;margin-top:24px;border:0;border-radius:9px;color:#fff;background:#008f6a;font-weight:800;cursor:pointer}.card button:disabled{opacity:.65}.card>small{display:block;margin-top:16px;color:#778985;font-size:12px;line-height:1.6}.error{display:block;margin-top:14px;color:#d9574f;font-size:13px}@media(max-width:900px){.login-page{grid-template-columns:1fr}.intro{min-height:400px;padding:28px;border-right:0;border-bottom:1px solid #dce9e5}.intro-copy{margin:58px 0 10px}.intro dl{grid-template-columns:1fr}.entry{padding:32px 20px}}@media(max-width:560px){.intro{min-height:auto}.intro h1{font-size:36px}.intro dl{display:none}.entry{padding-top:22px}.card{padding:26px}}
</style>
