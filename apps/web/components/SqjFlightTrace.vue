<template>
  <div class="flight-trace" aria-label="从数据来源到商业判断的情报航迹">
    <span class="end-node"></span>
    <div><b>S</b><span>全球来源</span><small>Sources</small></div>
    <i></i>
    <div class="active"><b>Q</b><span>主体查询</span><small>Query</small></div>
    <i></i>
    <div><b>J</b><span>证据判断</span><small>Judgment</small></div>
    <span class="end-node"></span>
  </div>
</template>
<style scoped>
.flight-trace { display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; color: var(--sqj-muted); }
.flight-trace > div { min-width: 100px; display: grid; grid-template-columns: 30px 1fr; column-gap: 9px; align-items: center; text-align: left; }
.flight-trace b { grid-row: 1 / 3; width: 30px; height: 30px; display: grid; place-items: center; border: 1px solid var(--sqj-line); color: var(--sqj-ink); background: #fff; font: 800 13px var(--sqj-mono); transform: skewX(-7deg); }
.flight-trace span { color: var(--sqj-ink-soft); font-size: 13px; font-weight: 700; line-height: 1.2; }
.flight-trace small { font: 10px var(--sqj-mono); letter-spacing: .05em; line-height: 1.2; }
.flight-trace i { position: relative; width: min(8vw, 90px); height: 1px; background: var(--sqj-line); overflow: hidden; }
.flight-trace i::after { content: ""; position: absolute; inset: 0; width: 45%; background: var(--sqj-flight); animation: trace 3s ease-in-out infinite; }
.flight-trace .active b { border-color: var(--sqj-flight); color: #fff; background: var(--sqj-flight); box-shadow: 0 0 0 6px rgba(0,183,132,.1); }
.end-node { width: 5px; height: 5px; border-radius: 50%; background: var(--sqj-flight); }
@keyframes trace { from { transform: translateX(-110%); } to { transform: translateX(230%); } }
@media (max-width: 640px) { .flight-trace { gap: 6px; } .flight-trace > div { min-width: 32px; display: block; } .flight-trace > div span, .flight-trace > div small { display: none; } .flight-trace i { width: 34px; } }
</style>
