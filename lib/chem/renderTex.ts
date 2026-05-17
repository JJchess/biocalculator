import Fraction from "fraction.js";

import { SPECIES_DISPLAY_TEX } from "../data/molecularWeights";
import type { HalfReactionDirection } from "./balance";
import type { SpeciesId } from "../types";

function stoichTex(f: Fraction): string {
  const a = f.abs();
  if (a.equals(1)) return "";
  const n = a.n.toString();
  const d = a.d.toString();
  return d === "1" ? n : `\\frac{${n}}{${d}}`;
}

function termTex(coeff: Fraction, speciesId: SpeciesId): string {
  const body = SPECIES_DISPLAY_TEX[speciesId];
  const s = stoichTex(coeff);
  return s === "" ? body : `${s}\\,${body}`;
}

/**
 * 将半反应系数表渲染成 KaTeX 形式：
 *   - 反应物在左，产物在右
 *   - e⁻ 永远显示（半反应的标志），按 direction 放在正确一侧
 *
 * 物种排序约定：主体物种优先，H₂O 次之，H⁺ 再次之，e⁻ 最后。
 */
export function renderHalfReactionTex(
  coefficients: Map<string, Fraction>,
  direction: HalfReactionDirection,
): string {
  const order: Record<string, number> = {
    h2o: 90,
    h_ion: 95,
    e_minus: 99,
  };
  const rank = (id: string) => order[id] ?? 10;

  const reactants: Array<{ id: SpeciesId; f: Fraction }> = [];
  const products: Array<{ id: SpeciesId; f: Fraction }> = [];

  for (const [id, f] of coefficients) {
    if (f.equals(0)) continue;
    const entry = { id: id as SpeciesId, f };
    if (f.compare(0) < 0) reactants.push(entry);
    else products.push(entry);
  }

  // 强制 e⁻ 出现在正确一侧（即便系数为 0，半反应仍应展示电子）
  const eSide = direction === "oxidation" ? products : reactants;
  if (!eSide.some((x) => x.id === "e_minus")) {
    eSide.push({
      id: "e_minus",
      f: direction === "oxidation" ? new Fraction(1) : new Fraction(-1),
    });
  }

  reactants.sort((a, b) => rank(a.id) - rank(b.id));
  products.sort((a, b) => rank(a.id) - rank(b.id));

  const left = reactants.map(({ id, f }) => termTex(f, id)).join(" + ");
  const right = products.map(({ id, f }) => termTex(f, id)).join(" + ");
  return `${left} \\rightarrow ${right}`;
}
