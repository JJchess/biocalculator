/**
 * EPA Priority Pollutants — 数据生成脚本
 *
 * 流程:
 *   1. 读 scripts/data/epa-126.seed.tsv (40 CFR 423 Appx A, 人工策展)
 *   2. 对每个 donor: 用元素归宿规则推产物列表
 *      • C → CO₂  • N → NH₄⁺  • Cl/Br/F/I → 卤离子
 *      • S → SO₄²⁻  • P → HPO₄²⁻  • H/O → 由 H₂O 自动平衡
 *   3. 对每个 acceptor_metal: 用预置半反应 (Cr(VI)/As(V)/Hg(II)/Se(VI))
 *   4. 对每个 donor / acceptor_metal: 调 lib/chem 引擎做 Gauss 配平
 *   5. 输出 lib/data/generated/epa-pollutants.json
 *
 * 用法:  npm run build:epa
 */

import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Fraction from "fraction.js";

import { balanceHalfReaction, renameAux } from "../lib/chem/balance";
import { parseFormula, molecularWeight } from "../lib/chem/formula";

// ── 路径 ──────────────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_PATH = resolve(__dirname, "data/epa-126.seed.tsv");
const OUT_PATH = resolve(__dirname, "../lib/data/generated/epa-pollutants.json");

// ── 类型 ──────────────────────────────────────────────────────────────────
type Role = "donor" | "acceptor_metal" | "non_redox" | "excluded";
type ProductLogic =
  | "full_mineralization"
  | "partial_dechlorination"
  | "redox_only"
  | "cn_oxidation"
  | "excluded";

type SeedRow = {
  epa_id: string;
  cas: string;
  name_en: string;
  name_cn: string;
  formula: string;
  category: string;
  subcategory: string;
  role: Role;
  product_logic: ProductLogic;
  notes: string;
};

type BalanceResult = {
  coefficients: Record<string, string>; // id → "n/d" fraction string
  molecularWeight: number;
  equationKatex: string;
  balance_residuals: Record<string, string>;
};

type PollutantEntry = SeedRow & {
  pubchem_url: string;
  ecfr_url: string;
  // 仅 donor / acceptor_metal 有
  balance?: BalanceResult;
  balance_error?: string;
  // 产物列表 (元素归宿规则推导出)
  products?: { id: string; formula: string }[];
};

// ── 元素归宿规则 (Atom Destination Rules) ──────────────────────────────────
// 假设: 完全好氧矿化 (aerobic complete mineralization)
// 参考: Rittmann & McCarty (2001) 《Environmental Biotechnology》Ch. 2
const ATOM_DESTINATION: Record<string, { id: string; formula: string }> = {
  C: { id: "co2", formula: "CO2" },
  N: { id: "nh4", formula: "NH4^+" },
  Cl: { id: "chloride", formula: "Cl^-" },
  Br: { id: "bromide", formula: "Br^-" },
  F: { id: "fluoride", formula: "F^-" },
  I: { id: "iodide", formula: "I^-" },
  S: { id: "sulfate", formula: "SO4^2-" },
  P: { id: "phosphate", formula: "HPO4^2-" },
};

function deriveProducts(formula: string): { id: string; formula: string }[] {
  const parsed = parseFormula(formula);
  const products: { id: string; formula: string }[] = [];
  const seen = new Set<string>();
  for (const el of parsed.elements.keys()) {
    if (el === "H" || el === "O") continue; // H₂O / H⁺ 由引擎平衡
    const dest = ATOM_DESTINATION[el];
    if (!dest) continue; // 跳过未知元素 (会在配平时报错)
    if (!seen.has(dest.id)) {
      products.push(dest);
      seen.add(dest.id);
    }
  }
  return products;
}

// ── 预置变价金属半反应 (acceptor_metal) ──────────────────────────────────
// 这些半反应在教材里是定式, 直接给出 substrate + product
const METAL_HALF_REACTIONS: Record<
  string,
  { substrateFormula: string; productFormula: string; productId: string; substrateId: string }
> = {
  // Cr(VI) → Cr(III):  CrO₄²⁻ + 8 H⁺ + 3 e⁻ → Cr³⁺ + 4 H₂O
  "119": {
    substrateId: "chromate",
    substrateFormula: "CrO4^2-",
    productId: "chromium_iii",
    productFormula: "Cr^3+",
  },
  // As(V) → As(III):  H₂AsO₄⁻ + 3 H⁺ + 2 e⁻ → HAsO₂ + 2 H₂O
  "115": {
    substrateId: "arsenate",
    substrateFormula: "H2AsO4^-",
    productId: "arsenite",
    productFormula: "HAsO2",
  },
  // Hg(II) → Hg(0):  Hg²⁺ + 2 e⁻ → Hg
  "123": {
    substrateId: "mercury_ii",
    substrateFormula: "Hg^2+",
    productId: "mercury_0",
    productFormula: "Hg",
  },
  // Se(VI) → Se(0):  SeO₄²⁻ + 8 H⁺ + 6 e⁻ → Se + 4 H₂O
  "125": {
    substrateId: "selenate",
    substrateFormula: "SeO4^2-",
    productId: "selenium_0",
    productFormula: "Se",
  },
};

