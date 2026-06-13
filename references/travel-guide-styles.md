# 旅行攻略视觉风格库 · 6 种（PDF 画册专用）

> 基于真实旅行出版物 + 旅行 App 设计语言调研反推。
> **用法**：Stage 3 开始前，先判断目的地气质和用户旅行类型，从本库选 1 种风格，
> 再结合 `design-rules.md` 的目的地色板覆盖，生成 `theme.css`。
>
> ⚖️ **定位**：帮用户规避「千篇一律 AI 旅行页」——不是唯一可选的清单。
> 用户给了明确风格参考（参考截图 / 目的地品牌）→ 从那里展开，别套库。
> 没有明确参考 → 按「风格选择三逻辑」（见下）决定用哪套。

## 两层设计结构（必读）

本文件定义的 6 种风格是**视觉语言层**，整趟旅行选一次、全程使用。
这是一个独立概念，**不等于「每天的页面模板类型」**。

| 维度 | 选择时机 | 选择逻辑 | 定义在哪里 |
|---|---|---|---|
| **视觉风格**（本文件） | 全程选一次，Stage 3 开始前 | 按目的地气质 + 旅行类型 | `travel-guide-styles.md` |
| **页面模板类型** | 每天独立推断，Stage 2 期间 | 按当天 card type 分布自动推断 | `pdf-output-rules.md` §P-DAILY模板类型 |

**它们正交**：同一本「日系手账风」攻略，第1天可以是「标准行程」布局，第3天可以是「户外自然」布局，第5天可以是「美食市场」布局——视觉语言一致，信息结构按需变化。

---

## 风格选择三逻辑（没有用户偏好时使用）

**逻辑一 · 目的地映射**：先用 `design-rules.md` 的 `destination_mood` 判断目的地气质，
再按本库「适合目的地」列做精确匹配，选气质契合度最高的 1 种。

**逻辑二 · 旅行类型映射**：先判断用户的出行类型（观光 / 美食扫街 / 徒步探险 / 文化沉浸 / 城市效率），
再选对应的风格——「扫街吃货」选街拍扫街风，「轻奢度假」选精品旅行风。

**逻辑三 · 反惯性注入**：若前两条都指向「中性安静」风格，强制注入一种大胆款的元素做反差
（如用编辑大字报的版式 + 日系手账的留白，防止所有城市的攻略都长一个样）。

---

## 样式 1 · 杂志社论风 Magazine Editorial `中性·还原95%`

**参考**：Monocle Magazine（Tyler Brûlé 创办，2007–至今）；Cereal（英国生活旅行杂志）

**适合**：欧洲城市、日本、台湾、文化沉浸型旅行；中高消费用户；首次出境长线游

**视觉 DNA**：
- 配色：暖米纸底 `#F4F0E8` + 主调深色（按目的地变）+ 规则黑线 + 单一强调色
- 字体：衬线标题（Noto Serif SC）× 无衬线正文（Noto Sans SC），两者尺寸和粗细有明显反差
- 布局：严格竖向模块分区，1px 黑线分栏，每块只说一件事；图文比约 1:1
- 标志元素：竖线分栏 / 方形规矩图片框 / 全大写细字母区域标签 / 期刊式页码
- 图片处理：方形或 3:2 裁切，满宽或单栏内嵌，不做圆角

**地图外观**：CartoDB Positron 浅色底图 / 深墨色 #1a1a1a 圆形 marker，白色数字编号 / 1px 深墨色实线

**HTML 实现**：
```css
/* 分栏竖线 */
.col { border-right: 1px solid var(--ink); }
/* 区域标签 */
.region-label { font: 500 9px/1 var(--mono); letter-spacing: .22em; text-transform: uppercase; }
/* 图片框 */
.photo { aspect-ratio: 3/2; overflow: hidden; }
.photo img { width: 100%; height: 100%; object-fit: cover; }
```

**字体**：Noto Serif SC（标题）+ Noto Sans SC（正文）+ JetBrains Mono（标签/数字）

---

## 样式 2 · 日系手账轻量风 Japanese Travel Journal `安静·还原97%`

**参考**：地球の歩き方（日本最大旅行指南丛书）；Brutus「城市特集」号（マガジンハウス）

**适合**：日本、东亚城市、台湾、慢游散步型旅行；喜欢「按自己节奏走」的用户

