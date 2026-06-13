# asset_ledger · 图片资产台账模板

> 使用方式：每个旅行 case 复制本文件到输出目录，命名为 `asset_ledger.md`。
> 目的：记录 PDF 中每张图片的来源、状态、用途和页面位置，确保最终 PDF 美观且可追溯。

## Metadata

| 字段 | 内容 |
|---|---|
| trip_id |  |
| destination |  |
| created_at | YYYY-MM-DD |
| operator | Codex / Claude |

## Asset Ledger

| id | item_id | item_name | item_type | image_path | source_type | source | license_status | used_on_page | crop_note | status |
|---|---|---|---|---|---|---|---|---|---|---|
| IMG001 | c_qixingtan | 七星潭 | sight | assets/images/qixingtan.jpg | wikimedia / official / user | URL or file name | public / user-provided / needs-review | Day 3 | wide crop, horizon centered | ready |
| IMG002 | c_train | 台铁转场 | transit | assets/images/train-ticket.png | user | ticket screenshot | user-provided | Before You Go | crop private info | ready |

## Source Types

| source_type | 说明 |
|---|---|
| user | 用户提供照片、截图、手绘路线图 |
| official | 官网、景区、餐厅、酒店、官方社媒 |
| official_map | Google Maps / 高德 / Apple Maps 的 POI 或地图截图 |
| wikimedia | Wikimedia Commons 等开放图库 |
| platform | 订票/点评/旅行平台公开页面 |
| generated | AI 生成氛围图，仅可用于封面/情绪，不可冒充具体地点 |

## Status Values

| status | 含义 |
|---|---|
| ready | 可用于最终 PDF |
| needs_crop | 已有图，但需要裁切/调色 |
| needs_source | 图可用，但来源记录不完整 |
| needs_image | 缺图，阻塞 PDF 交付 |
| rejected | 图质量差、来源不明或与地点不符 |

## Image Gate

- [ ] PDF 中出现的所有 sight / experience / meal / hotel cards 都有 `ready` 图片。
- [ ] 每天至少 1 张大图或 2 张中图。
- [ ] 没有使用与地点无关的 stock-like 图片冒充真实地点。
- [ ] 私人票据/订单截图已裁掉敏感信息。
- [ ] 所有 `generated` 图片只用于 mood，不用于具体 POI。
