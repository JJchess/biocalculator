import type { CoefficientTable, MassBalanceRow, ProductBarDatum } from "../types";

import { MOLECULAR_WEIGHTS, speciesDisplayName } from "../data/molecularWeights";

const BAR_COLORS = [
  "hsl(186 94% 42%)",
  "hsl(200 85% 55%)",
  "hsl(220 70% 60%)",
  "hsl(160 60% 45%)",
  "hsl(280 55% 55%)",
  "hsl(40 90% 55%)",
];

export function buildMassBalanceRows(normalized: CoefficientTable): MassBalanceRow[] {
  const rows: MassBalanceRow[] = [];

  for (const [speciesId, f] of normalized) {
    if (speciesId === "e_minus") continue;
    const moles = f.valueOf() as number;
    const mw = MOLECULAR_WEIGHTS[speciesId];
    const massGrams = moles * mw;
    rows.push({
      speciesId,
      displayName: speciesDisplayName(speciesId),
      moles,
      massGrams,
    });
  }

  rows.sort((a, b) => a.speciesId.localeCompare(b.speciesId));
  return rows;
}

export function buildProductBarData(normalized: CoefficientTable): ProductBarDatum[] {
  const positive: ProductBarDatum[] = [];
  let colorIdx = 0;

  for (const [speciesId, f] of normalized) {
    if (speciesId === "e_minus" || speciesId === "h_ion") continue;
    const moles = f.valueOf() as number;
    if (moles <= 0) continue;
    const massGrams = moles * MOLECULAR_WEIGHTS[speciesId];
    if (massGrams <= 1e-9) continue;
    positive.push({
      speciesId,
      displayName: speciesDisplayName(speciesId),
      massGrams,
      fill: BAR_COLORS[colorIdx % BAR_COLORS.length]!,
    });
    colorIdx += 1;
  }

  positive.sort((a, b) => b.massGrams - a.massGrams);
  return positive;
}