**视觉 DNA**：
- 配色：极浅暖白底 `#FAFAF8` + 浅墨 `#2A2218` 文字 + 极细线条 `#E8E4DC` 分隔 + 单一朱红或靛青强调
- 字体：正文字号小（11-12px），行高宽松（1.85），大量留白让内容「呼吸」
- 布局：左侧细竖线时间轴 / 右侧内容；图片小而精，每张配手写感说明；没有大色块
- 标志元素：极细线 / 小尺寸图 / 大留白 / 标注式文字（数字旁加单位）/ 类手账的说明框
- 图片处理：4:3 或正方形小图，多图网格排列，每张有 1-2 行图说

**地图外观**：CartoDB Positron 浅色底图 / 极小朱红 #B5302A 圆点 marker（直径 10px），无数字编号，图例靠图说 / 0.8px 极细朱红线，opacity 0.6

**HTML 实现**：
```css
/* 宽行高安静正文 */
body { font: 400 12px/1.85 var(--serif); color: #2A2218; }
/* 手账式说明框 */
.note-box { border: 1px solid #E8E4DC; padding: 8px 12px; font-size: 11px; }
/* 时间轴细线 */
.tl-line { width: 1px; background: #D4CFC8; }
```

**字体**：Noto Serif SC + Noto Sans SC（小号）+ JetBrains Mono

---

## 样式 3 · 现代城市导航风 Urban Navigation Guide `中性·还原92%`

**参考**：Airbnb Guidebooks（产品内置）；Time Out City Guides（数字版）；Google Trips（已停运但视觉语言流传）

**适合**：东京、首尔、上海、纽约等大都会；多城市跨区行程；效率导向、「最大化打卡」型用户

**视觉 DNA**：
- 配色：白底 `#FFFFFF` 或极浅灰 `#F7F7F5` + 目的地主色 + 每个片区一个颜色编码（深色点 / 色标签）
- 字体：全无衬线，信息密度高，字号层级清晰（标题 18px / 正文 13px / 标签 10px）
- 布局：卡片流 / 列表 + 地图整合；时间节点显著；交通信息用标签组呈现
- 标志元素：圆形片区色点 / 地铁线色标签 / 步行时间标注 / 「从A到B用XX分钟」信息
- 图片处理：16:9 宽图为主，图片服务于「让用户识别这个地方」而非情绪渲染

**地图外观**：CartoDB Positron 浅色底图 / 片区主色圆形 marker（粗边框 2px 白色描边），白色数字编号 / 2px 主色实线

**HTML 实现**：
```css
/* 片区色点 */
.district-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
/* 交通标签 */
.transport-tag { background: rgba(var(--district-rgb), .1); color: var(--district-color);
                 border: 1px solid rgba(var(--district-rgb), .25);
                 font: 400 10.5px/1 var(--mono); padding: 3px 10px; border-radius: 20px; }
/* 卡片列表 */
.spot-card { border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
```

**字体**：Noto Sans SC（全站）+ JetBrains Mono（时间/编号/交通）

---

## 样式 4 · 高端精品旅行风 Luxury Travel `安静·还原90%`

**参考**：Condé Nast Traveller（英国版，高端）；Aman Resorts 品牌刊物；Kinfolk Travel 特辑

**适合**：马尔代夫、普吉岛、日本温泉乡、欧洲精品线路；轻奢 / 蜜月 / 高端度假型用户

**视觉 DNA**：
- 配色：大面积留白 `#FFFFFF` / 米色 `#F5F0E8` + 深色文字 + 金色或裸粉单一强调 + 禁用任何鲜艳色
- 字体：衬线大标题（Noto Serif SC）为主，正文字号适中、行高宽松；无等宽字体
- 布局：图片占版面 ≥50%，文字退居次位；宽留白、单栏阅读流；绝不出现密集卡片
- 标志元素：全幅图 / 极简线条分隔 / 横线+居中标题 / 没有标签组件
- 图片处理：全幅横图 1920px 宽 / 竖图与文字并排；裁切以「情绪」为优先，不追求信息完整

**地图外观**：CartoDB Positron 浅色底图 / 金色 #C9A84C 细圆 marker（直径 12px），深色数字编号 / 1px 金色实线

**HTML 实现**：
```css
/* 全幅图（封面可用 16:9，不要超宽——超宽裁切会让主体消失） */
.hero-img { width: 100%; aspect-ratio: 16/9; overflow: hidden; }
.hero-img img { width: 100%; height: 100%; object-fit: cover; object-position: center; }
/* 极简分隔 */
.divider { width: 60px; height: 1px; background: var(--gold); margin: 24px auto; }
/* 居中标题 */
.centered-headline { text-align: center; font: 500 32px/1.2 var(--serif); letter-spacing: .04em; }
```

