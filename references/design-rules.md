# travel-itinerary · 设计规则 v1.1

> 这份规则替代对 `frontend-design` / `huashu-design` 的调用。
> 目标：AI 读完这份文件，能直接为任意目的地生成合适的 `theme.css`，无需外部 skill，无需让用户选方向。
>
> **使用方式**：Stage 3 生成 `theme.css` 前，先读本文件，按目的地类型找到对应色板，
> 然后用 `theme.template.css` 作为基础，只覆盖本文档「可覆盖变量」里列出的部分。
> 不在列表里的 CSS 不要动。

---

## 一、什么可以改，什么不能动

### 可以改（皮肤层）

```css
:root {
  --bg          /* 页面大底色 */
  --bg-paper    /* 卡片内底 */
  --card        /* 卡片白底 */
  --fg          /* 主文字色 */
  --muted       /* 次文字色 */
  --line        /* 分割线色 */
  --accent      /* 主调色（导航/顶栏/按钮） */
  --accent-dark /* 主调深色 */
  --accent-mist /* 主调淡雾（hover底/tag背景） */
  --hl          /* 强调红（critical标注/链接） */
  --hl-dark
  --hl-light
  --highlight-yellow  /* 装饰高光 */
  --warn-bg / --warn-border
  --washi-divider     /* 波纹分隔SVG */
  --paper-texture     /* 底纹SVG */
  --font-decorative   /* 装饰字体（标题/印章）*/

  /* 片区色（每个 region_slug 一个）*/
  --region-{slug}: #xxxxxx;
}
```

### 不能动（结构层，改了布局会坏）

- `--font-serif`（衬线字体堆栈，v2.4 硬规则）
- `--font-sys` / `--font-mono`
- `--font-scale`
- 所有 `.day` `.timeline` `.card-spot` 的 class 名和 grid 定义
- `--hl` 不要改成非红色系（模板里 critical bar 用硬编码的红色逻辑）

---

## 二、目的地类型 → 色板

### 先写 visual brief（必做）

生成 theme.css 前，先用 4 行判断目的地的阅读场景和气质：

```md
visual_brief:
- destination_mood:
- reading_context:
- layout_density:
- palette_logic:
```

`destination_mood` 只能从下列方向中选 1-2 个：

| 方向 | 适用场景 | 视觉处理 |
|---|---|---|
| 历史古典 | 京都、罗马、西安、巴黎老城 | 纸感、低饱和、强文字层级 |
| 自然山海 | 花莲、桂林、云南、瑞士 | 更清爽的底色、绿/蓝片区色、减少厚重纹理 |
| 热带轻快 | 泰国、越南、海南、海岛 | 暖色高光、清晰按钮、避免过暗复古 |
| 都市效率 | 东京、上海、首尔、新加坡 | 更紧凑、更现代的系统字体辅助、信息密度高 |
| 美食扫街 | 柳州、台南、大阪、成都 | 餐饮卡突出招牌菜/营业时间/排队提醒 |
| 亲子轻松 | 亲子/家庭游 | 大字号、低对比疲劳、减少装饰复杂度 |
| 独行安全 | solo 行程 | 夜间提醒、交通回退、紧急入口更突出 |

如果没有明显文化符号，默认用「清爽实用旅行手册」而不是硬套某个国家风格。

### visual brief → CSS 变量映射

先按 `country_code / city` 选择基础色板，再用 `destination_mood` 做二次修正。mood 不是替代色板，而是影响信息层级、提醒强度和组件密度。

| destination_mood | 影响变量/组件 | 调整规则 |
|---|---|---|
| 历史古典 | `--bg`, `--bg-paper`, `--font-decorative`, `--paper-texture` | 背景偏暖纸感；纹理 opacity 0.05-0.07；装饰字体可更有地域感 |
| 自然山海 | `--bg`, `--accent`, `--accent-mist`, `--region-*` | 背景更清爽；主色偏绿/蓝；降低纸纹 opacity 到 0.04-0.05 |
| 热带轻快 | `--accent`, `--hl-light`, `--highlight-yellow`, quick buttons | 高光偏暖；按钮对比更清楚；避免深褐/过重旧纸感 |
| 都市效率 | `layout_density`, `.day-nav`, `.card-info`, `--font-sys` 辅助 | 信息更紧凑；减少装饰纹理；系统字体只用于数字/状态/标签 |
| 美食扫街 | `.card-dishes`, `.card-info`, `--dish-bg`, `--dish-border` | 招牌菜和营业时间更突出；餐厅卡优先显示排队/预约/现金信息 |
| 亲子轻松 | `--font-scale`, `--warn-bg`, `.quick-btn`, `.day-reminders` | 字号略大；提醒底色更柔和；减少高对比红色面积 |
| 独行安全 | `--warn-bg`, `--warn-border`, `.quick-bar`, emergency modal, night reminders | 紧急入口更醒目；夜间/返程提醒优先级上调；警示色偏温和但边框更明确 |

