<script setup lang="ts">
useHead({
  htmlAttrs: { lang: "zh-CN" },
  meta: [
    { name: "theme-color", content: "#ffffff" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ],
});
</script>

<template>
  <NuxtLoadingIndicator color="#00b784" />
  <NuxtPage />
</template>
