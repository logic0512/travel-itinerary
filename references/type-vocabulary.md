# 链路通用语言总表（type vocabulary · 唯一标准）

> **这是整条管道 type 标签的唯一权威总表（single source of truth）。**
> 各界面内部可以用自己的简写「方言」，但**任何数据进入 trip-print-v2 出图前，必须先翻成本表的标准 type（普通话）**——由断裂 C 的归一化工序统一完成，落地实现见 `stage4-selector.js` 的 `normalizeType()`。
> 新增任何 type，必须先在本表登记，否则会被兜底成 `sight`。

## 一、标准 type（普通话）— 选择器/出图唯一认的词

| 标准 type | 含义 | category | 是否点位 | 触发的模板逻辑 |
|---|---|---|---|---|
| `sight` | 一般观光景点 | sightseeing | 恒点位 | T1/T4/T5-7 |
| `sight_cultural` | 文化古迹/宗教（寺庙·神社·博物馆·老街） | culture | 恒点位 | 同上 |
| `sight_nature` | 自然景观（公园·湖海·山·庭院） | outdoor | 恒点位 | 同上；注意≠徒步 |
| `experience` | 一般体验活动 | experience | 恒点位 | 同上 |
| `experience_outdoor` | 户外活动/徒步（**整天/半天**） | outdoor | 恒点位 | **触发 T3 徒步日判定**（需配 `duration`：≥3h 才成 T3，<3h 退化成普通户外点位、不出 T3） |
| `experience_food` | 美食体验点（市场·夜市·美食街） | food | 恒点位 | 同市内点位 |
| `meal_breakfast/lunch/dinner/snack` | 正餐 | food | **条件点位**（`must_visit` 或 `intent=flagship/signature` 才算动线点位，否则只挂餐饮栏） | attachMeals |
| `shop` | 购物 | shopping | 恒点位 | 同市内点位 |
| `venue` | 可漫步的场所（校园·园区·影视取景地） | venue | 恒点位 | 同市内点位 |
| `free` | 自由活动 | experience | 恒点位 | hasSubstance |
| `transit` | 交通转场（配 `intent='intercity'` = 跨城） | —（不计 category） | 不算点位 | **触发 T2 转场日判定** |
| `hotel` | 住宿 | —（不计 category） | 条件点位 | — |
| `note` | 备注 | —（不计 category） | 不算点位 | — |

## 二、方言 → 普通话 映射（归一化关口必须覆盖）

### planner（地图界面）6 个标签
| planner 方言 | → 标准 type | 说明 |
|---|---|---|
| `sight` | `sight` | 一致，直接通过 |
| `nature` | `sight_nature` | 公园/庭院/湖海 |
| `shrine` | `sight_cultural` | 神社/寺庙 |
| `shopping` | `shop` | 购物街/商圈 |
| `food` | `experience_food` | 美食市场/美食点位（≠正餐 meal_*） |
| `urban` | `sight` | 城市地标/综合商圈 |

### discovery（发现界面）3 个标签
| discovery 方言 | → 标准 type | 说明 |
|---|---|---|
| `spot` | `sight` | **粗分**——断裂 C 须按实际细化为 `sight`/`sight_cultural`/`sight_nature` |
| `food` | `experience_food` | 美食点位；若是「必吃正餐」则细化为 `meal_*` |
| `experience` | `experience` | **粗分**——若是户外徒步须细化为 `experience_outdoor` |

## 三、兜底规则（绝不静默丢内容）

- 已是普通话 → 原样通过。
- 命中方言映射 → 翻成对应标准 type。
- **未登记的任何 type → 兜底为 `sight`（普通景点），并留记号**——宁可降级成普通景点，也绝不像旧版那样当「查无此词」直接扔掉（旧 bug：自然景观点整批消失 → 整天误判休整日）。

## 四、断裂 C 必须做的「细化 + 补全」（光翻译不够）

翻译只解决「标签对不上」，但出图还需要地图界面**根本不产出**的信息，断裂 C 必须由 Claude 补：

1. **type 归一化**：所有 planner/discovery 方言 → 普通话（本表第二节）。
2. **粗分细化**：`spot`/`experience` 按实际细分（看风景=sight_nature、寺庙=sight_cultural、徒步=experience_outdoor）。
3. **徒步日**：当天主活动是徒步 → 该段标 `experience_outdoor` + 必填 `duration`（≥5h 或占当天 >60% → 整天 T3；≥3h → 半天）+ 视情况填 `on_trail_food`（有无补给点）。
4. **转场日**：跨城/跨岛那天 → 合成一条 `{type:'transit', intent:'intercity', from, to, coords起/止, duration}`（planner 不产出转场段，必须 Claude 造，否则选不出 T2）。
5. **maturity 回填**：按 9.0.2 分段表给每个 `day.maturity`（locked/partial/open），缺省按路径：A 路径新建 day 缺省 `open`，B/C 缺省 `partial`。
6. **duration 补全**：每个点位补停留时长（来自 Stage 0 研究），否则徒步判定失效。

