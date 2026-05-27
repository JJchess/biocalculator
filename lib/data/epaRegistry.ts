/**
 * EPA 物种注册 — 在模块加载时把 126 条 EPA 化合物 + 配平产物注入到全局物种表里,
 * 这样 calculator / massBalance / formatEquation 等下游代码可以无缝处理 EPA donor/acceptor。
 *
 * 调用方: 由 lib/calculator.ts 在顶层导入触发副作用。
 */

import { ATOMIC_WEIGHTS, parseFormula } from "../chem/formula";
import { EPA_POLLUTANTS } from "./epaPollutants";
import { MOLECULAR_WEIGHTS, registerSpecies } from "./molecularWeights";

// ── 扩展 ATOMIC_WEIGHTS (砷/硒/锑/铍/镉/铬/铅/汞/镍/银/铊) ──
const EXTRA_ATOMIC: Record<string, number> = {
  As: 74.922,
  Se: 78.971,
  Sb: 121.760,
  Be: 9.012,
  Cd: 112.414,
  Cr: 51.996,
  Pb: 207.2,
  Hg: 200.592,
  Ni: 58.693,
  Ag: 107.868,
  Tl: 204.382,
};
for (const [el, mw] of Object.entries(EXTRA_ATOMIC)) {
  if (ATOMIC_WEIGHTS[el] === undefined) ATOMIC_WEIGHTS[el] = mw;
}

// ── 配平器产生的辅助物种 (卤离子 / 磷酸 / 金属物种) ──
const HELPER_SPECIES: Record<string, { formula: string; tex: string; displayName: string }> = {
  chloride: { formula: "Cl^-", tex: String.raw`\mathrm{Cl^-}`, displayName: "Cl⁻" },
  bromide: { formula: "Br^-", tex: String.raw`\mathrm{Br^-}`, displayName: "Br⁻" },
  fluoride: { formula: "F^-", tex: String.raw`\mathrm{F^-}`, displayName: "F⁻" },
  iodide: { formula: "I^-", tex: String.raw`\mathrm{I^-}`, displayName: "I⁻" },
  phosphate: { formula: "HPO4^2-", tex: String.raw`\mathrm{HPO_4^{2-}}`, displayName: "HPO₄²⁻" },
  chromate: { formula: "CrO4^2-", tex: String.raw`\mathrm{CrO_4^{2-}}`, displayName: "CrO₄²⁻" },
  chromium_iii: { formula: "Cr^3+", tex: String.raw`\mathrm{Cr^{3+}}`, displayName: "Cr³⁺" },
  arsenate: { formula: "H2AsO4^-", tex: String.raw`\mathrm{H_2AsO_4^-}`, displayName: "H₂AsO₄⁻" },
  // H₃AsO₃ = arsenious acid; pH 7 主要形式。R&M (2001) Table A.1 同形
  arsenite: { formula: "H3AsO3", tex: String.raw`\mathrm{H_3AsO_3}`, displayName: "H₃AsO₃" },
  mercury_ii: { formula: "Hg^2+", tex: String.raw`\mathrm{Hg^{2+}}`, displayName: "Hg²⁺" },
  mercury_0: { formula: "Hg", tex: String.raw`\mathrm{Hg^0}`, displayName: "Hg⁰" },
  selenate: { formula: "SeO4^2-", tex: String.raw`\mathrm{SeO_4^{2-}}`, displayName: "SeO₄²⁻" },
  selenium_0: { formula: "Se", tex: String.raw`\mathrm{Se^0}`, displayName: "Se⁰" },
};

for (const [id, spec] of Object.entries(HELPER_SPECIES)) {
  const mw = molecularWeightOf(spec.formula);
  registerSpecies(id, { mw, tex: spec.tex, displayName: spec.displayName });
}

// ── 126 条 EPA 化合物自身 ──
for (const p of EPA_POLLUTANTS) {
  const id = `epa_${p.epa_id}`;
  const mw = p.balance?.molecularWeight ?? safeMW(p.formula);
  const tex = formulaToKatex(p.formula);
  registerSpecies(id, { mw, tex, displayName: p.name_cn });
}

function molecularWeightOf(formula: string): number {
  try {
    const parsed = parseFormula(formula);
    let mw = 0;
    for (const [el, n] of parsed.elements) {
      const aw = ATOMIC_WEIGHTS[el];
      if (aw === undefined) return 0;
      mw += aw * (n.valueOf() as number);
    }
    return mw;
  } catch {
    return 0;
  }
}

function safeMW(formula: string): number {
  try {
    return molecularWeightOf(formula);
  } catch {
    return 0;
  }
}

function formulaToKatex(formula: string): string {
  // C12H8Cl6 → \mathrm{C_{12}H_{8}Cl_{6}}
  // NH4^+ → \mathrm{NH_{4}^{+}}
  let out = formula.replace(/([A-Z][a-z]?)(\d+)/g, (_, el, n) => `${el}_{${n}}`);
  out = out.replace(/\^([0-9]*[+-])/, (_, c) => `^{${c}}`);
  return `\\mathrm{${out}}`;
}

/** 标记 — 让别处可以检查"已注册" */
export const EPA_REGISTRY_LOADED = true;

/** 当前已注册的物种总数 (用于调试/UI 显示数据规模) */
export function registeredSpeciesCount(): number {
  return Object.keys(MOLECULAR_WEIGHTS).length;
}