如果一个行程同时有 2 个 mood：

1. 先应用目的地基础色板。
2. 再应用功能性 mood（如 独行安全 / 亲子轻松 / 美食扫街）。
3. 最后检查视觉验收，确保不是一味加红或加黄。

### 类型判断优先级

1. 先看 `meta.country_code`（TW / CN / JP / KR / TH / IT / FR / US 等）
2. 再看目的地文化气质（山水自然 / 城市潮流 / 历史古典 / 热带海岛）
3. 同一国家不同城市可以有不同色调（如台北偏蓝、花莲偏绿、台中偏橙）

---

### 2.1 台湾（country_code: TW）

**气质**：清爽南岛 + 日治遗韵 + 都市活力

```css
:root {
  --bg:             #f4f0ea;
  --bg-paper:       #ede9e0;
  --card:           #fdf8f2;
  --fg:             #2a2218;
  --muted:          #7a6e5a;
  --line:           #d8cfb8;
  --accent:         #2e7d9b;   /* 台湾蓝 */
  --accent-dark:    #1a4f64;
  --accent-mist:    #b8d4df;
  --hl:             #c9362e;
  --hl-light:       #d97a2c;
  --highlight-yellow: #e8a635;  /* 南岛暖金 */
  --warn-bg:        #fff3d6;
  --warn-border:    #e8a635;
}

/* 常见片区色 */
--region-taipei:     #2e7d9b;   /* 台北·蓝 */
--region-hualien:    #3a8c5c;   /* 花莲·翠绿 */
--region-taichung:   #c47d2a;   /* 台中·暖橙 */
--region-tainan:     #b85c38;   /* 台南·赤陶 */
--region-kaohsiung:  #5a7db0;   /* 高雄·钢蓝 */
--region-kenting:    #2a9d8f;   /* 垦丁·水青 */
```

---

### 2.2 日本（country_code: JP）

**气质**：四季物哀 + 侘寂留白 + 精致细节

```css
:root {
  --bg:             #f5f0e8;
  --bg-paper:       #ede6d8;
  --card:           #fdfaf4;
  --fg:             #1e1a14;
  --muted:          #6e6455;
  --line:           #d4c9aa;
  --accent:         #8b1a1a;   /* 朱红（京都/东京） */
  --accent-dark:    #5c0f0f;
  --accent-mist:    #ddb8b8;
  --hl:             #8b1a1a;
  --hl-light:       #c4633a;
  --highlight-yellow: #c9a227;
  --warn-bg:        #fff8e7;
  --warn-border:    #c9a227;
  --font-decorative: '"Shippori Mincho", "Noto Serif JP", "Songti SC", serif';
  /* ⚠️ font-decorative 可以加日文装饰字，但 font-serif 不能改 */
}

/* 片区色示例 */
--region-kyoto-higashiyama: #8b1a1a;
--region-kyoto-arashiyama:  #4a7556;
--region-kyoto-fushimi:     #c4633a;
--region-osaka-namba:       #d97a2c;
--region-osaka-shinsekai:   #2c5f8a;
--region-tokyo-shinjuku:    #4a5568;
--region-tokyo-asakusa:     #8b1a1a;
```

---

### 2.3 东南亚（country_code: TH / VN / MY / SG / ID / PH）

**气质**：热带浓郁 + 寺庙金 + 海洋绿松

