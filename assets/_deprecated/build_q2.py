#!/usr/bin/env python3
"""
build_q2.py — 把 Q2 安排问卷模板 + 一份配置 JSON 构建成可直接打开填写的成品 HTML。

用途：
  travel-itinerary skill 的 Q2 问卷模板（questionnaire-q2.template.html）里留了 7 个占位符
  和 5 个数据块。本脚本读取一份 config.json，用精确锚点替换占位符、注入数据块，输出
  用户可直接双击打开填写的成品页面。

用法：
  python3 build_q2.py <config.json> [-o output.html] [-t template.html]
    默认模板：同目录 questionnaire-q2.template.html
    默认输出：questionnaire-q2.built.html

config schema（字段名与模板数据块对齐）：
  {
    "mode": "full|constraint|express",     // 必填，决定渲染模式
    "destination": "柳州",                  // _PROFILE.destination
    "trip_id": "liuzhou-3d",               // 缺省 'trip'
    "start_date": "2026-06-20",            // _PROFILE.start_date
    "archetype": "short",                  // short/medium-single/medium-multi/long
    "city_slug": "liuzhou",                // _CITY_SLUG
    "country_code": "CN",                  // 缺省 'CN'
    "locks": [ {...} ],                    // -> const LOCKS = [...]
    "todo_sections": [ {label, items} ],   // -> const TODO_SECTIONS = [...]
    "days": [ {num, date, weekday, theme, timeline:[...], ...} ],  // -> const DAYS = [...]
    "spot_options": [ {n, city, type, region, ...} ],  // -> 追加进 const SPOT_OPTIONS（保留模板兜底项）
    "daily_meal_pool": { "region_slug": [...] }        // -> const DAILY_MEAL_POOL = {...}，缺省 {}
  }

设计：纯函数式字符串处理，每步返回新字符串，不原地改全局。
"""

import sys
import os
import json
import argparse

VALID_MODES = ("full", "constraint", "express")

# (config_key, js_const_name, 结束符)  —— 结束符为行首出现的闭合
DATA_BLOCKS = [
    ("locks", "LOCKS", "\n];"),
    ("todo_sections", "TODO_SECTIONS", "\n];"),
    ("days", "DAYS", "\n];"),
    ("spot_options", "SPOT_OPTIONS", "\n];"),
    ("daily_meal_pool", "DAILY_MEAL_POOL", "\n};"),
]


def load_config(path):
    """读取并校验 config，返回 dict。"""
    with open(path, "r", encoding="utf-8") as f:
        cfg = json.load(f)
    mode = cfg.get("mode")
    if mode not in VALID_MODES:
        sys.exit(f"❌ mode 非法：{mode!r}，只接受 {VALID_MODES}")
    # 必须字段缺失 → warning（不退出，占位符给默认）
    for key in ("destination", "start_date", "archetype", "city_slug"):
        if not cfg.get(key):
            print(f"⚠️  config 缺少 {key}，将留空——成品页可能信息不完整")
    return cfg


def safe_json(data):
    """JSON 注入：保留中文，转义 </script> 避免提前闭合脚本块。"""
    s = json.dumps(data, ensure_ascii=False, indent=2)
    return s.replace("</script>", "<\\/script>")


SENTINEL = "__UNSET__"

# 字段名（用于运行时守卫探测）→ 占位符 token。
# 模板里这些字段都有形如 `_PROFILE.x !== '{{TOKEN}}'`（或 `=== '{{TOKEN}}'`）的运行时守卫，
# 用来判断「构建时填没填值」。朴素全局替换会把守卫里的占位符也换成真实值，
# 导致 `'柳州' !== '柳州'` 恒 false（守卫被打穿），全部走默认/空分支。
# 修复策略：先把所有守卫比较里的 '{{TOKEN}}' 换成哨兵 '__UNSET__'，
# 再把剩下的声明处 '{{TOKEN}}' 注入真实值。真实值 !== '__UNSET__' 恒真 → 守卫恒判「已构建」。
GUARDED_TOKENS = (
    "{{Q2_MODE}}",
    "{{DESTINATION}}",
    "{{TRIP_ID}}",
    "{{START_DATE}}",
    "{{ARCHETYPE}}",
    "{{COUNTRY_CODE}}",
    # CITY_SLUG 经核实模板里无运行时守卫，只有声明处，故不在此列；
    # 仅做声明处替换即可，不存在被打穿风险。
)


