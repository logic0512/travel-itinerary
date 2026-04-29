---
name: travel-itinerary
description: 4-stage workflow for generating interactive HTML travel guides for any destination. Handles intake Q&A, offline decision questionnaires (Q1/Q2), and final rendering to a self-contained trip.html. Features CN/international link strategies, 4D region filter, daily meal pools, weather-aware planning, Edit Mode, and solo-traveler safety layer. Use when the user says "帮我做旅行攻略" / "I want to plan a trip to X".
origin: logic0512
version: 2.4.1
---

# 旅游攻略 Skill · travel-itinerary

## 一、触发条件

用户说「我要去 X 旅游」/「帮我做 X 旅行攻略」 + 提供目的地 + 日期 + 人数。

## 二、流程总览（4 阶段）

```
Stage 0 · Intake
├ 对话收集（目的地/日期/人数/住宿/初步想法/航班）
└ 批量 web_search（片区 + 12 维度提醒 + 跨城交通 + 候选实体验证 + 歧义澄清）
                ↓
Stage 1 · Q1 决策问卷（HTML · 离线填）+ Stage 1.5 矛盾消化（对话）
                ↓
★ Phase 1 终点：分析报告（路线/住宿区/机票时段/预算/风险锁定清单）
                ↓
        [用户去订机票 + 酒店 + 入境单]
                ↓
Stage 2 · Q2 安排问卷（HTML · 离线填）
                ↓
Stage 3 · 最终渲染
├ 调用 frontend-design 生成 theme.css（皮肤层）
├ 合并 trip.json
└ 渲染 trip.html（单文件 · 内联数据 · 双击即用）
                ↓
★ Phase 2 终点：trip.html（出行中用） + todo-before-trip.md（出行前用）
```

## 三、资产

```
travel-itinerary/
├── SKILL.md（本文件）
├── assets/
│   ├── questionnaire-q1.template.html  · v2.3（1113 行）
│   ├── questionnaire-q2.template.html  · v2.3（1372 行）
│   ├── trip.template.html              · v2.3（976 行 · 含 Edit Mode + 天气层）
│   └── theme.template.css              · v2.2 中性骨架（具体目的地由 frontend-design 覆盖）
└── references/
    └── v2.4-checklist.md  · ⭐ v2.4 作业清单（cards schema + 字体规则 + 交付节奏）
```

**新 case 启动顺序**：先读 [references/v2.4-checklist.md](references/v2.4-checklist.md) 再动手。

使用时，直接将 `assets/` 下对应模板复制到用户的旅行项目目录，按 `{{占位符}}` 填充。

## 四、v2.3 核心功能

### 三大主线
1. **链接策略重写** — 国内：高德 POI 优先 → 官网 → 携程 → 黑珍珠等评级页，大众点评/美团降为最末 fallback（标"需登录"）
2. **过滤升四维** — 时间轴下拉从 `(type, intent)` 升为 `(type, intent, region)`，跨片区可切换
3. **餐饮密度强制** — 新增 `daily_meal_pool` 按片区组织便餐；Phase 1 前密度检查：medium ≤20% 占位

### 新增功能
- **Edit Mode** — trip.html 行程内联编辑 + 批注 + 导出改动摘要（LocalStorage 持久化）
- **天气感知** — 出发前 7 天检测；Q1 雨天态度偏好；Q2 室外景点提示；trip.html 天气栏 + 室外标签 + 室内备选
- **solo_traveler 模式** — 人数=1 时自动展开独行偏好问卷 + trip.html 夜间安全提醒
- **预算实时追踪** — trip.html 速查卡第 5 张，LocalStorage 记录每日支出，余额变红提醒
- **Day 级提醒** — medium+ 行程在 day-nav 橙点标记重要提醒
- **entity_type 四态** — storefront / brand / aggregate / changed_or_gone
- **一键导出 3 份** — Q2 导出 arrangement.md + trip.json + todo.md

## 五、Archetype 档位

| 档位 | 场景 | 说明 |
|---|---|---|
| `short` | 1–3 天 · 单城 | §0 LOCKS 默认折叠；备选截断 |
| `medium-single` | 4–6 天 · 单城 | 标准流程 |
| `medium-multi` | 4–7 天 · 跨城 | 片区过滤 + 跨城交通锁定 |
| `long` | 7 天以上 | 完整流程；todo 5 阶段 |

## 六、Schema 关键字段（v2.3 新增）

| 字段 | 用途 |
|---|---|
| `meta.weather_tolerance` | 雨天态度（high/medium/low/flex） |
| `cards[].outdoor` | 是否室外景点（bool） |
| `cards[].indoor_alt` | 雨天室内替换（card_id 或字符串） |
| `days[].weather.*` | 天气数据（condition/temp_high/temp_low/rain_probability/advice） |
| `cards[].region` | 片区 slug（四维过滤必填） |
| `daily_meal_pool` | 日常便餐池（按片区 slug 组织） |

完整 Schema 见 `assets/questionnaire-q2.template.html` 中的 DAYS 数据注释。

## 七、测试历程

| 版本 | case | 结果 |
|---|---|---|
| v1 | 京都 | 已废（暴露根本问题） |
| v2.1 | 泰国 5/1-5/8 | 跑通（14 条补丁） |
| v2.1 | 柳州 5/2-5/4 | 跑通（24 条 → v2.2 修订源头） |
| v2.2 | 上海 5/1-5/5 | ✅ 跑通（36 条 → v2.3 修订源头） |
| v2.3 | 罗马（进行中） | 第四轮验证 · 国际化场景 |
| **v2.4** | **京都 4/30-5/4 4 人** | **✅ 跑通·暴露 14 条 → v2.4 修订源头** |

