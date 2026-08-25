<script setup lang="ts">
const route = useRoute(),
  config = useRuntimeConfig(),
  { token, authHeaders } = useSqjAuth();
const task = ref<any>(),
  error = ref("");
async function load() {
  if (!token.value) {
    await navigateTo({ path: "/login", query: { redirect: route.fullPath } });
    return;
  }
  try {
    task.value = await $fetch(
      `${config.public.apiBase}/report-tasks/${route.params.id}`,
      { headers: authHeaders() },
    );
  } catch (e: any) {
    error.value = e?.data?.message || "无法读取报告任务";
  }
}
onMounted(load);
</script>
<template>
  <main>
    <section>
      <NuxtLink to="/">SQJ 商情局</NuxtLink>
      <p>REPORT GENERATION</p>
      <h1>{{ error ? "无法打开报告任务" : "报告已经生成完成" }}</h1>
      <div v-if="task" class="progress">
        <i :style="{ width: task.progress + '%' }"></i>
      </div>
      <strong v-if="task">{{ task.progress }}%</strong>
      <p v-if="error" class="error">{{ error }}</p>
      <ol v-if="task">
        <li v-for="step in task.steps" :key="step">✓ {{ step }}</li>
      </ol>
      <NuxtLink v-if="task" class="open" :to="`/report/${task.reportId}`"
        >查看完整报告 →</NuxtLink
      >
    </section>
  </main>
</template>
<style scoped>
:global(body) {
  margin: 0;
  font-family: Inter, "PingFang SC", sans-serif;
  background: linear-gradient(135deg, #edf8f4, #f5f2ff);
  color: #153630;
}
main {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 22px;
}
section {
  width: min(680px, 100%);
  padding: 48px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 22px 70px #16372f1c;
  text-align: center;
}
section > a:first-child {
  font-weight: 900;
  color: #153630;
  text-decoration: none;
}
section > p {
  color: #0a9f7b;
  font-weight: 800;
  letter-spacing: 0.12em;
  margin-top: 38px;
}
h1 {
  font-size: 34px;
}
.progress {
  height: 13px;
  background: #e9efed;
  border-radius: 20px;
  overflow: hidden;
}
.progress i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #0a9f7b, #715cf6);
}
section > strong {
  display: block;
  font-size: 26px;
  margin: 16px;
}
ol {
  list-style: none;
  padding: 0;
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  color: #5c706a;
}
.open {
  display: inline-block;
  margin-top: 25px;
  padding: 14px 22px;
  background: #0a9f7b;
  color: #fff;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 800;
}
.error {
  color: #d64b35;
}
</style>