// As 和 Se 还未在 ATOMIC_WEIGHTS 里，本脚本会动态扩展
// （已加入 build 起始时的 patch — 见下方 main）

// ── Formula → KaTeX 渲染 ──────────────────────────────────────────────────
function formulaToKatex(formula: string): string {
  // C12H8Cl6 → C_{12}H_{8}Cl_{6}
  // NH4^+    → NH_{4}^{+}
  // SO4^2-   → SO_{4}^{2-}
  let out = formula.replace(/([A-Z][a-z]?)(\d+)/g, (_, el, n) => `${el}_{${n}}`);
  out = out.replace(/\^([0-9]*[+-])/, (_, c) => `^{${c}}`);
  // 处理括号: (SiO3) 这种
  out = out.replace(/\(/g, "(").replace(/\)/g, ")");
  return out;
}

function stoichTex(f: Fraction): string {
  const a = f.abs();
  if (a.equals(1)) return "";
  const n = a.n.toString();
  const d = a.d.toString();
  return d === "1" ? n : `\\frac{${n}}{${d}}`;
}

function buildKatex(
  coefficients: Map<string, Fraction>,
  formulaMap: Map<string, string>,
  direction: "oxidation" | "reduction",
  substrateId: string,
  productIds: string[],
): string {
  const reactants: { tex: string; f: Fraction; key: number }[] = [];
  const products: { tex: string; f: Fraction; key: number }[] = [];

  const rank = (id: string): number => {
    if (id === substrateId) return 0;
    if (productIds.includes(id)) return 10;
    if (id === "h2o") return 90;
    if (id === "h_ion") return 95;
    if (id === "e_minus") return 99;
    return 50;
  };

  for (const [id, f] of coefficients) {
    if (f.equals(0)) continue;
    const formula = formulaMap.get(id) ?? id;
    const tex = id === "e_minus" ? "e^{-}" : formulaToKatex(formula);
    const s = stoichTex(f);
    const term = s === "" ? tex : `${s}\\,${tex}`;
    const entry = { tex: term, f, key: rank(id) };
    if (f.compare(0) < 0) reactants.push(entry);
    else products.push(entry);
  }

  // 强制 e⁻ 显示
  const eSide = direction === "oxidation" ? products : reactants;
  if (!eSide.some((x) => x.tex.includes("e^{-}"))) {
    eSide.push({ tex: "e^{-}", f: new Fraction(1), key: 99 });
  }

  reactants.sort((a, b) => a.key - b.key);
  products.sort((a, b) => a.key - b.key);

  const left = reactants.map((x) => x.tex).join(" + ");
  const right = products.map((x) => x.tex).join(" + ");
  return `${left} \\rightarrow ${right}`;
}

// ── 读 TSV ────────────────────────────────────────────────────────────────
function readSeed(): SeedRow[] {
  const raw = readFileSync(SEED_PATH, "utf-8");
  const lines = raw.split(/\r?\n/);
  const rows: SeedRow[] = [];
  let headers: string[] | null = null;
  for (const line of lines) {
    if (!line.trim()) continue;
    if (line.startsWith("#")) continue;
    const parts = line.split("\t");
    if (!headers) {
      headers = parts.map((s) => s.trim());
      continue;
    }
    const row = Object.fromEntries(headers.map((h, i) => [h, (parts[i] ?? "").trim()])) as SeedRow;
    rows.push(row);
  }
  return rows;
}

