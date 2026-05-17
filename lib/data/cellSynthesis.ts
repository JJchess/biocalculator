import type { HalfReactionEntry } from "../types";

/**
 * Biomass synthesis half-reaction (reduction), per 1 mol e⁻.
 * 1/5 CO₂ + 1/20 HCO₃⁻ + 1/20 NH₄⁺ + H⁺ + e⁻ → 1/20 C₅H₇O₂N + 9/20 H₂O
 */
export const CELL_SYNTHESIS: HalfReactionEntry = {
  id: "cell_synthesis",
  displayName: "细胞合成",
  primarySpecies: "biomass",
  coefficients: {
    co2: "-1/5",
    hco3: "-1/20",
    nh4: "-1/20",
    h_ion: "-1",
    e_minus: "-1",
    biomass: "1/20",
    h2o: "9/20",
  },
  referenceKatex:
    String.raw`\frac{1}{5}\mathrm{CO_2} + \frac{1}{20}\mathrm{HCO_3^-} + \frac{1}{20}\mathrm{NH_4^+} + \mathrm{H^+} + \mathrm{e^-} \rightarrow \frac{1}{20}\mathrm{C_5H_7O_2N} + \frac{9}{20}\mathrm{H_2O}`,
};
