export default defineNuxtConfig({
  pages: true,
  compatibilityDate: "2026-08-24",
  telemetry: false,
  experimental: { appManifest: false },
  vite: { server: { hmr: { port: 24679 } } },
  devtools: { enabled: false },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:4000/api/v1"
    }
  },
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || "/",
    head: { title: "商情据官方运营后台" }
  }
});