// ── 主流程 ────────────────────────────────────────────────────────────────
function main() {
  // 扩展 ATOMIC_WEIGHTS (砷, 硒)
  // formula.ts 的 ATOMIC_WEIGHTS 是导出的, 我们 mutation 它
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ATOMIC_WEIGHTS } = require("../lib/chem/formula") as typeof import("../lib/chem/formula");
  (ATOMIC_WEIGHTS as Record<string, number>).As = 74.922;
  (ATOMIC_WEIGHTS as Record<string, number>).Se = 78.971;
  (ATOMIC_WEIGHTS as Record<string, number>).Sb = 121.760;
  (ATOMIC_WEIGHTS as Record<string, number>).Be = 9.012;
  (ATOMIC_WEIGHTS as Record<string, number>).Cd = 112.414;
  (ATOMIC_WEIGHTS as Record<string, number>).Cr = 51.996;
  (ATOMIC_WEIGHTS as Record<string, number>).Pb = 207.2;
  (ATOMIC_WEIGHTS as Record<string, number>).Hg = 200.592;
  (ATOMIC_WEIGHTS as Record<string, number>).Ni = 58.693;
  (ATOMIC_WEIGHTS as Record<string, number>).Ag = 107.868;
  (ATOMIC_WEIGHTS as Record<string, number>).Tl = 204.382;

  const rows = readSeed();
  console.log(`▶ 读取 ${rows.length} 条 EPA 优先污染物记录`);

  const entries: PollutantEntry[] = [];
  let okDonors = 0;
  let okAcceptors = 0;
  let okNonRedox = 0;
  let okExcluded = 0;
  let failed: { epa_id: string; name: string; err: string }[] = [];

  for (const row of rows) {
    const cidPart = row.cas.replace(/[^0-9]/g, "");
    const entry: PollutantEntry = {
      ...row,
      pubchem_url: `https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(row.cas)}`,
      ecfr_url: "https://www.ecfr.gov/current/title-40/chapter-I/subchapter-N/part-423/appendix-Appendix%20A%20to%20Part%20423",
    };

    try {
      if (row.role === "donor") {
        const products = deriveProducts(row.formula);
        if (products.length === 0) {
          throw new Error("no products derivable from formula");
        }
        const subst = { id: `epa_${row.epa_id}`, formula: row.formula };
        const result = balanceHalfReaction({
          substrate: subst,
          products,
          direction: "oxidation",
        });
        const renamed = renameAux(result.coefficients);
        const formulaMap = new Map<string, string>([
          [subst.id, row.formula],
          ...products.map((p) => [p.id, p.formula] as [string, string]),
          ["h2o", "H2O"],
          ["h_ion", "H^+"],
          ["e_minus", "e-"],
        ]);
        const tex = buildKatex(
          renamed,
          formulaMap,
          "oxidation",
          subst.id,
          products.map((p) => p.id),
        );

        const coeffObj: Record<string, string> = {};
        for (const [k, v] of renamed) coeffObj[k] = v.toFraction();

        entry.products = products;
        entry.balance = {
          coefficients: coeffObj,
          molecularWeight: molecularWeight(parseFormula(row.formula)),
          equationKatex: tex,
          balance_residuals: result.residuals,
        };
        okDonors++;
      } else if (row.role === "acceptor_metal") {
        const halfRxn = METAL_HALF_REACTIONS[row.epa_id];
        if (!halfRxn) throw new Error(`no preset half-reaction for ${row.name_en}`);
        const subst = { id: halfRxn.substrateId, formula: halfRxn.substrateFormula };
        const products = [{ id: halfRxn.productId, formula: halfRxn.productFormula }];
        const result = balanceHalfReaction({
          substrate: subst,
          products,
          direction: "reduction",
        });
        const renamed = renameAux(result.coefficients);
        const formulaMap = new Map<string, string>([
          [subst.id, halfRxn.substrateFormula],
          [halfRxn.productId, halfRxn.productFormula],
          ["h2o", "H2O"],
          ["h_ion", "H^+"],
          ["e_minus", "e-"],
        ]);
        const tex = buildKatex(
          renamed,
          formulaMap,
          "reduction",
          subst.id,
          [halfRxn.productId],
        );

        const coeffObj: Record<string, string> = {};
        for (const [k, v] of renamed) coeffObj[k] = v.toFraction();

        entry.products = products;
        entry.balance = {
          coefficients: coeffObj,
          molecularWeight: molecularWeight(parseFormula(halfRxn.substrateFormula)),
          equationKatex: tex,
          balance_residuals: result.residuals,
        };
        okAcceptors++;
      } else if (row.role === "non_redox") {
        // 仅记录, 不配平
        okNonRedox++;
      } else if (row.role === "excluded") {
        okExcluded++;
      }
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      entry.balance_error = err;
      failed.push({ epa_id: row.epa_id, name: row.name_en, err });
    }

    entries.push(entry);
  }

  // 写文件
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  const output = {
    meta: {
      source: "U.S. EPA 40 CFR Part 423, Appendix A — Priority Pollutants",
      url: "https://www.ecfr.gov/current/title-40/chapter-I/subchapter-N/part-423",
      generatedAt: new Date().toISOString(),
      generator: "scripts/build-epa-pollutants.ts",
      total: entries.length,
      donors_balanced: okDonors,
      acceptors_balanced: okAcceptors,
      non_redox_recorded: okNonRedox,
      excluded: okExcluded,
      balance_failures: failed.length,
    },
    entries,
  };
  writeFileSync(OUT_PATH, JSON.stringify(output, null, 2), "utf-8");

  console.log(`✓ 写入 ${OUT_PATH}`);
  console.log("");
  console.log("─ 统计 ────────────────────────────────");
  console.log(`  donor 配平成功:           ${okDonors}`);
  console.log(`  acceptor_metal 配平成功:  ${okAcceptors}`);
  console.log(`  non_redox 仅记录:         ${okNonRedox}`);
  console.log(`  excluded:                ${okExcluded}`);
  console.log(`  配平失败:                ${failed.length}`);
  if (failed.length > 0) {
    console.log("");
    console.log("─ 失败明细 ────────────────────────────");
    for (const f of failed) {
      console.log(`  #${f.epa_id}  ${f.name}`);
      console.log(`     → ${f.err}`);
    }
  }
}

main();
