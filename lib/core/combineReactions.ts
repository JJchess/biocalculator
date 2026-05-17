import Fraction from "fraction.js";

import type {
  CoefficientTable,
  HalfReactionCoefficients,
  SpeciesId,
} from "../types";

function toTable(coeffs: HalfReactionCoefficients): CoefficientTable {
  const m = new Map<SpeciesId, Fraction>();
  for (const [key, raw] of Object.entries(coeffs)) {
    if (raw === undefined) continue;
    m.set(key as SpeciesId, new Fraction(raw));
  }
  return m;
}

function scaleTable(table: CoefficientTable, k: Fraction): CoefficientTable {
  const out = new Map<SpeciesId, Fraction>();
  for (const [species, f] of table) {
    out.set(species, f.mul(k));
  }
  return out;
}

/**
 * 加权合并三条半反应（均基于每 mol e⁻ 的系数；负号 = 反应物，正号 = 产物）。
 * 若受体与细胞合成半反应按「还原」书写（e⁻ 在反应物一侧），则本式的
 * **R_d + f_e·R_a + f_s·R_c** 与常见写法
 * **R_d − f_e·R_a′ − f_s·R_c′**（其中 R_a′、R_c′ 为系数取反后的形式）代数等价。
 */
export function combineReactions(
  donor: HalfReactionCoefficients,
  acceptor: HalfReactionCoefficients,
  cell: HalfReactionCoefficients,
  fe: Fraction,
  fs: Fraction,
): CoefficientTable {
  const merged = new Map<SpeciesId, Fraction>();

  const addPart = (table: CoefficientTable) => {
    for (const [species, f] of table) {
      const prev = merged.get(species) ?? new Fraction(0);
      merged.set(species, prev.add(f));
    }
  };

  addPart(toTable(donor));
  addPart(scaleTable(toTable(acceptor), fe));
  addPart(scaleTable(toTable(cell), fs));

  for (const [species, f] of [...merged.entries()]) {
    if (f.equals(0)) merged.delete(species);
  }

  return merged;
}