> 验收：归一化后跑 `selectPagesForDay`，确认①没有点位因 type 消失（市内日点位数 == 实际点位数）②徒步日选出 T3 ③转场日选出 T2 ④每天 maturity 已落 ⑤**城际段数对账**（多城）：`intercity` transit 段数 == `meta.city_plan.intercity` 段数，缺即 fail（防多段漏造）。

## 五、易错品类消歧登记（冰雪 / 温泉 / 野生动物等 · 病灶⑭）

> **为什么单列**：`normalizeType` 兜底只保证「不丢内容」（未登记 → 降级 `sight`），但**归成哪个 type 直接决定出哪种页**。最常踩的坑是把「人在户外、但不是徒步」的活动误标 `experience_outdoor` → 误触 T3 徒步日页（实证：T3 **唯一**由 `experience_outdoor` + `duration ≥ 3h` 触发，见 `stage4-selector.js` 的徒步判定；`sight_nature` / `experience` 都不触发 T3）。

**消歧总则（先记这一条）**：只有**真正的野外徒步 / 登山 / 越野步道**（`duration ≥ 3h`；或在当天其它点也都标了时长时、占当天 > 60%）才标 `experience_outdoor`。**「在户外但不靠脚力徒步」的一律不标 outdoor 类**——冰雪娱乐、滑雪场、露天市集、车览观兽、园区漫步走 `experience` / `sight_nature` / `sight`，否则会被误判成徒步日、套错版式。

> **关键反直觉点：`category` 是 outdoor ≠ 触发 T3**——`sight_nature` 和 `experience_outdoor` 的 category 都是 `outdoor`，但 T3 徒步日**只认 `type === 'experience_outdoor'` + `duration ≥ 3h`**；`sight_nature` 点再多也出不了 T3。别把「category=outdoor」和「徒步日 T3」划等号。

| 真实品类 | 标准 type | `outdoor` 天气标记* | 为什么这么归（防什么误判） |
|---|---|---|---|
| 冰雪大世界 / 冰灯 / 冰雕展 / 雪乡 | `experience` | `true`（露天受天气影响） | 「逛 + 玩」的娱乐场，不是徒步——标 outdoor 类会误触 T3 徒步页。category=experience |
| 滑雪 / 雪场玩雪 / 雪圈 | `experience` | `true` | 娱乐运动，非徒步步道；除非是多小时野外越野滑雪 tour 才考虑 `experience_outdoor` |
| 温泉 / 泡汤 / SPA | `experience` | `false`（室内放松；露天汤池也按室内级别、雨天照常泡） | 放松体验，绝非户外徒步；`outdoor=false` 让它雨天不被当「室外景点需备替代」 |
| 野生动物观察 · **徒步式**（丛林徒步 / 步道观鸟 / 走路 safari） | `experience_outdoor` + `duration` | `true` | 这是真徒步，该出 T3、配 `duration` / `on_trail_food` |
| 野生动物观察 · **车览式**（自驾野生动物园 / 草原驱车观兽 / game drive） | `sight_nature` | `true` | 坐车慢看的自然景观点，不靠脚力——归 `sight_nature`（category=outdoor 但**不触发 T3**） |
| 野生动物 · **园区步行参观**（围栏动物园 / 步行区） | `experience` 或 `sight` | `true` | 园内漫步参观，非野外徒步，不标 `experience_outdoor`（即便走够 3h 也不标） |
| 室内娱乐 / 体验馆（攀岩馆 / 蹦床 / 密室 / VR / 陶艺手作） | `experience` | `false`（室内） | 室内娱乐体验，显然非野外徒步，归 experience；雨天照常 |

> *`outdoor` 是 `cards[].outdoor` 的天气标记（是否露天、雨天是否需室内替代），与 `type` 是两回事：`type` 决定页型，`outdoor` 决定天气层提示。两者都要单独填对。
> **新增其它品类时**：先问一句「这天会不会被当成徒步日（T3）？」——会（真徒步登山）才标 `experience_outdoor`；不会就从 `experience` / `sight` / `sight_nature` 里选，并按本表格式补登记一行。
>
> **⚠ 还有第二套页型分类器（别只盯选页器 T3）**：`type` 不只喂 `stage4-selector.js` 的选页器（T1–T8），还喂 `references/pdf-output-rules.md` 的「P-DAILY 模板类型推断」——其中「`experience_outdoor` 节点存在，或 `sight_nature` 节点 ≥50%」会让那天走**「户外自然型」视觉版式**（强调路线难度 / 装备 / 天气）。所以车览式 safari 归 `sight_nature` 的后果是：① 选页器**不出 T3 徒步页**（对）；② 但视觉版式可能走「户外自然型」——**这是预期且正确的**（自然观光日本就该用自然版式），不是 bug。冰雪 / 温泉归 `experience` 则两套分类器都不进户外类，走普通市内版式。归类时心里要同时过这两套，别以为「躲过 T3」就万事大吉。
