# 宠物全生命周期纯工具平台实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个无需服务器、可免费静态部署、支持离线使用的中文宠物全生命周期工具 PWA。

**Architecture:** Vite 构建 React + TypeScript 多页面静态站，每个工具拥有独立 HTML 入口并复用同一组件体系。规则计算、存储、知识检索和海报渲染均在浏览器内完成，业务逻辑以纯函数和版本化数据文件隔离。

**Tech Stack:** React 19、TypeScript 5、Vite 7、Vitest、Testing Library、原生 Canvas、localStorage、Service Worker。

## Global Constraints

- 不需要服务器、账号、云同步、微信消息、在线支付、会员、B 端后台、小程序或远程大模型。
- 不加载广告、追踪脚本、远程字体或需要保密密钥的第三方 API。
- 仅支持猫和狗；医疗内容必须标注规则版本、适用范围和“不能替代执业兽医”。
- 用户数据仅保存在本机，必须提供 JSON 备份和恢复。
- 每个工具有独立 URL、SEO 标题、说明、FAQ 和结构化数据。
- 视觉采用米白、苔绿、陶土色的“温暖编辑感”，医疗风险使用独立高对比警示。
- 所有实现遵循先测试、后最小实现、再重构的顺序。

---

### Task 1: 工程骨架、设计系统与多页面入口

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`
- Create: `index.html`, `schedule/index.html`, `cost/index.html`, `lost-pet/index.html`, `records/index.html`, `guide/index.html`
- Create: `src/main.tsx`, `src/app/App.tsx`, `src/app/pageMeta.ts`, `src/styles/tokens.css`, `src/styles/global.css`
- Test: `src/app/pageMeta.test.ts`

**Interfaces:**
- Produces: `resolvePage(pathname: string): PageKey`，其中 `PageKey = 'home' | 'schedule' | 'cost' | 'lost-pet' | 'records' | 'guide'`。

- [ ] **Step 1: 写失败测试**：断言六个路径分别映射到正确页面，未知路径回退 `home`。
- [ ] **Step 2: 运行 `pnpm test -- src/app/pageMeta.test.ts`**，预期因模块不存在而失败。
- [ ] **Step 3: 创建最小 Vite/React 工程**：配置六个 HTML 输入；实现 `resolvePage` 和 `App` 页面分发；添加无衬线正文、本地系统字体、米白 `#F5F0E6`、苔绿 `#32483D`、陶土 `#B85C3D` 设计变量。
- [ ] **Step 4: 创建共享 Shell**：桌面顶部导航、移动底部导航、纯工具承诺、页脚隐私与医疗声明；每个 HTML 写入独立 title、description、与页面路径一致的相对 canonical 和 FAQ JSON-LD。
- [ ] **Step 5: 运行 `pnpm test` 与 `pnpm build`**，预期测试通过且 `dist` 内存在六个 HTML 页面。
- [ ] **Step 6: 提交 `feat: scaffold static pet toolkit`**。

### Task 2: 版本化疫苗驱虫规则与排期页

**Files:**
- Create: `src/features/schedule/types.ts`, `rules.ts`, `calculateSchedule.ts`, `SchedulePage.tsx`, `ScheduleTimeline.tsx`, `calendar.ts`
- Test: `src/features/schedule/calculateSchedule.test.ts`, `calendar.test.ts`

**Interfaces:**
- Produces: `calculateSchedule(input: ScheduleInput): ScheduleResult`、`createCalendar(events: ScheduleEvent[]): string`。
- `ScheduleResult` 必须包含 `events`、`warnings`、`ruleVersion`、`reviewedAt` 和 `scope`。

- [ ] **Step 1: 写失败测试**：覆盖幼猫/幼犬基础时间线、成年宠物、既往记录去重、未来生日、病期/孕期暂停警告和 `.ics` 日期格式。
- [ ] **Step 2: 运行目标测试**，确认失败原因为函数尚不存在。
- [ ] **Step 3: 实现最小规则模型**：规则只表达“建议窗口”和需兽医确认，不生成诊断；对无法覆盖的历史记录返回明确警告。
- [ ] **Step 4: 实现排期表单和时间线**：宠物类型、生日、既往记录、健康状态；提交前校验；结果显示规则元数据、可编辑日期和下载日历按钮。
- [ ] **Step 5: 运行排期测试和生产构建**，预期全部通过。
- [ ] **Step 6: 提交 `feat: add transparent care schedule`**。