def _sentinel_guards(html):
    """把所有守卫比较里的占位符换成哨兵（精确字符串，不用贪心 regex）。

    守卫两种形态：`!== '{{TOKEN}}'`（未填则取默认）与 `=== '{{TOKEN}}'`（未填则视为无效）。
    两种都属同一 bug 类：注真实值会让「值跟自己比」，必须先上哨兵。返回新字符串。
    """
    for token in GUARDED_TOKENS:
        html = html.replace(f"!== '{token}'", f"!== '{SENTINEL}'")
        html = html.replace(f"=== '{token}'", f"=== '{SENTINEL}'")
    return html


def replace_placeholders(html, cfg):
    """精确锚点替换占位符（先上哨兵保护守卫，再注入真实值）。返回新字符串。"""
    # 第一步：所有运行时守卫里的占位符 → 哨兵，避免被注入的真实值打穿
    html = _sentinel_guards(html)
    # 第二步：剩下的声明处占位符 → 真实值
    mapping = {
        "{{Q2_MODE}}": cfg["mode"],
        "{{DESTINATION}}": cfg.get("destination", ""),
        "{{TRIP_ID}}": cfg.get("trip_id", "trip"),
        "{{START_DATE}}": cfg.get("start_date", ""),
        "{{ARCHETYPE}}": cfg.get("archetype", ""),
        "{{CITY_SLUG}}": cfg.get("city_slug", ""),
        "{{COUNTRY_CODE}}": cfg.get("country_code", "CN"),
    }
    for token, value in mapping.items():
        html = html.replace(token, value)
    return html


def inject_block(html, const_name, closer, data, is_spot_options=False):
    """
    定位 `const X = [`（或 `{`）起点，找该声明后第一个行首结束符，整段替换。
    用 find 起点 + 固定结束符，不用 .*? 跨数组越界。返回新字符串。
    """
    open_char = "{" if closer == "\n};" else "["
    anchor = f"const {const_name} = {open_char}"
    start = html.find(anchor)
    if start == -1:
        sys.exit(f"❌ 模板里找不到锚点：{anchor}")
    end = html.find(closer, start)
    if end == -1:
        sys.exit(f"❌ 模板里找不到 {const_name} 的结束符 {closer!r}")
    end_full = end + len(closer)

    # spot_options：保留模板兜底项，把 config 项 merge 进去（兜底项是通用必备）
    if is_spot_options:
        original = html[start + len(anchor):end]
        merged = _merge_spot_options(original, data)
        replacement = f"const {const_name} = [{merged}\n];"
    else:
        replacement = f"const {const_name} = {safe_json(data)};"

    return html[:start] + replacement + html[end_full:]


def _merge_spot_options(original_body, config_items):
    """把 config 的 spot_options 追加到模板原有兜底项前面，保留兜底项。"""
    config_json = ",\n".join("  " + safe_json(item) for item in config_items)
    body = original_body.rstrip()
    if config_json:
        # config 项放前面，再接原有兜底项
        return "\n" + config_json + ",\n" + body.lstrip("\n")
    return original_body


def build(template_html, cfg):
    """主构建：先换占位符，再逐块注入。每步返回新字符串。"""
    html = replace_placeholders(template_html, cfg)
    for config_key, const_name, closer in DATA_BLOCKS:
        if config_key == "spot_options":
            html = inject_block(
                html, const_name, closer,
                cfg.get(config_key, []), is_spot_options=True,
            )
        elif config_key == "daily_meal_pool":
            html = inject_block(html, const_name, closer, cfg.get(config_key, {}))
        else:
            html = inject_block(html, const_name, closer, cfg.get(config_key, []))
    return html


