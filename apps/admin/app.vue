<script setup lang="ts">
const runtimeConfig = useRuntimeConfig();
const assetBase = runtimeConfig.app.baseURL.endsWith("/")
  ? runtimeConfig.app.baseURL
  : `${runtimeConfig.app.baseURL}/`;

useHead({
  htmlAttrs: { lang: "zh-CN" },
  link: [{ rel: "stylesheet", href: `${assetBase}prototype/styles.css?v=formal-admin-68` }],
  meta: [
    { name: "theme-color", content: "#f4f8f6" },
    { name: "viewport", content: "width=device-width, initial-scale=1" }
  ]
});

onMounted(() => {
  const runtimeWindow = window as unknown as Window & Record<string, unknown>;
  const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  runtimeWindow.SQJ_RUNTIME = {
    app: "admin",
    apiBase: isLocal ? "http://localhost:4000/api/v1" : `${window.location.origin}/api/v1`,
    mockBase: isLocal ? "http://127.0.0.1:4190" : `${window.location.origin}/mock`,
    publicApiBase: isLocal ? "http://127.0.0.1:4190" : `${window.location.origin}/mock`,
    source: "formal-development"
  };
  const routeName = window.location.hash.replace(/^#\/?/, "").split("?")[0];
  if (!routeName.startsWith("admin")) window.location.hash = "#/admin-login";
  if (!document.querySelector('script[data-sqj-prototype="admin"]')) {
    const script = document.createElement("script");
    script.type = "module";
    script.src = `${assetBase}prototype/app.js?v=formal-admin-68`;
    script.dataset.sqjPrototype = "admin";
    document.body.appendChild(script);
  }
});
</script>

<template>
  <a class="skip-link" href="#main-content">跳到主要内容</a>
  <div id="app" data-formal-app="admin" />
  <div id="toast-region" class="toast-region" aria-live="polite" aria-atomic="true" />
</template>