```css
:root {
  --bg:             #f5ede0;
  --bg-paper:       #ede3d0;
  --card:           #fdf8ef;
  --fg:             #2a1e10;
  --muted:          #7a6248;
  --line:           #d8c9a0;
  --accent:         #c47d2a;   /* 热带金 */
  --accent-dark:    #8a5518;
  --accent-mist:    #e8d0a0;
  --hl:             #c9362e;
  --hl-light:       #e07840;
  --highlight-yellow: #d4a020;
  --warn-bg:        #fff3d0;
  --warn-border:    #d4a020;
}

/* 曼谷示例 */
--region-bangkok-old-town: #c47d2a;
--region-bangkok-sukhumvit: #2e7d9b;
--region-chiangmai:         #4a7556;
```

---

### 2.4 欧洲（country_code: IT / FR / DE / ES / PT / GR / NL 等）

**气质**：历史石材 + 阳光赭石 + 地中海蓝

```css
:root {
  --bg:             #f2ede5;
  --bg-paper:       #e8e2d8;
  --card:           #faf6ef;
  --fg:             #1e1a14;
  --muted:          #6e6455;
  --line:           #d4c9b0;
  --accent:         #8b4513;   /* 赭石（通用欧洲） */
  --accent-dark:    #5c2c08;
  --accent-mist:    #d4b898;
  --hl:             #c9362e;
  --hl-light:       #c4633a;
  --highlight-yellow: #c9a227;
}

/* 意大利 */
--accent: #8b4513; --accent-dark: #5c2c08;
/* 法国巴黎 */
--accent: #4a5568; --accent-dark: #2d3748;   /* 石灰灰调 */
/* 希腊 */
--accent: #2e7d9b; --accent-dark: #1a4f64;   /* 地中海蓝 */
```

---

### 2.5 中国大陆（country_code: CN）

**气质**：按地域差异大，细分如下

| 目的地 | 主调 | accent |
|---|---|---|
| 北京 | 故宫红 · 墨绿 | #8b1a1a |
| 上海 | 摩登灰 · 海派金 | #4a5568 |
| 成都 | 竹绿 · 红锦 | #4a7556 |
| 重庆 | 山城赤 · 江蓝 | #c9362e |
| 西安 | 土黄 · 城墙赭 | #8b6914 |
| 云南/丽江 | 纳西蓝 · 雪山白 | #2e5fa3 |
| 广州/深圳 | 岭南青 · 现代灰 | #4a7556 |
| 桂林/柳州 | 山水青绿 · 墨 | #2e7d4a |
| 海南 | 热带碧蓝 · 沙金 | #0d7d8c |

```css
/* 通用大陆结构（accent 按上表替换） */
:root {
  --bg:          #f5ede0;
  --bg-paper:    #ede3ce;
  --card:        #fdf8ef;
  --fg:          #2c2218;
  --muted:       #7a6a52;
  --line:        #d8c9a8;
}
```

---

### 2.6 韩国（country_code: KR）

**气质**：民间五方色 + 现代简练

```css
:root {
  --accent:      #4a5c8a;   /* 청색（청자蓝） */
  --accent-dark: #2d3a5c;
  --hl:          #c9362e;
  --hl-light:    #d97a2c;
  --highlight-yellow: #d4a020;
}
--region-seoul-bukchon:  #4a5c8a;
--region-seoul-hongdae:  #d97a2c;
--region-busan-haeundae: #2e7d9b;
```

---

## 三、片区色分配规则

当一个目的地有多个城市或片区时：

1. **主城市用主调色**（`--accent`）
2. **第二城市偏移色相 30-60°**，保持同亮度
3. **自然/海滩片区偏绿/青**，市区偏主调，历史区偏暖赭
4. **同一城市的不同片区**：亮度相近、色相间隔 ≥ 20°，确保导航色点能区分

```
示例：6 天台湾（台北/花莲/台中）
台北 → 台湾蓝 #2e7d9b（主调）
花莲 → 翠绿   #3a8c5c（自然/山海）
台中 → 暖橙   #c47d2a（城市/活力）
```

---

## 四、底纹与分隔线 SVG

`--paper-texture` 和 `--washi-divider` 用内联 SVG。以下是替换模板：

### 底纹（fractalNoise，改 seed 和透明度）

