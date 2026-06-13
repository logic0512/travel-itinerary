# 已退役文件（2026-06-11 归档）

这些是旧的「问卷表格」方案产物。新方案已改为四界面地图管道（discovery → planner → supplement → trip-print-v2），见 SKILL.md。

保留原因：以后优化 discovery/planner/supplement 时，可参考问卷里成熟的字段设计与校验逻辑（如 Q2 的四维过滤、build_q2.py 的占位符哨兵/守卫完整性校验、餐饮密度字段）。

- questionnaire-q1.template.html — 旧 Stage1 决策问卷（8章）
- questionnaire-q2.template.html — 旧 Stage2 安排问卷（full/constraint/express 三模式）
- build_q2.py — Q2 三模式构建脚本（占位符替换+数据注入+守卫完整性校验）
- q2-config.example.json — build_q2 配置样例（柳州 express）
- trip-print.template.html — 旧打印版渲染模板（被 trip-print-v2 的 8 模板系统取代）
- trip.template.html — 旧 offline-first 单文件交互版（Edit Mode + 天气层，被四界面管道取代）
