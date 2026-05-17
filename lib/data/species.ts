import type { SpeciesId } from "../types";

/**
 * 物种登记表：把 SpeciesId 与分子式 (供配平器使用) 关联。
 *
 * 注意：
 *   - 这里的 formula 是「最简实证式 + 电荷」格式，能被 lib/chem/formula.ts 解析。
 *   - 显示用的 TeX/中文名仍由 molecularWeights.ts 提供（保留惯用写法，例如乙酸根
 *     写作 CH₃COO⁻ 而非 C₂H₃O₂⁻）。
 *   - H₂O / H⁺ / e⁻ 由配平器自动处理，但仍登记在此以便正向查询分子量与显示。
 */
export const SPECIES_FORMULA: Record<SpeciesId, string> = {
  e_minus: "e-",
  h_ion: "H^+",
  h2o: "H2O",
  co2: "CO2",
  hco3: "HCO3^-",
  nh4: "NH4^+",
  biomass: "C5H7O2N",
  glucose: "C6H12O6",
  acetate: "C2H3O2^-",
  benzene: "C6H6",
  toluene: "C7H8",
  ethanol: "C2H6O",
  hydrogen: "H2",
  oxygen: "O2",
  nitrate: "NO3^-",
  sulfate: "SO4^2-",
  hs: "HS^-",
  methane: "CH4",
  n2: "N2",
  ferric: "Fe^3+",
  ferrous: "Fe^2+",
  manganite: "MnO2",
  manganous: "Mn^2+",
};
