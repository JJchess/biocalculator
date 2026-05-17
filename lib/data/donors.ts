import { buildHalfReactionEntry, type HalfReactionSpec } from "../chem/buildEntry";
import type { DonorId, HalfReactionEntry } from "../types";

/**
 * 电子供体半反应（氧化），每 1 mol e⁻ 归一化。
 *
 * 这里只声明「主体反应物 + 主体产物 + 方向」；H₂O / H⁺ / e⁻ 与系数
 * 由 lib/chem 引擎按元素守恒 + 电荷守恒自动求解，KaTeX 同样自动生成。
 * 若需新增污染物，仅需 (a) 在 SPECIES_FORMULA 中登记分子式，
 * (b) 在此追加一条声明。
 */
const SPECS: Record<DonorId, HalfReactionSpec> = {
  glucose: {
    id: "glucose",
    displayName: "葡萄糖",
    substrate: "glucose",
    products: ["co2"],
    direction: "oxidation",
  },
  acetate: {
    id: "acetate",
    displayName: "乙酸",
    substrate: "acetate",
    products: ["co2"],
    direction: "oxidation",
  },
  benzene: {
    id: "benzene",
    displayName: "苯",
    substrate: "benzene",
    products: ["co2"],
    direction: "oxidation",
  },
  toluene: {
    id: "toluene",
    displayName: "甲苯",
    substrate: "toluene",
    products: ["co2"],
    direction: "oxidation",
  },
  ethanol: {
    id: "ethanol",
    displayName: "乙醇",
    substrate: "ethanol",
    products: ["co2"],
    direction: "oxidation",
  },
  hydrogen: {
    id: "hydrogen",
    displayName: "氢气",
    substrate: "hydrogen",
    products: [],
    direction: "oxidation",
  },
  ammonium: {
    id: "ammonium",
    displayName: "氨氮 (NH₄⁺)",
    substrate: "nh4",
    products: ["nitrate"],
    direction: "oxidation",
  },
};

export const DONORS: Record<DonorId, HalfReactionEntry> = Object.fromEntries(
  Object.entries(SPECS).map(([k, spec]) => [k, buildHalfReactionEntry(spec)]),
) as Record<DonorId, HalfReactionEntry>;
