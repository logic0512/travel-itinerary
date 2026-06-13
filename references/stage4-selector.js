'use strict';

// ── Stage 4 页面模板选择器（纯逻辑层，无 HTML/CSS）─────────────────
// 设计规格：references/page-template-system.md §三/§四/§八/§九/§十一

// 1. duration 字符串 → 小时数。兼容 '1.5小时'/'5小时'/'6h'/'90分钟'。
function parseHours(str) {
  if (str == null) return null;
  if (typeof str === 'number') return str;
  const s = String(str).trim();
  // 分钟：'90分钟' / '90min' / '90 分'
  let m = s.match(/([\d.]+)\s*(分钟|分|min)/i);
  if (m) return parseFloat(m[1]) / 60;
  // 小时：'1.5小时' / '5小时' / '6h' / '6 hour'
  m = s.match(/([\d.]+)\s*(小时|时|h|hour)/i);
  if (m) return parseFloat(m[1]);
  // 纯数字 → 当小时
  m = s.match(/^([\d.]+)$/);
  if (m) return parseFloat(m[1]);
  return null;
}

// ── 链路通用语言（普通话）归一化关口 ──────────────────────────
// 唯一总表：references/type-vocabulary.md
// 各界面方言（planner: nature/shrine/shopping/urban；discovery: spot…）进入
// 选择器前一律翻成标准 type；翻不出的兜底为 'sight'，绝不静默丢弃。
const CANONICAL_TYPES = new Set([
  'sight', 'sight_cultural', 'sight_nature',
  'experience', 'experience_outdoor', 'experience_food',
  'meal_breakfast', 'meal_lunch', 'meal_dinner', 'meal_snack',
  'shop', 'venue', 'free', 'transit', 'hotel', 'note',
]);

const TYPE_ALIAS = {
  // planner 方言
  nature: 'sight_nature',
  shrine: 'sight_cultural',
  shopping: 'shop',
  urban: 'sight',
  food: 'experience_food',
  // discovery 方言
  spot: 'sight',
  // 历史别名兜底
  meal: 'meal_lunch',
};

// 幂等：normalizeType(normalizeType(x)) === normalizeType(x)
function normalizeType(type) {
  if (typeof type !== 'string' || type === '') return 'sight';
  if (CANONICAL_TYPES.has(type)) return type;   // 已是普通话
  if (TYPE_ALIAS[type]) return TYPE_ALIAS[type]; // 方言翻译
  return 'sight';                                // 兜底：当普通景点，绝不丢
}

// type → category 映射（§八A）
function typeToCategory(type) {
  type = normalizeType(type);
  switch (type) {
    case 'sight': return 'sightseeing';
    case 'sight_cultural': return 'culture';
    case 'sight_nature':
    case 'experience_outdoor': return 'outdoor';
    case 'meal_breakfast':
    case 'meal_lunch':
    case 'meal_dinner':
    case 'meal_snack':
    case 'experience_food': return 'food';
    case 'shop': return 'shopping';
    case 'experience': return 'experience';
    case 'venue': return 'venue';
    case 'free': return 'experience'; // 默认归 experience（§八A）
    default: return null; // transit/hotel/note 不计入
  }
}

// 2. 是否算「点位」（§九，按目的计数）
function isPoint(item) {
  if (!item) return false;
  const t = normalizeType(item.type);
  // 恒为点位
  const alwaysPoint = new Set([
    'sight', 'sight_cultural', 'sight_nature',
    'experience', 'experience_outdoor', 'experience_food',
    'venue', 'free', 'shop',
  ]);
  if (alwaysPoint.has(t)) return true;
  // 条件点位：meal_* / hotel
  const conditional = t === 'hotel' || (typeof t === 'string' && t.startsWith('meal_'));
  if (conditional) {
    if (item.must_visit === true) return true;
    if (item.intent === 'flagship' || item.intent === 'signature') return true;
    return false;
  }
  // transit / note / 其它 → 永不算
  return false;
}

// 取 coords（兼容 item.coords || card.coords）
function getCoords(item) {
  if (!item) return null;
  if (Array.isArray(item.coords) && item.coords.length === 2) return item.coords;
  if (item.card && Array.isArray(item.card.coords) && item.card.coords.length === 2) return item.card.coords;
  return null;
}

// 4. 同质判定：映射 category 后 ≥80% 同一类（points 已是过滤后的点位）
function isHomogeneous(points) {
  const cats = points.map(p => typeToCategory(p.type)).filter(Boolean);
  if (cats.length === 0) return false;
  const counts = {};
  for (const c of cats) counts[c] = (counts[c] || 0) + 1;
  const max = Math.max(...Object.values(counts));
  return max / cats.length >= 0.8;
}