```css
--paper-texture: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>
  <filter id='n'>
    <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='{SEED_1-9}' />
    <feColorMatrix values='0 0 0 0 {R}  0 0 0 0 {G}  0 0 0 0 {B}  0 0 0 {OPACITY_0.04-0.08} 0'/>
  </filter>
  <rect width='160' height='160' filter='url(%23n)' />
</svg>");
```

- 温暖米白：seed=2, RGB≈0.94/0.92/0.86, opacity=0.06
- 冷灰石质：seed=5, RGB≈0.90/0.90/0.92, opacity=0.05
- 热带暖黄：seed=3, RGB≈0.96/0.91/0.80, opacity=0.07

### 波纹分隔（改 fill 颜色匹配 accent）

```css
--washi-divider: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 540 28' preserveAspectRatio='none'>
  <path d='M0,18 Q40,10 80,16 T160,18 Q200,8 240,14 T320,16 Q360,4 400,12 T480,14 Q520,8 540,12 L540,28 L0,28 Z'
    fill='{ACCENT_HEX_URL_ENCODED}' opacity='0.18'/>
</svg>");
/* URL 编码：# → %23，如 #2e7d9b → %232e7d9b */
```

---

## 五、排版规则（不可覆盖部分）

这些规则来自 v2.4 checklist，在设计时必须遵守：

- **主体字**：`"Songti SC", "STSong", "Noto Serif SC", Georgia, serif`（不换）
- **装饰字**：可以追加目的地特色字体，但必须放在 `--font-decorative` 里，不影响主体
- **行高**：`1.7`（不换）
- **最大宽度**：`540px`（移动端优先，不换）

---

## 六、生成 theme.css 的作业步骤

Stage 3 生成主题时，按以下顺序操作：

```
1. 确认 meta.country_code / meta.city / 旅行类型 / 用户阅读场景
1b. 写 visual_brief，决定 mood / density / palette_logic
2. 在本文件找到对应目的地类型，取出 CSS 变量值
3. 按 `visual brief → CSS 变量映射` 应用 mood 修正（如 solo 安全、美食扫街、亲子轻松）
4. 如果目的地不在列表里：
   - 判断文化气质（历史古典 / 自然山海 / 热带 / 现代都市）
   - 套最近似的类型色板
   - accent 色可以微调（色相 ±15°）
5. 按城市/片区数量分配 --region-xxx 色（见第三章规则）
6. 复制 theme.template.css，只替换「可覆盖变量」部分
7. 不要删除任何 CSS class 定义，只改变量值
```

---

## 七、不要做的事（反设计 slop）

- ❌ 所有目的地都用同一套蓝白配色
- ❌ 把 accent 改成荧光/饱和度过高的颜色（移动端显示刺眼）
- ❌ 改 `--font-serif`（整个排版体系会崩）
- ❌ 在 `--bg` 用纯白 `#ffffff`（没有纸感）
- ❌ 片区色全用同色系（导航色点无法区分）
- ❌ 为了「好看」在 CSS 里加大量 animation（trip.html 是实用工具，不是展示 demo）
- ❌ 所有攻略都做成同一种米白 + 朱红 + 纸纹
- ❌ 只根据国家套皮肤，不看旅行任务（美食扫街/亲子/solo/跨城）

---

## 八、视觉验收

Stage 3 交付前，必须用手机宽度检查：

- [ ] 首屏能看清目的地、日期、当前 Day、4 个速查入口
- [ ] day-nav 不横向滚动，日期文字不溢出
- [ ] 一天内的信息密度适合路上快速扫读
- [ ] 主题色能解释为该目的地/旅行类型服务，不是默认模板残留

## 九、PDF 画册视觉基准

如果输出 `trip-guide.pdf`，视觉目标不是网页截图，而是旅行画册/幻灯片式攻略：

- 封面使用大图 + 少量文字，目的地第一眼可感知。
- 总览页用城市分栏、代表图片和路线摘要，不用密集表格。
- Daily page 使用「地图/概览 + 时间轴 + 图片行程点」三层结构。
- 图片面积优先于文字面积；每日页图片面积建议 ≥ 35%。
- 每个行程点只保留 1 个标题、1 段短说明、3-5 个实用标签。
- 长介绍、完整链接、编辑模式留给 HTML companion，不塞进 PDF 主视觉。
- 不能出现整页小字卡片堆满的工具感排版。
