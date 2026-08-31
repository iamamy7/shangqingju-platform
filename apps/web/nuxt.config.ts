export default defineNuxtConfig({
  pages: false,
  compatibilityDate: "2026-08-24",
  telemetry: false,
  experimental: { appManifest: false },
  vite: { server: { hmr: { port: 24678 } } },
  devtools: { enabled: false },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:4000/api/v1"
    }
  },
  app: {
    head: {
      title: "商情据｜全球企业情报",
      meta: [{ name: "description", content: "全球与国内企业检索、报告、资讯及数据 API" }]
    }
  }
});