def verify(html, cfg):
    """后置校验：残留占位符 / 数据块合法性。失败则退出。"""
    # 1. 残留 {{...}} 占位符
    leftovers = []
    idx = 0
    while True:
        i = html.find("{{", idx)
        if i == -1:
            break
        j = html.find("}}", i)
        if j == -1:
            break
        leftovers.append(html[i:j + 2])
        idx = j + 2
    if leftovers:
        sys.exit("❌ 仍有残留占位符：" + ", ".join(sorted(set(leftovers))))

    # 1b. 守卫完整性：占位符守卫应已全部上哨兵或换成真实 mode 比较，
    #     产物里不应再有任何 `!== '{{` / `=== '{{` 残留（说明哨兵化漏了）。
    for op in ("!== '{{", "=== '{{"):
        if op in html:
            i = html.find(op)
            sys.exit(f"❌ 仍有占位符守卫未哨兵化（在 {i} 附近）：{html[i:i+40]!r}")

    # 1c. 守卫打穿检测：构建时守卫是「未填则取默认」的三元形态
    #     `_PROFILE.<field> !== '<真实注入值>' ? _PROFILE.<field> : <默认>`。
    #     若注入值未先上哨兵，这里就成了「值跟自己比」恒 false，永远取默认分支。
    #     只检测这种三元自比形态，避免误伤 `=== 'short'` 这类合法业务字面量比较。
    guard_values = {
        "destination": cfg.get("destination", ""),
        "trip_id": cfg.get("trip_id", "trip"),
        "start_date": cfg.get("start_date", ""),
        "archetype": cfg.get("archetype", ""),
        "country_code": cfg.get("country_code", "CN"),
    }
    for field, value in guard_values.items():
        if not value:
            continue
        for op in ("!==", "==="):
            # 三元自比：比较右值与紧随其后引用同字段，才是被打穿的守卫
            broken = f"_PROFILE.{field} {op} '{value}' ? _PROFILE.{field}"
            if broken in html:
                sys.exit(
                    f"❌ 守卫被打穿（值跟自己比，恒判错分支）：{broken}\n"
                    f"   {field} 的运行时守卫未上哨兵就被注入了真实值 {value!r}。"
                )

    # 2. 数据块合法性校验。
    #    SPOT_OPTIONS 有意保留模板兜底项（含 JS 注释），不是合法 JSON 但运行时 JS 合法，
    #    故跳过其严格 JSON 校验；其余 4 块必须能被 json 反解。
    for config_key, const_name, _ in DATA_BLOCKS:
        if config_key == "spot_options":
            continue
        anchor = f"const {const_name} = "
        start = html.find(anchor)
        body = _extract_balanced(html, start + len(anchor))
        try:
            json.loads(body)
        except json.JSONDecodeError as e:
            sys.exit(f"❌ {const_name} 注入后不是合法 JSON：{e}")


def _extract_balanced(html, pos):
    """从 pos（开括号 [ 或 {）起，按括号配对提取完整 JSON 片段（忽略字符串内括号）。"""
    open_char = html[pos]
    close_char = "]" if open_char == "[" else "}"
    depth = 0
    in_str = False
    esc = False
    for i in range(pos, len(html)):
        c = html[i]
        if in_str:
            if esc:
                esc = False
            elif c == "\\":
                esc = True
            elif c == '"':
                in_str = False
        else:
            if c == '"':
                in_str = True
            elif c == open_char:
                depth += 1
            elif c == close_char:
                depth -= 1
                if depth == 0:
                    return html[pos:i + 1]
    return html[pos:]


def main():
    ap = argparse.ArgumentParser(description="构建 Q2 安排问卷成品 HTML")
    ap.add_argument("config", help="config.json 路径")
    ap.add_argument("-o", "--output", help="输出 HTML 路径")
    ap.add_argument("-t", "--template", help="模板 HTML 路径")
    args = ap.parse_args()

    script_dir = os.path.dirname(os.path.abspath(__file__))
    template_path = args.template or os.path.join(script_dir, "questionnaire-q2.template.html")
    output_path = args.output or os.path.join(script_dir, "questionnaire-q2.built.html")

    cfg = load_config(args.config)
    with open(template_path, "r", encoding="utf-8") as f:
        template_html = f.read()

    html = build(template_html, cfg)
    verify(html, cfg)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html)

    print(
        f"✅ 构建完成 · mode={cfg['mode']} · 目的地={cfg.get('destination','?')} · "
        f"DAYS={len(cfg.get('days', []))}天 · "
        f"SPOT_OPTIONS={len(cfg.get('spot_options', []))}个(+模板兜底) · "
        f"输出={output_path}"
    )


if __name__ == "__main__":
    main()
