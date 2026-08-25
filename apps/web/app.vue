<script setup lang="ts">
useHead({
  htmlAttrs: { lang: "zh-CN" },
  link: [{ rel: "stylesheet", href: "/prototype/styles.css?v=formal-web-69" }],
  meta: [
    { name: "theme-color", content: "#ffffff" },
    { name: "viewport", content: "width=device-width, initial-scale=1" }
  ]
});

onMounted(() => {
  const runtimeWindow = window as unknown as Window & Record<string, unknown>;
  const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  runtimeWindow.SQJ_RUNTIME = {
    app: "web",
    apiBase: isLocal ? "http://localhost:4000/api/v1" : `${window.location.origin}/api/v1`,
    mockBase: isLocal ? "http://127.0.0.1:4190" : `${window.location.origin}/mock`,
    publicApiBase: isLocal ? "http://127.0.0.1:4190" : `${window.location.origin}/mock`,
    source: "formal-development"
  };
  if (!window.location.hash) window.location.hash = "#/home";
  if (!document.querySelector('script[data-sqj-prototype="web"]')) {
    const script = document.createElement("script");
    script.type = "module";
    script.src = "/prototype/app.js?v=formal-web-69";
    script.dataset.sqjPrototype = "web";
    document.body.appendChild(script);
  }
});
</script>

<template>
  <a class="skip-link" href="#main-content">跳到主要内容</a>
  <div id="app" data-formal-app="web" />
  <div id="toast-region" class="toast-region" aria-live="polite" aria-atomic="true" />
</template>