**字体**：Noto Serif SC（全站）+ Noto Sans SC（小字注释）

---

## 样式 5 · 街拍扫街风 Street & Food Explorer `大胆·还原88%`

**参考**：Eater（美国美食媒体，Vox Media）；Tokyo Cheapo（东京本地指南）；柳州螺蛳粉地图

**适合**：东南亚、成都、大阪、台南等美食型目的地；美食扫街、夜市打卡、街头文化型旅行

**视觉 DNA**：
- 配色：深底 `#1A1614` 或暖深褐 + 目的地强调色（亮橙 / 艳红 / 柠檬黄）+ 白字 + 高饱和
- 字体：大号粗体标题（Noto Sans SC 800）+ 小号密集信息；字号反差极大
- 布局：信息密度高，每张卡片信息量大；时间轴紧凑；图片以「食物特写」为主
- 标志元素：深底卡片 / 价格大字显示 / 「必点」「人均」等购物清单式标签 / 营业时间醒目
- 图片处理：正方形食物特写 / 店铺招牌 / 排队实景，不要风景图

**地图外观**：CartoDB Dark Matter 深色底图（`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png`）/ 亮橙 #F97316 圆形 marker，深色数字编号 / 2px 亮橙实线

**HTML 实现**：
```css
/* 深底卡片 */
.food-card { background: #2A2218; border: 1px solid #3A3020; border-radius: 8px; color: #fff; }
/* 大价格标签 */
.price-tag { font: 700 22px/1 var(--mono); color: var(--accent); }
/* 必点 badge */
.must-try { background: var(--accent); color: #fff;
            font: 600 10px var(--sans); padding: 2px 8px; border-radius: 3px; }
```

**字体**：Noto Sans SC（全站，粗细反差）+ JetBrains Mono（价格/时间）

---

## 样式 6 · 自然探险风 Adventure & Nature `大胆·还原85%`

**参考**：National Geographic Traveler；Outside Magazine 数字版；AllTrails 路线页

**适合**：花莲、云南、冰岛、新西兰等自然型目的地；徒步、海钓、峡谷、极地探险型旅行

**视觉 DNA**：
- 配色：大地色系——林绿 `#3A5741` / 山岩赭 `#7A5C38` / 天空蓝 `#2E5F8C` + 白字 + 警示橙强调
- 字体：粗无衬线标题（Noto Sans SC 700）+ 正文适中密度；数据标注用等宽字
- 布局：左侧固定「路线数据」（海拔/距离/难度）+ 右侧时间轴；图片以全景横图为主
- 标志元素：路线数据面板 / 难度/警告 badge / 海拔示意 / 天气提示条
- 图片处理：宽幅横图 16:9（最宽到此为止，禁止 2.39:1 等超宽电影比——裁切后主体消失），强调自然壮阔感；不要城市街景

**地图外观**：OpenTopoMap 地形底图（`https://{a|b|c}.tile.opentopomap.org/{z}/{x}/{y}.png`）/ 林绿 #3A5741 圆形 marker，橙色 #F97316 边框描边，白色数字编号 / 2px 林绿实线

**HTML 实现**：
```css
/* 路线数据面板 */
.trail-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
               background: var(--line); border: 1px solid var(--line); }
.trail-stat { background: var(--card); padding: 12px; text-align: center; }
.trail-stat .val { font: 700 20px/1 var(--mono); color: var(--accent); }
.trail-stat .lbl { font: 400 9px/1 var(--sans); color: var(--muted); letter-spacing: .12em; margin-top: 4px; }
/* 警告 badge */
.warn-badge { background: rgba(201,122,34,.12); color: #c97a22;
              border: 1px solid rgba(201,122,34,.3);
              font: 600 10px var(--sans); padding: 3px 10px; border-radius: 3px; }
```

**字体**：Noto Sans SC（全站，重量反差）+ JetBrains Mono（数据）

---

## 目的地 → 推荐风格 快速对照

| 目的地类型 | 首选风格 | 备选风格 |
|---|---|---|
| 欧洲城市（巴黎/罗马/京都） | 杂志社论风 | 精品旅行风 |
| 东亚文化型（台湾/日本） | 日系手账风 | 杂志社论风 |
| 大都会多城（东京/首尔） | 城市导航风 | 街拍扫街风 |
| 轻奢度假（海岛/温泉） | 精品旅行风 | 杂志社论风 |
| 美食扫街（成都/大阪/台南） | 街拍扫街风 | 城市导航风 |
| 自然徒步（花莲/云南/冰岛） | 自然探险风 | 杂志社论风 |

