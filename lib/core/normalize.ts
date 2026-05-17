import Fraction from "fraction.js";

import type { CoefficientTable, SpeciesId } from "../types";

/**
 * Scale combined coefficients so the donor primary species is −1 mol (reactant).
 */
export function normalizeToOneMolDonor(
  combined: CoefficientTable,
  primarySpecies: SpeciesId,
): CoefficientTable {
  const donorCoeff = combined.get(primarySpecies);
  if (!donorCoeff || donorCoeff.equals(0)) {
    throw new Error(`Missing zero donor coefficient for ${primarySpecies}`);
  }

  const factor = new Fraction(-1).div(donorCoeff);
  const out = new Map<SpeciesId, Fraction>();

  for (const [species, f] of combined) {
    const scaled = f.mul(factor);
    if (!scaled.equals(0)) out.set(species, scaled);
  }

  return out;
}
