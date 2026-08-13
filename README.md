# 一起长大｜宠物全生命周期纯工具站

一个无需服务器的中文宠物工具 PWA。所有计算和档案均在浏览器本地完成，无商城、无广告、无追踪。

## 本地运行

```powershell
pnpm install
pnpm dev
```

测试与构建：

```powershell
node_modules\.bin\vitest.cmd run --configLoader runner
node_modules\.bin\tsc.cmd --noEmit
node_modules\.bin\vite.cmd build --configLoader runner
```

构建结果位于 `dist/`，可直接上传至 GitHub Pages、Cloudflare Pages 或 Vercel 的静态托管。

## 上线前必须修改

1. 当前正式域名为 `https://pet-life-tools.netlify.app`；如以后绑定自定义域名，请同步更新页面 canonical、Open Graph URL、`public/sitemap.xml` 与 `public/robots.txt`。
2. 重新运行生产构建。
3. 检查生成页面的 canonical、Open Graph URL 和 sitemap 地址。

## 数据与医疗边界

- 档案仅保存在当前浏览器；清理网站数据会丢失记录，请定期下载 JSON 备份。
- 网站关闭后不能主动发送微信或系统推送；提醒可导出为日历。
- 疫苗驱虫和知识检索仅用于整理与科普，不能替代执业兽医诊断、处方或急诊处置。
- 静态版本没有账号、云同步、远程 AI、支付或跨设备同步。

## 免费静态部署

- GitHub Pages：上传 `dist/` 内容，或使用 Actions 构建后发布。
- Cloudflare Pages：构建命令使用 `pnpm build`，输出目录填写 `dist`。
- Vercel：框架选择 Vite，输出目录填写 `dist`。

如部署在子路径，需同时调整 Vite `base`、manifest 的 `start_url` 和各页面链接。

## 真实浏览器验收

在 Codex 桌面环境中，使用 bundled Playwright 与系统 Microsoft Edge：

```powershell
pnpm test:e2e
```

该命令会走通档案、排期、成本、海报、备份恢复和红旗分流，并在 `tests/e2e/artifacts/` 生成桌面与手机截图。