### Task 3: 成本模型与成本计算页

**Files:**
- Create: `src/features/cost/types.ts`, `defaults.ts`, `calculateCost.ts`, `CostPage.tsx`, `CostBreakdown.tsx`
- Test: `src/features/cost/calculateCost.test.ts`

**Interfaces:**
- Produces: `calculateCost(input: CostInput): CostSummary`。
- `CostSummary` 包含 `upfront`、`monthly`、`annual`、`reserve`、`firstYear`、`lifetime` 和分类明细。

- [ ] **Step 1: 写失败测试**：覆盖零值、负数拒绝、一次性/每月/每年折算、寿命年数和自定义金额。
- [ ] **Step 2: 运行测试并确认失败**。
- [ ] **Step 3: 实现纯函数**：公式为 `firstYear = upfront + monthly*12 + annual + reserve`，生命周期按一次性费用只计算一次；所有输入先验证为有限非负数。
- [ ] **Step 4: 实现可编辑模板和结果页**：猫狗默认模板明确标注“示例值”；展示月均、首年、年度常态、生命周期及刚需/可选分组，不输出伪实时“省钱建议”。
- [ ] **Step 5: 运行测试和构建后提交 `feat: add editable pet cost calculator`**。

### Task 4: 本地档案、数据迁移与备份恢复

**Files:**
- Create: `src/features/records/types.ts`, `schema.ts`, `storage.ts`, `backup.ts`, `RecordsPage.tsx`, `PetEditor.tsx`
- Test: `src/features/records/storage.test.ts`, `backup.test.ts`

**Interfaces:**
- Produces: `loadStore(): PetStore`、`saveStore(store: PetStore): SaveResult`、`exportBackup(store: PetStore): string`、`parseBackup(json: string): PetStore`。
- `PetStore` 包含 `schemaVersion: 1`、`pets`、`healthEvents`、`expenses` 和 `reminders`。

- [ ] **Step 1: 写失败测试**：新增/修改/删除宠物，损坏 localStorage 回退，合法备份往返一致，错误版本和缺字段备份被拒绝。
- [ ] **Step 2: 运行测试并确认失败**。
- [ ] **Step 3: 实现存储与备份**：使用单一 namespaced key；解析失败不覆盖原数据；`QuotaExceededError` 返回可展示错误。
- [ ] **Step 4: 实现档案页**：多宠卡片、健康事件、费用、纪念日、二次删除确认、备份下载和恢复前覆盖确认。
- [ ] **Step 5: 把排期保存和成本记录接入档案接口**，页面解释数据仅存本机。
- [ ] **Step 6: 运行所有测试和构建后提交 `feat: add local pet records and backup`**。

### Task 5: 浏览器端寻宠海报

**Files:**
- Create: `src/features/lost-pet/types.ts`, `layoutText.ts`, `renderPoster.ts`, `LostPetPage.tsx`, `PosterPreview.tsx`
- Test: `src/features/lost-pet/layoutText.test.ts`, `renderPoster.test.ts`

**Interfaces:**
- Produces: `wrapText(ctx, text, maxWidth): string[]`、`renderPoster(input, format): Promise<Blob>`；`format` 为 `'social' | 'a4'`。

- [ ] **Step 1: 写失败测试**：中文换行、超长联系方式、空照片、朋友圈 1080×1440 和 A4 2480×3508 输出尺寸。
- [ ] **Step 2: 运行测试并确认失败**。
- [ ] **Step 3: 实现文本布局与 Canvas 渲染**：图片使用 object-fit cover 逻辑；照片失败时保留文字海报；联系方式作为最高对比信息。
- [ ] **Step 4: 实现表单、即时预览、两种版式下载和 Web Share 降级**；明确不提供 AI 抠图和自动修复。
- [ ] **Step 5: 运行测试和构建后提交 `feat: add lost pet poster generator`**。

### Task 6: 本地知识库与红旗症状分流

