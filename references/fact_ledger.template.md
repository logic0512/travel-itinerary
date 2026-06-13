# fact_ledger · 事实台账模板

> 使用方式：每个旅行 case 开始后，复制本文件到该 case 输出目录，命名为 `fact_ledger.md`。
> 推荐放置：与 `analysis-report.md`、`trip.json`、`trip.html` 同级。
> 目的：记录所有会影响行程可执行性的事实来源，避免把未核实信息写成确定安排。

## Metadata

| 字段 | 内容 |
|---|---|
| trip_id |  |
| destination |  |
| date_range |  |
| checked_at | YYYY-MM-DD |
| operator | Codex / Claude |

## Confidence Rules

| confidence | 定义 | 可否进入确定 timeline |
|---|---|---|
| high | 官网、官方地图、官方社媒、交通官网、票据截图等直接来源 | 可以 |
| medium | 大型平台、订票平台、近期多源一致的信息 | 可以，但关键项需提醒 |
| low | 博客、攻略帖、旧内容、单一非官方来源、OCR 不确定内容 | 不可作为 critical 确定项 |

## Fact Ledger

| id | fact | source_type | source | checked_at | confidence | impact | action | linked_item | note |
|---|---|---|---|---|---|---|---|---|---|
| F001 | 示例：某餐厅周三休息 | official_site | URL / source title | YYYY-MM-DD | high | critical | adopt | card_id / day_num |  |
| F002 | 示例：用户截图写了 18:00 到达 | user_artifact | file name / page / crop | YYYY-MM-DD | low | critical | needs_recheck | day_1 transit | 需二次核实班次 |

## Action Values

| action | 含义 |
|---|---|
| adopt | 已核实，写入行程 |
| avoid | 已核实不可行，不写入行程 |
| fallback | 可作为备选或替代方案 |
| needs_recheck | 当前不能确定，必须继续核实或提醒用户 |

## Source Types

| source_type | 例子 |
|---|---|
| official_site | 官网、景区官网、餐厅官网 |
| official_map | Google Maps、高德、Apple Maps、官方 POI |
| ticket_order | 机票、火车票、酒店、门票、租车订单截图 |
| platform | Klook、KKday、TripAdvisor、Tabelog、携程等 |
| user_artifact | 用户给的备忘录截图、手绘路线 PDF、聊天记录 |
| search_result | 搜索结果摘要，需尽快升级来源 |

## Pre-Stage 3 Gate

- [ ] 所有 `impact=critical` 的事实都有 `confidence=high` 或明确 fallback。
- [ ] 没有 `critical + low` 的事实直接进入确定 timeline。
- [ ] 所有 `source_type=user_artifact` 的事实都已二次核实或标记 `needs_recheck`。
- [ ] 营业时间、定休日、交通班次、票据时间、酒店入住/退房时间均已覆盖。
