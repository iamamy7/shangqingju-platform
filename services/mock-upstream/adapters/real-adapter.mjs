export function createRealAdapter({ baseUrl, apiKey }) {
  if (!baseUrl) throw new Error("REAL_UPSTREAM_BASE_URL is required when UPSTREAM_MODE=real");

  return {
    mode: "real",
    async forward({ method, pathname, search, body, headers }) {
      const target = new URL(pathname + search, baseUrl);
      const response = await fetch(target, {
        method,
        headers: {
          "content-type": "application/json",
          "authorization": apiKey ? `Bearer ${apiKey}` : "",
          "x-request-id": headers["x-request-id"] || ""
        },
        body: body == null || method === "GET" ? undefined : JSON.stringify(body)
      });
      const text = await response.text();
      let payload;
      try { payload = JSON.parse(text); } catch { payload = { raw: text }; }

      // 真实上游到位后，只在这里做请求、字段、状态和错误码映射。
      // 对下游仍保持 /open/v1 契约不变。
      return { status: response.status, payload };
    }
  };
}