## 八、v2.4 改进清单（京都 case 复盘）

> 京都 case 跑通后发现的系统性问题·14 条均已纳入硬规则。

### 8.1 内容质量（P0）

- **C-1 cards 字段 schema 完整规范** — 写数据前必读 trip.template.html 的 renderCard / renderTimelineItem / renderDay·列出全部字段。Q1 候选实体阶段就开始填 `intro_paragraphs / coords / hours / 定休日`·不要拖到 Stage 3。
- **C-2 cards 必填字段（按类别）**：
  - 餐厅：`name / emoji / city_label / type=meal_* / intent / region / entity_type / outdoor / hours / price / address / phone / 定休日 / signature_dishes[] / links{official,tabelog,booking,ig} / coords / intro_paragraphs[2-4 段]`
  - 景点：`name / emoji / city_label / type=sight / intent / region / entity_type / outdoor / indoor_alt / hours / price / duration / address / links{official,guide} / coords / intro_paragraphs[2-4 段]`
  - 转场：`name / emoji / city_label / type=transit / intent / region / outdoor=false / key_info{depart,arrive,duration,price} / intro_paragraphs[1-2 段]`
- **C-3 介绍语气 align** — 进 Stage 3 前用 1 张样板卡确认风格（实用 / 文化 / 避坑 / 小知识 占比）·再批量。
- **C-4 预算追踪改配置开关** — 模板 default **关闭**·`meta.budget.enabled === true` 才渲染。Stage 0 询问用户是否需要。

### 8.2 字体 / 样式（P1）

- **S-1 字体堆栈硬规则** — 中日内容主体用 `"Noto Serif SC", "Noto Serif JP", "Songti SC", serif`。**不要用纯日文字体（如 Shippori Mincho）作主体**·简体字 glyph 缺失会 fallback 到楷书导致粗细混搭。
- **S-2 timeline 默认上下两层** — 时间标签独占一行（左侧朱红边）+ 卡片全宽。不要 `grid 50px 1fr` 左右两列（手机端时间列占 30% 宽）。
- **S-3 day-nav 默认 grid 等分** — `grid-template-columns: repeat(N, 1fr)`·不用横向滚动。
- **S-4 链接按钮默认 outline 风** — 描边 + 透明背景·避免实心朱红+灰色对比。

### 8.3 工程流程（P2）

- **W-1 交付节奏黄金规则** ⭐：
  - 1-5 张：可一次做
  - 6-15 张：先 1 张样板 → 用户验收 → 1 天 1 天交付
  - 16+ 张：T1 骨架 → T2 核心数据 → T3 cards 1 天 1 天
  - 用户主动建议"按 1 天 / 3 天拆"是金标准·不要赶。
- **W-2 写数据前必读消费它的渲染函数** — 这是工程铁律。
- **W-3 内联 trip-data 优先·fetch 兜底** — 双击即用（避免 file:// CORS）。inline `<script id="trip-data" type="application/json">` 放在主 script **之前**。
- **W-4 inline JSON 注入用 str.replace** — 不要用 regex（lazy 匹配会从注释里的字符串开始扫·替换吞掉主 script）。必须用 regex 时·replacement 用 `lambda m: ...` 避免反向引用问题。

### 8.4 事实核查（P3）

- **F-1 餐厅 4 必填核查**：① 定休日 ② 营业时间 ③ 是否接受预约 ④ 末班 LO·全部 web search 双重验证。
- **F-2 用户特定地名必查** — 用户说"X 站去 Y 寺"等具体动线时·全部 web search 验证·不要靠常识猜。

### 8.5 链接策略（v2.4.1 升级）

- **L-1 禁止使用需登录的链接** — 大众点评/美团/小红书/微博等**强制登录才能看完整内容**的链接全部禁用·不写进 cards.links。可用替代：
  - 国内：高德 POI / 官网 / 携程 / 黑珍珠（不强制登录的页面）
  - 国际：Google Maps / 官网 / Tabelog / TripAdvisor / IG / YouTube
- **L-2 链接验证规则** — 写入 cards.links 前·**手机浏览器无痕模式打开测试**·能看到内容才放·跳登录页就换。
- **L-3 兜底永远是 Maps 搜索** — 任何 card 至少有一个不会失效的 Google Maps / 高德 search URL（用 cardName 作 query）。

### 8.6 Stage 3 最终对账（v2.4.1 新增）⭐

**进入 Stage 3 最终交付前·必须执行：**

1. **重读 SKILL.md 第四章「v2.3 核心功能」+ 第八章 v2.4 改进清单**·列出全部承诺功能。
2. **打开 trip-final.html 在浏览器实测**：
   - [ ] 4 个 modal（紧急/须知/准备/票据）有内容·不空白
   - [ ] 5 天 timeline 全部渲染·关键节点红色高亮
   - [ ] 所有卡片有 intro_paragraphs·点「展开介绍」能看到
   - [ ] 地图迷你图能渲染（说明 coords 没漏）
   - [ ] day-nav 等分显示·不滚动
   - [ ] 字体粗细统一·没有楷书 fallback
   - [ ] 链接按钮 outline 风·点开不跳登录页
   - [ ] Edit Mode 顶部铅笔能切换
   - [ ] 双击 file:// 能直接打开（不依赖 HTTP server）
3. **逐项对账缺失** → 写补丁脚本修复 → 复测 → 通过才交付。
4. **不要急着告诉用户「完成了」·先自检通过再说。**

> 京都 case 教训：4 个 modal 全空·我直到用户提醒才发现。如果上线前自检·应该 5 分钟内能抓到。

---