---

## 图片取齐检查点（Stage 3 强制步骤，设计开始前完成）

> 对应 huashu-design Phase 3.5 的逻辑。设计没开始前把图片来源搞定，
> 布局围绕已有图片做，不是边做边想「图放哪里」。

### 步骤

1. **列图片清单**：把 trip.json 里所有 sight / experience / meal 类型的 card_id 列出来，
   这是「每张 card 需要 1 张代表图」的基础清单。

2. **图片来源优先级**（按顺序尝试）：
   | 来源 | 适用 | 获取方式 |
   |---|---|---|
   | 用户提供的照片 | 任何 | 直接用，无版权问题 |
   | 官网 / 官方社媒 | 景区 / 餐厅 | `web_search "{地点名} official site photo"` |
   | Wikimedia Commons | 知名景点 | `web_search "site:commons.wikimedia.org {英文地点名}"` |
   | Google Maps 静态截图 | 地图 / 位置图 | Maps Embed API 或截图 |
   | 旅行平台公开页面 | 餐厅 / 酒店 | 取可公开访问的图片 URL |

   ⚠️ **认主体，不盲取第一张**：搜索返回的第一张常常不是地标代表图（搜 Senso-ji 可能返回签筒特写、搜 Meiji 可能返回施工围栏）。取图前先核对内容是不是该地标的标志性主体，不符就用更精确的词二次搜：`{地点} main hall` / `red brick building` / `torii gate` / `crossing` / `night view`。这是「图片张冠李戴」的根因。

3. **嵌入方式**：
   - 优先本地化——取到图片 URL 后，下载到 `assets/images/{card_id}.jpg`
   - ⚠️ **下载防坑（必做）**：从 `upload.wikimedia.org` 用 curl 下载必须带浏览器 UA + referer，否则被 robot policy 直接 403 返回几十字节错误页（这是「图片全空」的根因）：
     ```bash
     curl -L -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" \
          -e "https://commons.wikimedia.org/" -o assets/images/xxx.jpg "https://upload.wikimedia.org/..."
     file assets/images/xxx.jpg   # 必须是 JPEG/PNG image data 且 >10KB，否则重试
     ```
   - HTML 里用相对路径 `<img src="assets/images/c_xxx.jpg">`，不要用外部 URL（截图时可能加载不到）
   - **同一张图禁止跨页复用**：封面 / 总览 / 每日左栏 hero / 时间轴节点图各用不同图；交付前核验每个图片文件在 HTML 里只出现 1 次
   - 找不到图的 card：在 `asset_ledger.md` 标 `needs_image`，该 card 从 PDF Daily Page 移除，移到文字备注区

4. **地图图片单独处理（样式锁定，禁止跑偏）**：
   - Daily Page 左栏的地图不是景点图——是当天**真实街道路线图**
   - ⚠️ **样式锁死**：必须 Leaflet + 真实淡色街道底图，底图固定 CartoDB Positron：`https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png`；当天各点按行程顺序标编号 marker（①②③④）+ polyline 连线 + `fitBounds` 自动框选 + 下方编号图例
   - 做成独立 HTML → Chrome headless 截图（`--virtual-time-budget=8000` 等瓦片加载完）→ 存 `assets/maps/day-{N}.png`，`file` 校验真 PNG 且 >20KB
   - **绝对禁止**：纯色/深色背景 + 只有点和线的抽象示意图（无街道底图、不能定位、没有攻略价值）。这是换模型最容易跑偏的地方——不锁死就会出废图。
   - 地图是**硬门槛**：不允许用「今日路线」纯文字列表替代（这正是地图丢失的根因）

5. **图片核对门（进入 HTML 编写前）**：
   - [ ] Daily Page 上每个非 transit card 都有对应图片文件
   - [ ] 每张图都 `file` 校验过是真 JPEG/PNG 且 >10KB（不是 403 错误页）
   - [ ] 每张图都核对过内容确实是对应地标的主体（不是张冠李戴）
   - [ ] 每个图片文件在 HTML 里只出现 1 次（零跨页复用）
   - [ ] 地图图片（或替代文字方案）已确定
   - [ ] `asset_ledger.md` 已记录全部图片来源
   - [ ] 没有任何图片是用 CSS 色块 / emoji / 渐变替代的
