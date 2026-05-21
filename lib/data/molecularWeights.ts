import type { SpeciesId } from "../types";

/** Grams per mol.  Curated 13 物种保留显式条目;
 *  EPA 126 条扩展物种在 lib/data/epaRegistry.ts 模块加载时通过 registerSpecies() 注入。
 */
export const MOLECULAR_WEIGHTS: Record<string, number> = {
  e_minus: 0,
  h_ion: 1.008,
  h2o: 18.015,
  co2: 44.01,
  hco3: 61.017,
  nh4: 18.038,
  biomass: 113.12,
  glucose: 180.16,
  acetate: 59.044,
  benzene: 78.11,
  toluene: 92.14,
  ethanol: 46.07,
  hydrogen: 2.016,
  oxygen: 31.998,
  nitrate: 62.005,
  sulfate: 96.06,
  hs: 33.072,
  methane: 16.04,
  n2: 28.014,
  ferric: 55.845,
  ferrous: 55.845,
  manganite: 86.937,
  manganous: 54.938,
};

/** KaTeX fragment for rendering in equations (not including stoichiometric prefix). */
export const SPECIES_DISPLAY_TEX: Record<string, string> = {
  e_minus: String.raw`\mathrm{e^-}`,
  h_ion: String.raw`\mathrm{H^+}`,
  h2o: String.raw`\mathrm{H_2O}`,
  co2: String.raw`\mathrm{CO_2}`,
  hco3: String.raw`\mathrm{HCO_3^-}`,
  nh4: String.raw`\mathrm{NH_4^+}`,
  biomass: String.raw`\mathrm{C_5H_7O_2N}`,
  glucose: String.raw`\mathrm{C_6H_{12}O_6}`,
  acetate: String.raw`\mathrm{CH_3COO^-}`,
  benzene: String.raw`\mathrm{C_6H_6}`,
  toluene: String.raw`\mathrm{C_7H_8}`,
  ethanol: String.raw`\mathrm{C_2H_5OH}`,
  hydrogen: String.raw`\mathrm{H_2}`,
  oxygen: String.raw`\mathrm{O_2}`,
  nitrate: String.raw`\mathrm{NO_3^-}`,
  sulfate: String.raw`\mathrm{SO_4^{2-}}`,
  hs: String.raw`\mathrm{HS^-}`,
  methane: String.raw`\mathrm{CH_4}`,
  n2: String.raw`\mathrm{N_2}`,
  ferric: String.raw`\mathrm{Fe^{3+}}`,
  ferrous: String.raw`\mathrm{Fe^{2+}}`,
  manganite: String.raw`\mathrm{MnO_2}`,
  manganous: String.raw`\mathrm{Mn^{2+}}`,
};

/** Plain-text (Chinese) display name. */
const DISPLAY_NAMES: Record<string, string> = {
  e_minus: "e⁻",
  h_ion: "H⁺",
  h2o: "H₂O",
  co2: "CO₂",
  hco3: "HCO₃⁻",
  nh4: "NH₄⁺",
  biomass: "细胞 (C₅H₇O₂N)",
  glucose: "葡萄糖",
  acetate: "乙酸根",
  benzene: "苯",
  toluene: "甲苯",
  ethanol: "乙醇",
  hydrogen: "H₂",
  oxygen: "O₂",
  nitrate: "NO₃⁻",
  sulfate: "SO₄²⁻",
  hs: "HS⁻",
  methane: "CH₄",
  n2: "N₂",
  ferric: "Fe³⁺",
  ferrous: "Fe²⁺",
  manganite: "MnO₂",
  manganous: "Mn²⁺",
};

export function speciesDisplayName(id: SpeciesId): string {
  return DISPLAY_NAMES[id] ?? id;
}

/**
 * 运行时注册物种(给 EPA 126 条 + 配平产物用)。
 * 三张表同时更新; 已存在的 key 不覆盖以保证 curated 数据优先。
 */
export function registerSpecies(
  id: string,
  data: { mw?: number; tex?: string; displayName?: string },
): void {
  if (data.mw !== undefined && MOLECULAR_WEIGHTS[id] === undefined) {
    MOLECULAR_WEIGHTS[id] = data.mw;
  }
  if (data.tex !== undefined && SPECIES_DISPLAY_TEX[id] === undefined) {
    SPECIES_DISPLAY_TEX[id] = data.tex;
  }
  if (data.displayName !== undefined && DISPLAY_NAMES[id] === undefined) {
    DISPLAY_NAMES[id] = data.displayName;
  }
}