**Files:**
- Create: `src/features/guide/knowledge.ts`, `searchKnowledge.ts`, `triage.ts`, `GuidePage.tsx`, `RiskBanner.tsx`
- Test: `src/features/guide/searchKnowledge.test.ts`, `triage.test.ts`

**Interfaces:**
- Produces: `searchKnowledge(query: string): KnowledgeEntry[]`、`triage(query: string): TriageResult`。
- `TriageResult.level` 为 `'emergency' | 'vet-soon' | 'general'`，紧急结果不得包含居家治疗步骤。

- [ ] **Step 1: 写失败测试**：关键词和同义词匹配、无结果、呼吸困难/抽搐/持续出血进入 emergency、普通护理进入 general。
- [ ] **Step 2: 运行测试并确认失败**。
- [ ] **Step 3: 实现小型可审阅知识集和确定性检索/分流**；条目包含来源说明字段、更新时间和适用物种。
- [ ] **Step 4: 实现搜索页**：输入症状或主题，先运行红旗分流，再显示知识结果；无结果时建议咨询执业兽医，不伪造回答。
- [ ] **Step 5: 运行测试和构建后提交 `feat: add local pet care guide`**。

### Task 7: 首页提醒聚合、PWA 与静态 SEO 文件

**Files:**
- Create: `src/features/home/HomePage.tsx`, `src/features/home/upcoming.ts`, `public/manifest.webmanifest`, `public/sw.js`, `public/icons/icon.svg`, `public/robots.txt`, `public/sitemap.xml`, `public/privacy.html`, `public/medical-disclaimer.html`
- Modify: `src/main.tsx`, six HTML entry files
- Test: `src/features/home/upcoming.test.ts`

**Interfaces:**
- Produces: `getUpcoming(store: PetStore, now: Date, limit: number): Reminder[]`。

- [ ] **Step 1: 写失败测试**：只返回未来待办、按日期排序、限制数量、不修改原数组。
- [ ] **Step 2: 运行测试并确认失败后实现 `getUpcoming`**。
- [ ] **Step 3: 实现首页**：无档案时显示五工具入口；有档案时优先显示近期提醒和快捷记录。
- [ ] **Step 4: 添加 manifest、SVG 图标和手写 Service Worker**：仅缓存同源静态资源，版本变更时清理旧缓存；不缓存用户导出文件。
- [ ] **Step 5: 补齐每页 Open Graph、canonical 配置说明、FAQ JSON-LD、robots、sitemap、隐私和医疗免责声明。
- [ ] **Step 6: 运行测试和构建后提交 `feat: add offline home and seo assets`**。

### Task 8: 全量验收、无障碍与交付包

**Files:**
- Create: `tests/e2e/core-flows.spec.ts`, `playwright.config.ts`, `README.md`
- Create: `output/output_01_宠物工具平台静态站_20260722.zip`
- Modify: 根据验收结果最小修正相关文件

**Interfaces:**
- Consumes: 六页路由、五个工具、本地存储和导出能力。
- Produces: 可部署的 `dist/` 与用户交付压缩包。

- [ ] **Step 1: 写端到端测试**：覆盖创建档案、生成排期、计算成本、生成海报、备份恢复和红旗症状分流。
- [ ] **Step 2: 运行 `pnpm test`、`pnpm build`、`pnpm exec playwright test`**，记录真实失败，不跳过失败用例。
- [ ] **Step 3: 使用 390×844 和 1440×1000 视口截图**，检查横向溢出、底部导航遮挡、表单标签、键盘焦点、颜色对比和错误提示。
- [ ] **Step 4: 检查构建产物**：六个 HTML、manifest、service worker、robots、sitemap、隐私页和免责声明均存在；首屏自有资源目标约 500 KB。
- [ ] **Step 5: 更新 README**：本地运行、测试、构建、免费静态部署和自定义域名后更新 canonical/sitemap 的方法。
- [ ] **Step 6: 将 `dist` 压缩为交付包，运行最终测试与构建并提交 `chore: verify and package static site`**。

## 实施顺序与检查点

任务 1—3 完成后检查基础视觉和两项核心算法；任务 4—6 完成后检查本地数据闭环、海报与知识分流；任务 7—8 完成后做整站验收和交付。任何检查点发现偏离已批准规格，只做与该规格直接相关的修正。
