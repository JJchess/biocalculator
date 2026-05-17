import Fraction from "fraction.js";

import { parseFormula, type ParsedFormula } from "./formula";
import { solveExact } from "./linalg";

/**
 * 半反应配平规范：
 *   主体物种 (substrate, product) 由调用方提供。
 *   辅助物种 H₂O / H⁺ / e⁻ 由配平器自动加入，分担氢、氧与电荷的剩余账。
 *
 * direction:
 *   "oxidation" → 电子作为产物，归一化使 e⁻ 系数 = +1；substrate 为反应物。
 *   "reduction" → 电子作为反应物，归一化使 e⁻ 系数 = -1；substrate 为反应物。
 *
 * 输入 species 列表中：
 *   - 索引 0 → substrate（反应物，期望系数为负）
 *   - 索引 1+ → 主要产物（期望系数为正）
 *
 * 系数符号约定与现有数据一致：负 = 反应物，正 = 产物。
 */
export type HalfReactionDirection = "oxidation" | "reduction";

export type BalanceInput = {
  substrate: { id: string; formula: string };
  products: { id: string; formula: string }[];
  direction: HalfReactionDirection;
  /**
   * 默认 1：归一化使电子系数绝对值为 1（即「每 1 mol e⁻」）。
   * 也可传分数（如 8 表示一整摩尔受体）。
   */
  electronBasis?: Fraction;
};

export type BalancedHalfReaction = {
  /** id → signed coefficient (Fraction). H₂O/H⁺/e⁻ 自动包含 (零系数会被剔除)。 */
  coefficients: Map<string, Fraction>;
  /** 配平时每种元素的原子守恒残差 (调试用)，均为 0。 */
  residuals: Record<string, string>;
};

const H2O: ParsedFormula = parseFormula("H2O");
const H_ION: ParsedFormula = parseFormula("H^+");
const E_MINUS: ParsedFormula = parseFormula("e-");

const AUX_IDS = { h2o: "__h2o__", h_ion: "__h_ion__", e_minus: "__e_minus__" };

export function balanceHalfReaction(input: BalanceInput): BalancedHalfReaction {
  const basis = input.electronBasis ?? new Fraction(1);

  const speciesList: { id: string; parsed: ParsedFormula }[] = [
    { id: input.substrate.id, parsed: parseFormula(input.substrate.formula) },
    ...input.products.map((p) => ({ id: p.id, parsed: parseFormula(p.formula) })),
    { id: AUX_IDS.h2o, parsed: H2O },
    { id: AUX_IDS.h_ion, parsed: H_ION },
    { id: AUX_IDS.e_minus, parsed: E_MINUS },
  ];

  // 收集涉及的元素
  const elementSet = new Set<string>();
  for (const sp of speciesList) {
    for (const el of sp.parsed.elements.keys()) elementSet.add(el);
  }
  const elements = [...elementSet];

  // 构造约束矩阵：每行 = 一个元素守恒方程；最后一行 = 电荷守恒
  const nCols = speciesList.length;
  const M: Fraction[][] = [];
  const b: Fraction[] = [];

  for (const el of elements) {
    const row: Fraction[] = speciesList.map(
      (sp) => sp.parsed.elements.get(el) ?? new Fraction(0),
    );
    M.push(row);
    b.push(new Fraction(0));
  }
  // charge
  M.push(speciesList.map((sp) => sp.parsed.charge));
  b.push(new Fraction(0));

  // 缩放行：固定 e⁻ 系数
  // oxidation → e⁻ 系数 = +basis (产物)
  // reduction  → e⁻ 系数 = -basis (反应物)
  const eIdx = speciesList.length - 1;
  const scaleRow: Fraction[] = speciesList.map((_, i) => (i === eIdx ? new Fraction(1) : new Fraction(0)));
  M.push(scaleRow);
  b.push(input.direction === "oxidation" ? basis : basis.neg());

  const sol = solveExact(M, b);
  if (!sol) {
    throw new Error(
      `balanceHalfReaction: no unique solution for ${input.substrate.id} → ${input.products
        .map((p) => p.id)
        .join("+")}; check element/charge balance & DOF`,
    );
  }

  // 验证残差
  const residuals: Record<string, string> = {};
  for (let i = 0; i < elements.length; i++) {
    const sum = sol.reduce(
      (acc, x, j) => acc.add(x.mul(speciesList[j].parsed.elements.get(elements[i]) ?? new Fraction(0))),
      new Fraction(0),
    );
    residuals[elements[i]] = sum.toFraction();
    if (!sum.equals(0)) {
      throw new Error(`Element ${elements[i]} residual ${sum.toFraction()} ≠ 0`);
    }
  }
  const chargeSum = sol.reduce(
    (acc, x, j) => acc.add(x.mul(speciesList[j].parsed.charge)),
    new Fraction(0),
  );
  residuals.charge = chargeSum.toFraction();
  if (!chargeSum.equals(0)) {
    throw new Error(`Charge residual ${chargeSum.toFraction()} ≠ 0`);
  }

  const coefficients = new Map<string, Fraction>();
  for (let i = 0; i < speciesList.length; i++) {
    if (sol[i].equals(0)) continue;
    coefficients.set(speciesList[i].id, sol[i]);
  }
  return { coefficients, residuals };
}

/** 把内部辅助 id (__h2o__ 等) 映射回项目里的 SpeciesId 字符串。 */
export const AUX_TO_SPECIES_ID: Record<string, string> = {
  [AUX_IDS.h2o]: "h2o",
  [AUX_IDS.h_ion]: "h_ion",
  [AUX_IDS.e_minus]: "e_minus",
};

export function renameAux(coeffs: Map<string, Fraction>): Map<string, Fraction> {
  const out = new Map<string, Fraction>();
  for (const [k, v] of coeffs) {
    out.set(AUX_TO_SPECIES_ID[k] ?? k, v);
  }
  return out;
}
