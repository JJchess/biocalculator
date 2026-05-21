/**
 * EPA Priority Pollutants 数据访问层
 * ──────────────────────────────────────────────────────────
 * 数据由 scripts/build-epa-pollutants.ts 离线生成,
 * 源数据 = 40 CFR Part 423 Appendix A (126 条) + PubChem 分子式溯源。
 * 半反应系数由 lib/chem 引擎基于元素—电荷守恒自动配平。
 *
 * 用法:
 *   import { EPA_POLLUTANTS, EPA_META, getEpaPollutant } from "@/lib/data/epaPollutants";
 *   const benzene = getEpaPollutant("004");
 */

import epaJson from "./generated/epa-pollutants.json";

// ── 类型 ────────────────────────────────────────────────────
export type EpaRole = "donor" | "acceptor_metal" | "non_redox" | "excluded";
export type EpaProductLogic =
  | "full_mineralization"
  | "partial_dechlorination"
  | "redox_only"
  | "cn_oxidation"
  | "reductive_only"
  | "excluded";

export type EpaCategory =
  | "Volatile"
  | "Acid-Extractable"
  | "Base-Neutral"
  | "Pesticide"
  | "Dioxin"
  | "Metal"
  | "Inorganic"
  | "Mineral";

export type EpaBalance = {
  /** 物种 id → 有符号系数 (Fraction 字符串如 "-1/30" 或 "2") */
  coefficients: Record<string, string>;
  molecularWeight: number;
  /** KaTeX 表达式 */
  equationKatex: string;
  /** 元素 + 电荷残差 (均应为 "0") */
  balance_residuals: Record<string, string>;
};

export type EpaPollutant = {
  /** EPA 官方 3 位编号 (40 CFR 423 Appx A) */
  epa_id: string;
  cas: string;
  name_en: string;
  name_cn: string;
  formula: string;
  category: EpaCategory;
  subcategory: string;
  role: EpaRole;
  product_logic: EpaProductLogic;
  notes: string;
  /** PubChem 化合物查询页 URL (基于 CAS) */
  pubchem_url: string;
  /** eCFR 官方法规链接 */
  ecfr_url: string;
  /** 仅 donor / acceptor_metal 有 */
  balance?: EpaBalance;
  balance_error?: string;
  products?: { id: string; formula: string }[];
};

export type EpaMeta = {
  source: string;
  url: string;
  generatedAt: string;
  generator: string;
  total: number;
  donors_balanced: number;
  acceptors_balanced: number;
  non_redox_recorded: number;
  excluded: number;
  balance_failures: number;
};

// ── 加载 ────────────────────────────────────────────────────
const typed = epaJson as { meta: EpaMeta; entries: EpaPollutant[] };

export const EPA_META: EpaMeta = typed.meta;
export const EPA_POLLUTANTS: EpaPollutant[] = typed.entries;

// ── 索引 ────────────────────────────────────────────────────
const BY_ID = new Map<string, EpaPollutant>(
  EPA_POLLUTANTS.map((p) => [p.epa_id, p]),
);
const BY_CAS = new Map<string, EpaPollutant>(
  EPA_POLLUTANTS.map((p) => [p.cas, p]),
);

// ── 查询 ────────────────────────────────────────────────────
export function getEpaPollutant(epaId: string): EpaPollutant | undefined {
  return BY_ID.get(epaId);
}

export function getEpaPollutantByCas(cas: string): EpaPollutant | undefined {
  return BY_CAS.get(cas);
}

export function getEpaDonors(): EpaPollutant[] {
  return EPA_POLLUTANTS.filter((p) => p.role === "donor" && p.balance);
}

export function getEpaAcceptors(): EpaPollutant[] {
  return EPA_POLLUTANTS.filter(
    (p) => p.role === "acceptor_metal" && p.balance,
  );
}

export function getEpaByCategory(cat: EpaCategory): EpaPollutant[] {
  return EPA_POLLUTANTS.filter((p) => p.category === cat);
}

/** 用于 UI 分类展示的固定顺序 + 中文 label */
export const EPA_CATEGORY_ORDER: { id: EpaCategory; label: string }[] = [
  { id: "Volatile", label: "挥发性有机物 (VOCs)" },
  { id: "Acid-Extractable", label: "酸性可提取 (酚类)" },
  { id: "Base-Neutral", label: "碱性/中性可提取 (PAHs / 酞酸酯 / 卤代芳烃)" },
  { id: "Pesticide", label: "农药 / PCBs" },
  { id: "Dioxin", label: "二噁英" },
  { id: "Metal", label: "金属" },
  { id: "Inorganic", label: "无机阴离子" },
  { id: "Mineral", label: "矿物纤维" },
];

/** 用于 UI 关键词搜索: 中文、英文、CAS、EPA 编号、分子式均匹配 */
export function searchEpa(query: string): EpaPollutant[] {
  if (!query.trim()) return EPA_POLLUTANTS;
  const q = query.trim().toLowerCase();
  return EPA_POLLUTANTS.filter((p) => {
    if (p.epa_id.includes(q)) return true;
    if (p.cas.toLowerCase().includes(q)) return true;
    if (p.name_en.toLowerCase().includes(q)) return true;
    if (p.name_cn.toLowerCase().includes(q)) return true;
    if (p.formula.toLowerCase().includes(q)) return true;
    if (p.subcategory.toLowerCase().includes(q)) return true;
    return false;
  });
}
