import { balanceHalfReaction, renameAux, type HalfReactionDirection } from "./balance";
import { renderHalfReactionTex } from "./renderTex";
import { SPECIES_FORMULA } from "../data/species";
import type {
  HalfReactionCoefficients,
  HalfReactionEntry,
  SpeciesId,
} from "../types";

/**
 * 声明式半反应规范——只描述「主体物种」与「方向」，
 * 由 chem 引擎自动配平并生成 KaTeX。
 */
export type HalfReactionSpec = {
  id: string;
  displayName: string;
  /** 主反应物 (donor 是被氧化物种, acceptor 是被还原物种)。 */
  substrate: SpeciesId;
  /** 主要产物列表（不含 H₂O / H⁺ / e⁻，那些由引擎自动平衡）。 */
  products: SpeciesId[];
  direction: HalfReactionDirection;
};

export function buildHalfReactionEntry(spec: HalfReactionSpec): HalfReactionEntry {
  const { coefficients } = balanceHalfReaction({
    substrate: { id: spec.substrate, formula: SPECIES_FORMULA[spec.substrate] },
    products: spec.products.map((p) => ({ id: p, formula: SPECIES_FORMULA[p] })),
    direction: spec.direction,
  });
  const renamed = renameAux(coefficients);

  const coeffObj: HalfReactionCoefficients = {};
  for (const [k, v] of renamed) {
    coeffObj[k as SpeciesId] = v.toFraction();
  }

  return {
    id: spec.id,
    displayName: spec.displayName,
    primarySpecies: spec.substrate,
    coefficients: coeffObj,
    referenceKatex: renderHalfReactionTex(renamed, spec.direction),
  };
}
