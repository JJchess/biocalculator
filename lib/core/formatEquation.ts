import Fraction from "fraction.js";

import type { CoefficientTable, SpeciesId } from "../types";

import { SPECIES_DISPLAY_TEX } from "../data/molecularWeights";

function formatStoich(f: Fraction): string {
  const simplified = f.abs().simplify(0.0000001);
  const n = simplified.n;
  const d = simplified.d;
  const dNum = Number(d);
  const nNum = Number(n);
  if (dNum === 1) return `${nNum}`;
  const asNumber = nNum / dNum;
  if (Number.isInteger(asNumber)) return `${asNumber}`;
  return `\\frac{${n}}{${d}}`;
}

function termTex(stoich: string, speciesId: SpeciesId): string {
  const body = SPECIES_DISPLAY_TEX[speciesId];
  if (stoich === "1") return body;
  return `${stoich}\\,${body}`;
}

/**
 * Builds a KaTeX string for the overall reaction from normalized coefficients.
 */
export function formatEquation(normalized: CoefficientTable): string {
  const reactants: Array<{ species: SpeciesId; f: Fraction }> = [];
  const products: Array<{ species: SpeciesId; f: Fraction }> = [];

  for (const [species, f] of normalized) {
    if (species === "e_minus") continue;
    if (f.equals(0)) continue;
    if (f.compare(0) < 0) reactants.push({ species, f });
    else products.push({ species, f });
  }

  const sortKey = (a: SpeciesId) => a;

  reactants.sort((a, b) => sortKey(a.species).localeCompare(sortKey(b.species)));
  products.sort((a, b) => sortKey(a.species).localeCompare(sortKey(b.species)));

  const left = reactants
    .map(({ species, f }) => termTex(formatStoich(f), species))
    .join(" + ");
  const right = products
    .map(({ species, f }) => termTex(formatStoich(f), species))
    .join(" + ");

  return `${left} \\rightarrow ${right}`;
}
