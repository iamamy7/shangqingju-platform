<script setup lang="ts">
const phone = ref("13800138888");
const code = ref("123456");
const error = ref("");
const pending = ref(false);
const mode = ref<"phone" | "wechat">("phone");
const route = useRoute();
const config = useRuntimeConfig();
const { setSession } = useSqjAuth();
async function login() {
  pending.value = true; error.value = "";
  try {
    const result = await $fetch<any>(`${config.public.apiBase}/auth/login/phone`, { method: "POST", body: { phone: phone.value, code: code.value } });
    setSession(result.session.accessToken, result.user);
    await navigateTo(String(route.query.redirect || "/"));
  } catch (e: any) {
    error.value = e?.data?.message || "登录服务暂时不可用，请检查网络后重试。";
  } finally { pending.value = false; }
}
</script>

<template>
  <div class="login-shell">
    <SqjSiteHeader />
    <main class="login-page">
      <section class="promise">
        <p class="sqj-kicker">GLOBAL ENTITY ACCESS</p>
        <h1 class="sqj-display">一个账户，连接全球企业情报</h1>
        <p>继续查询企业、查看已购报告，并统一管理订单、账户余额、发票和开发者服务。</p>
        <SqjFlightTrace class="login-trace" />
        <dl><div><dt>全球企业查询</dt><dd>名称、注册号和地址交叉确认主体</dd></div><div><dt>可追溯报告</dt><dd>股权、司法、财务等模块按需组合</dd></div><div><dt>同源数据 API</dt><dd>按成功调用扣除人民币余额</dd></div></dl>
      </section>

      <section class="login-panel">
        <div class="login-card">
          <header><img src="/sqj-lockup-v4.svg" alt="商情据" /><div><p class="sqj-kicker">ACCOUNT ACCESS</p><h2>登录商情据</h2><span>首次登录将自动创建账户</span></div></header>
          <div class="login-tabs" role="tablist"><button type="button" role="tab" :aria-selected="mode === 'phone'" :class="{ active: mode === 'phone' }" @click="mode = 'phone'">手机号登录</button><button type="button" role="tab" :aria-selected="mode === 'wechat'" :class="{ active: mode === 'wechat' }" @click="mode = 'wechat'">微信扫码</button></div>
          <form v-if="mode === 'phone'" @submit.prevent="login">
            <label><span>手机号</span><div class="phone-field"><b>+86</b><input v-model="phone" inputmode="tel" autocomplete="tel" maxlength="11" /></div></label>
            <label><span>验证码</span><div class="code-field"><input v-model="code" inputmode="numeric" maxlength="6" /><button type="button">获取验证码</button></div></label>
            <p v-if="error" class="error" role="alert">{{ error }}</p>
            <button class="submit" :disabled="pending" type="submit">{{ pending ? "正在登录…" : "登录并继续 →" }}</button>
            <small class="demo">测试账号：13800138888　验证码：123456</small>
          </form>
          <div v-else class="wechat"><div class="qr"><i v-for="n in 64" :key="n" :class="{ on: [1,2,3,4,6,8,9,12,14,16,17,18,20,21,23,25,27,29,31,32,34,35,38,40,41,43,44,46,47,49,50,53,55,56,57,58,60,62,63,64].includes(n) }"></i><b>SQJ</b></div><strong>微信登录暂未开通</strong><p>完成微信开放平台配置后，这里将显示真实登录二维码。</p></div>
          <footer>登录即表示您同意《用户协议》和《隐私政策》</footer>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.login-shell{min-height:100vh;background:linear-gradient(120deg,#eff8f5 0%,#f9fbfa 52%,#fff7ef 100%)}.login-page{min-height:calc(100vh - 76px);display:grid;grid-template-columns:minmax(0,1fr) minmax(390px,.72fr);gap:8vw;align-items:center;width:min(calc(100% - 64px),1220px);margin:auto;padding:68px 0}.promise{max-width:680px}.promise h1{max-width:660px;margin:15px 0 20px;font-size:clamp(42px,5vw,66px)}.promise>p:not(.sqj-kicker){max-width:620px;color:var(--sqj-muted);font-size:17px}.login-trace{max-width:580px;justify-content:flex-start;margin:36px 0}.promise dl{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:0}.promise dl div{padding:16px 0;border-top:1px solid #cbdad6}.promise dt{font-size:14px;font-weight:750}.promise dd{margin:5px 0 0;color:var(--sqj-muted);font-size:12px;line-height:1.55}
.login-panel{display:flex;justify-content:flex-end}.login-card{width:min(100%,430px);padding:28px;border:1px solid var(--sqj-line);border-top:3px solid var(--sqj-flight);border-radius:var(--sqj-radius-lg);background:rgba(255,255,255,.96);box-shadow:var(--sqj-shadow)}.login-card>header{display:flex;gap:16px;align-items:center}.login-card>header img{width:82px;height:48px;object-fit:contain;object-position:left}.login-card>header h2{margin:2px 0 0;font-size:23px}.login-card>header span{color:var(--sqj-muted);font-size:12px}.login-tabs{display:grid;grid-template-columns:1fr 1fr;margin:24px 0 22px;padding:4px;border-radius:10px;background:#eef4f2}.login-tabs button{min-height:38px;border:0;border-radius:7px;color:var(--sqj-muted);background:transparent;font-size:13px;cursor:pointer}.login-tabs button.active{color:var(--sqj-flight-deep);background:#fff;box-shadow:0 4px 12px rgba(16,43,40,.08);font-weight:750}.login-card form{display:grid;gap:18px}.login-card label>span{display:block;margin-bottom:7px;font-size:13px;font-weight:700}.phone-field,.code-field{height:50px;display:flex;border:1px solid var(--sqj-line);border-radius:9px;background:#fff;overflow:hidden}.phone-field b{display:grid;place-items:center;padding:0 12px;border-right:1px solid var(--sqj-line);font-size:13px}.login-card input{min-width:0;flex:1;padding:0 13px;border:0;outline:0}.code-field button{margin:5px;padding:0 11px;border:0;border-radius:6px;color:var(--sqj-flight-deep);background:rgba(0,183,132,.09);font-size:12px;font-weight:700}.submit{min-height:50px;border:0;border-radius:9px;color:#fff;background:var(--sqj-flight);font-weight:750;cursor:pointer}.submit:disabled{opacity:.65}.error{margin:0;padding:10px;border-radius:7px;color:var(--sqj-risk);background:rgba(217,87,79,.08);font-size:13px}.demo{display:block;color:var(--sqj-muted);font-size:11px;text-align:center}.login-card>footer{margin-top:21px;padding-top:15px;border-top:1px solid var(--sqj-line);color:var(--sqj-muted);font-size:10px;text-align:center}
.wechat{text-align:center}.qr{position:relative;width:150px;height:150px;display:grid;grid-template-columns:repeat(8,1fr);gap:3px;margin:0 auto 16px;padding:15px;border:1px solid var(--sqj-line);border-radius:10px;background:#fff}.qr i{background:transparent}.qr i.on{background:var(--sqj-ink)}.qr b{position:absolute;inset:50% auto auto 50%;padding:4px;transform:translate(-50%,-50%);color:#fff;background:var(--sqj-flight);font:800 10px var(--sqj-mono)}.wechat>p{color:var(--sqj-muted);font-size:12px}
@media(max-width:920px){.login-page{grid-template-columns:1fr;padding:50px 0}.promise{text-align:center;margin:auto}.promise h1{font-size:46px}.login-trace{justify-content:center;margin-inline:auto}.promise dl{display:none}.login-panel{justify-content:center}}@media(max-width:520px){.login-page{width:min(calc(100% - 32px),1220px);padding:34px 0}.promise h1{font-size:36px}.promise>p:not(.sqj-kicker){font-size:15px}.login-trace{display:none}.login-card{padding:22px}.login-card>header img{width:70px}}
</style>
