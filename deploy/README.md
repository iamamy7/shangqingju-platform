# 腾讯云部署说明

- 用户端：`http://服务器IP/`
- 官方运营后台：`http://服务器IP/admin/#/admin-login`
- 业务 API：`http://服务器IP/api/v1/health`
- Mock 上游仅经 `http://服务器IP/mock/` 反向代理访问，服务器端口不直接暴露。

生产进程由 systemd 管理，Nginx 统一监听 80 端口。运营后台构建时必须设置
`NUXT_APP_BASE_URL=/admin/`，用户端保持根路径 `/`。
