# Google Search Console 验证标记设计

## 目标

在静态站首页 HTML 的 `<head>` 中加入 Google 提供的唯一验证标记，使 `https://pet-life-tools.netlify.app/` 可通过 Search Console 的 URL-prefix HTML 标签方式验证。

## 方案

- 修改根目录 `index.html`，添加 `<meta name="google-site-verification" content="CHp4N8cueOffoFgbFiZWSE31oYrsizdOyYG0VIsZiRA" />`。
- 新增静态 HTML 回归测试，直接读取 `index.html` 并核对 `name` 和完整 `content`，防止后续构建或维护误删、截断验证码。
- 不修改 React 页面、样式、站点功能、数据结构或依赖。
- 运行新增测试、全量测试、TypeScript 检查和 Vite 生产构建；确认 `dist/index.html` 仍包含完整标记。
- 生成新的 GitHub 源码 ZIP，供用户上传仓库并触发 Netlify 自动部署。

## 成功标准

1. 源码与构建产物首页均包含且只包含一条指定验证标记。
2. 全量测试、类型检查和生产构建通过。
3. 新源码包不包含 `node_modules`、本地用户数据或工作区临时文件。

