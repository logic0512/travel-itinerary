# travel-itinerary · 旅游攻略 Skill for Claude Code

一个让 Claude Code 半自动生成旅行攻略的 Skill·从目的地收集到最终渲染为**可离线使用的 HTML 攻略**·端到端 4 阶段完成。

> 🎌 **真实 case 演示**：[京都 5 天 4 人攻略](https://logic0512.github.io/kyoto-2026/)（v2.4.1 测试 case）

---

## 功能一览

- **4 阶段工作流**：Intake 收集 → Q1 决策问卷 → Q2 行程锁定 → trip.html 渲染
- **任意目的地**：国内/国际通用，链接策略自动切换（国内高德优先，国际 Google Maps）
- **离线 HTML 问卷**：Q1/Q2 均为单文件 HTML，双击即用，草稿自动保存至 LocalStorage
- **Edit Mode**：生成的 trip.html 支持行程内联编辑·批注·一键导出改动摘要
- **天气感知**：出发前 7 天内自动提示核查室外景点·trip.html 按天展示天气栏 + 室内备选
- **独行模式**：人数 = 1 时自动展开夜间安全偏好问卷·trip.html 注入安全提醒
- **餐饮密度保障**：强制按片区填充日常便餐池·杜绝"自由/路上小吃"占位超标
- **链接策略**：v2.4.1 起禁用大众点评/美团/小红书等强制登录链接·只用 Maps/Tabelog/IG 等可直达内容
- **手机友好**：京町家和风主题（默认）·中日宋体堆栈·timeline 上下分层·微信浏览器可开

---

## 安装

### 方式一：手动安装（推荐）

```bash
# 克隆或下载此仓库
git clone https://github.com/logic0512/travel-itinerary.git

# 复制到 Claude Code skills 目录
cp -r travel-itinerary ~/.claude/skills/travel-itinerary
```

### 方式二：通过 Claude Code 插件市场

在 Claude Code 中运行：
```
/install-skill https://github.com/logic0512/travel-itinerary
```

---

## 使用方式

在 Claude Code 会话中说：

> 「帮我做一个罗马 6 天的旅行攻略，5 月出发，2 人」

Claude 会自动激活此 Skill，进入 Stage 0 Intake，引导你完成全流程。

---

## 工作流程

```
Stage 0 · Intake（对话）
  对话收集目的地/日期/人数/航班，批量 web_search 验证候选实体
        ↓
Stage 1 · Q1 决策问卷（HTML · 离线填写）
  主题偏好、风险决策、景点/美食候选、雨天态度
        ↓
Stage 1.5 · 矛盾消化（对话）
  Claude 生成分析报告，锁定路线/住宿区/预算
        ↓
  ★ 用户去订机票 + 酒店
        ↓
Stage 2 · Q2 行程锁定问卷（HTML · 离线填写）
  时间轴编辑、餐饮确认、备用方案、一键导出 3 份
        ↓
Stage 3 · 最终渲染
  Claude 生成 trip.html（单文件，双击即用）
```

---

## 产物说明

| 产物 | 用途 |
|---|---|
| `questionnaire-q1.html` | 出行决策问卷，导出 decisions.md |
| `questionnaire-q2.html` | 行程锁定问卷，导出 arrangement.md + trip.json + todo.md |
| `trip.html` | 出行中使用的攻略，含 Edit Mode、天气栏、预算追踪 |
| `todo-before-trip.md` | 出行前清单（已订完/行前/出发当天/出行中实时） |

---

## 行程档位（Archetype）

| 档位 | 适用场景 |
|---|---|
| `short` | 1–3 天 · 单城周末游 |
| `medium-single` | 4–6 天 · 单城深度游 |
| `medium-multi` | 4–7 天 · 多城/跨城游 |
| `long` | 7 天以上 · 长途旅行 |

---

## 版本历史

| 版本 | 状态 | 亮点 |
|---|---|---|
| v1 | 废弃 | 架构性问题 |
| v2.1 | 跑通（泰国/柳州） | 基础流程建立 |
| v2.2 | 跑通（上海） | 双维过滤·宵夜偏好·草稿保存 |
| v2.3 | 跑通 | 链接重写·四维过滤·餐饮密度·Edit Mode·天气感知 |
| v2.4 | 跑通（京都） | cards 字段 schema·京町家主题·上下分层 timeline·删预算追踪 |
| **v2.4.1** | **当前版本** | 禁登录链接·Stage 3 最终对账·链接策略硬规则 |

---

## 依赖

- Claude Code（配合 `frontend-design` skill 生成主题皮肤）
- 无其他依赖，所有 HTML 产物均为零依赖单文件

---

## License

MIT · [logic0512](https://github.com/logic0512)
