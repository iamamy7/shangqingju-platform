<script setup lang="ts">
const phone = ref("13800138888"),
  code = ref("123456"),
  error = ref(""),
  pending = ref(false);
const route = useRoute(),
  config = useRuntimeConfig(),
  { setSession } = useSqjAuth();
async function login() {
  pending.value = true;
  error.value = "";
  try {
    const result = await $fetch<any>(
      `${config.public.apiBase}/auth/login/phone`,
      { method: "POST", body: { phone: phone.value, code: code.value } },
    );
    setSession(result.session.accessToken, result.user);
    await navigateTo(String(route.query.redirect || "/"));
  } catch (e: any) {
    error.value = e?.data?.message || "登录失败";
  } finally {
    pending.value = false;
  }
}
</script>
<template>
  <main class="login-page">
    <section class="promo">
      <NuxtLink to="/" class="brand">SQJ 商情据</NuxtLink>
      <p>GLOBAL BUSINESS INTELLIGENCE</p>
      <h1>让全球企业信息，<br /><em>成为可靠的商业判断</em></h1>
      <span
        >查询企业、选购报告、管理余额与发票；数据 API、CLI 与 MCP
        按需接入。</span
      >
      <div class="cap"><b>企业尽调</b><b>报告交付</b><b>数据 API</b></div>
    </section>
    <section class="card">
      <h2>登录商情据</h2>
      <p>登录后继续订单、报告及账户服务</p>
      <label>手机号<input v-model="phone" /></label
      ><label
        >验证码
        <div>
          <input v-model="code" /><button type="button">获取验证码</button>
        </div></label
      >
      <p v-if="error" class="error">{{ error }}</p>
      <button class="submit" :disabled="pending" @click="login">
        {{ pending ? "登录中…" : "登录 →" }}</button
      ><small>演示账号：13800138888 / 123456，也支持后续接入微信扫码登录</small>
    </section>
  </main>
</template>
<style scoped>
:global(*) {
  box-sizing: border-box;
}
:global(body) {
  margin: 0;
  font-family: Inter, "PingFang SC", sans-serif;
  color: #112f2a;
}
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  align-items: center;
  padding: 7vw;
  background: linear-gradient(120deg, #eef8f5, #f6f4ff 55%, #fff2ee);
}
.promo {
  max-width: 650px;
}
.brand {
  font-size: 25px;
  font-weight: 900;
  color: #102f29;
  text-decoration: none;
}
.promo > p {
  margin-top: 70px;
  color: #ef674b;
  letter-spacing: 0.16em;
  font-size: 13px;
  font-weight: 900;
}
.promo h1 {
  font-size: clamp(38px, 4.5vw, 60px);
  line-height: 1.12;
  margin: 16px 0 22px;
}
.promo em {
  font-style: normal;
  color: #0a9f7b;
}
.promo > span {
  font-size: 18px;
  line-height: 1.8;
  color: #61756f;
}
.cap {
  display: flex;
  gap: 12px;
  margin-top: 34px;
}
.cap b {
  padding: 12px 16px;
  background: #ffffffaa;
  border: 1px solid #d9e6e2;
  border-radius: 12px;
}
.card {
  max-width: 460px;
  width: 100%;
  justify-self: end;
  background: #fff;
  padding: 38px;
  border-radius: 22px;
  box-shadow: 0 24px 70px rgba(25, 53, 48, 0.14);
  border-top: 4px solid #ff7659;
}
.card h2 {
  font-size: 28px;
  margin: 0 0 8px;
}
.card > p {
  color: #687a76;
}
.card label {
  display: block;
  margin-top: 22px;
  font-weight: 750;
}
.card input {
  width: 100%;
  margin-top: 9px;
  border: 1px solid #d7e1de;
  border-radius: 11px;
  padding: 14px;
  font-size: 16px;
}
.card label div {
  display: flex;
  gap: 8px;
}
.card label div button {
  margin-top: 9px;
  white-space: nowrap;
  border: 0;
  border-radius: 11px;
  padding: 0 14px;
  color: #08785f;
}
.submit {
  width: 100%;
  margin-top: 26px;
  padding: 15px;
  border: 0;
  border-radius: 12px;
  background: #0a9f7b;
  color: #fff;
  font-size: 16px;
  font-weight: 800;
}
.card small {
  display: block;
  margin-top: 16px;
  color: #7a8c87;
  line-height: 1.6;
}
.error {
  color: #d64b35 !important;
}
@media (max-width: 850px) {
  .login-page {
    grid-template-columns: 1fr;
    padding: 24px;
  }
  .promo {
    display: none;
  }
  .card {
    justify-self: center;
  }
}
</style>