// Haversine 直线距离（km）
function haversineKm(a, b) {
  const R = 6371;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// 5. 所有有 coords 的点两两最大直线距离；缺失 >1 个 → null
function maxPairwiseKm(points) {
  const withCoords = [];
  let missing = 0;
  for (const p of points) {
    const c = getCoords(p);
    if (c) withCoords.push(c);
    else missing++;
  }
  if (missing > 1) return null;
  if (withCoords.length < 2) return 0; // 0或1个点 → 距离视为0
  let max = 0;
  for (let i = 0; i < withCoords.length; i++) {
    for (let j = i + 1; j < withCoords.length; j++) {
      const d = haversineKm(withCoords[i], withCoords[j]);
      if (d > max) max = d;
    }
  }
  return max;
}

// 6. 是否步行圈集中（≤1.5km）；null 时回退 day.compact_area===true
function isCompact(points, day) {
  const max = maxPairwiseKm(points);
  if (max === null) return day && day.compact_area === true;
  return max <= 1.5;
}

// 7. 邻近档位（§八B）
function proximityTier(points) {
  const max = maxPairwiseKm(points);
  if (max === null) return '未知';
  if (max <= 1.5) return '步行圈';
  if (max <= 5) return '打车圈';
  if (max <= 12) return '公交圈';
  return '分散';
}

// 8. 徒步整天/半天判定（§十一阈值）
function isLongHike(item) {
  if (!item) return false;
  const h = parseHours(item.duration);
  if (h == null) return false;
  return h >= 3; // ≥3h 才进入 T3 判定（whole/half）
}

function hikeKind(day) {
  if (!day || !Array.isArray(day.timeline)) return null;
  const hike = day.timeline.find(t => t.type === 'experience_outdoor');
  if (!hike) return null;
  const h = parseHours(hike.duration);
  if (h == null) return null;

  // 当天总活动时长（所有有 duration 的 timeline 项）
  // 占比规则只在「其它活动也标了时长」时才可靠——否则徒步会被误判为占满全天。
  let total = 0;
  let otherDuration = 0;
  for (const t of day.timeline) {
    const th = parseHours(t.duration);
    if (th != null) {
      total += th;
      if (t !== hike) otherDuration += th;
    }
  }
  const ratioReliable = otherDuration > 0;
  const ratio = total > 0 ? h / total : 0;

  if (h >= 5) return 'whole';
  if (ratioReliable && ratio > 0.6) return 'whole';
  if (h >= 3) return 'half';
  return null; // <3h → 普通户外点位
}

// 9. 均衡拆页（§四）：maxPerPage=5, pages=ceil(N/5), 差值≤1, 保持时间顺序
function balancedSizes(n, pages) {
  const base = Math.floor(n / pages);
  let rem = n - base * pages;
  const sizes = [];
  for (let i = 0; i < pages; i++) {
    // 余数优先分给前面的页（6→3,3；7→4,3；9→5,4；11→4,4,3）
    sizes.push(base + (rem > 0 ? 1 : 0));
    if (rem > 0) rem--;
  }
  return sizes;
}

function splitPages(points, tpl) {
  const N = points.length;
  const maxPerPage = 5;
  const pages = Math.max(1, Math.ceil(N / maxPerPage));
  const sizes = balancedSizes(N, pages);
  const result = [];
  let idx = 0;
  for (const sz of sizes) {
    result.push({ template: tpl, points: points.slice(idx, idx + sz) });
    idx += sz;
  }
  return result;
}

// 10. selectInCity（§十一）
function selectInCity(points) {
  const n = points.length;
  if (n === 0) return [];
  if (n <= 3) {
    const tpl = n === 1 ? 'T5' : n === 2 ? 'T6' : 'T7';
    return [{ template: tpl, points: points.slice() }];
  }
  // ≥4：同质 或 集中 → T4，否则 T1
  const tpl = (isHomogeneous(points) || isCompact(points, points.__day)) ? 'T4' : 'T1';
  return splitPages(points, tpl);
}

// 餐饮归属：早午餐进上半页，晚餐进下半页（§四）
function mealCategoryForPage(pageIndex, totalPages) {
  // 上半 = 前一半页，下半 = 后一半页
  const half = totalPages / 2;
  return pageIndex < half ? 'upper' : 'lower';
}

function attachMeals(pages, day) {
  if (!day || !day.meals) return pages;
  const total = pages.length;
  const { breakfast, lunch, dinner } = day.meals;
  for (let i = 0; i < total; i++) {
    const slot = mealCategoryForPage(i, total);
    const meals = {};
    if (slot === 'upper') {
      if (breakfast) meals.breakfast = breakfast;
      if (lunch) meals.lunch = lunch;
    } else {
      if (dinner) meals.dinner = dinner;
    }
    // 单页：早午晚全进
    if (total === 1) {
      if (breakfast) meals.breakfast = breakfast;
      if (lunch) meals.lunch = lunch;
      if (dinner) meals.dinner = dinner;
    }
    if (Object.keys(meals).length) pages[i].meals = meals;
  }
  return pages;
}

// 11. 主函数（§十一优先级）
function selectPagesForDay(day) {
  if (!day || !Array.isArray(day.timeline)) {
    return [{ template: 'T8', role: 'rest' }];
  }
  // 归一化关口：timeline 每项 type 翻成普通话（不可变，新建对象）
  const nday = { ...day, timeline: day.timeline.map(t => ({ ...t, type: normalizeType(t.type) })) };
  const timeline = nday.timeline;
  const points = timeline.filter(isPoint);
  // 标记 day 引用，供 selectInCity 的 isCompact 回退用
  points.__day = nday;

  const crossSegs = timeline.filter(t => t.type === 'transit' && t.intent === 'intercity');

  // 1. 空 → T8（跨城转场段也算实质内容，整天赶路是转场日不是休整日）
  const hasSubstance = points.length > 0 ||
    crossSegs.length > 0 ||
    timeline.some(t => t.type === 'experience_outdoor' || t.type === 'free');
  if (!hasSubstance) {
    return [{ template: 'T8', role: 'rest' }];
  }

  // 2. 多段跨城纯赶路
  if (crossSegs.length >= 2 && points.length <= 1) {
    return attachMeals([{ template: 'T2', role: 'transfer', points: points.slice() }], nday);
  }

  // 3. 跨城 + 落地
  if (crossSegs.length >= 1) {
    // 末段跨城后的 points
    const lastCrossIdx = timeline.lastIndexOf(crossSegs[crossSegs.length - 1]);
    const landing = timeline.slice(lastCrossIdx + 1).filter(isPoint);
    landing.__day = nday;
    if (landing.length <= 2) {
      const page = { template: 'T2', role: 'transfer', points: landing.slice() };
      return attachMeals([page], nday);
    }
    // landing ≥3 → T2 + selectInCity(landing)
    const t2 = { template: 'T2', role: 'transfer', points: [] };
    const cityPages = selectInCity(landing).map(p => ({ ...p, role: 'in_city' }));
    return attachMeals([t2, ...cityPages], nday);
  }

  // 4. 徒步
  const kind = hikeKind(nday);
  if (kind === 'whole') {
    const page = { template: 'T3', role: 'hike' };
    // on_trail_food 影响：有补给点 → 餐饮进 T3 内
    if (nday.on_trail_food && nday.on_trail_food.has_food) {
      page.supply_points = nday.on_trail_food.supply_points || [];
    }
    // 整天徒步：晚餐通常下山吃，挂上（早午餐随补给点；山上无正餐则靠 reminders 提示带干粮，不强挂以免误导）
    if (nday.meals && nday.meals.dinner) {
      page.meals = { dinner: nday.meals.dinner };
    }
    return [page];
  }
  if (kind === 'half') {
    const hike = timeline.find(t => t.type === 'experience_outdoor');
    const rest = points.filter(p => p !== hike);
    rest.__day = nday;
    const t3 = { template: 'T3', role: 'hike' };
    if (nday.on_trail_food && nday.on_trail_food.has_food) {
      t3.supply_points = nday.on_trail_food.supply_points || [];
    }
    const cityPages = selectInCity(rest).map(p => ({ ...p, role: 'in_city' }));
    // on_trail_food 无补给点 → 正餐随城内页（attachMeals 默认行为）
    return attachMeals([t3, ...cityPages], nday);
  }

  // 5. 纯市内
  const cityPages = selectInCity(points).map(p => ({ ...p, role: 'in_city' }));
  return attachMeals(cityPages, nday);
}

module.exports = {
  parseHours,
  normalizeType,
  isPoint,
  typeToCategory,
  isHomogeneous,
  maxPairwiseKm,
  isCompact,
  proximityTier,
  isLongHike,
  hikeKind,
  splitPages,
  selectInCity,
  selectPagesForDay,
};
