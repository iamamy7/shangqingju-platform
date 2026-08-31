<script setup lang="ts">
useHead({
  htmlAttrs: { lang: "zh-CN" },
  meta: [
    { name: "theme-color", content: "#f4f8f6" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ],
});
</script>

<template>
  <NuxtLoadingIndicator color="#00b784" />
  <NuxtPage />
</template>

<style>
html { min-width: 320px; background: #f4f8f6; }
body { margin: 0; }
button, input, textarea, select { font: inherit; }
</style>
