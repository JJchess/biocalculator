import type { AcceptorId, CoefficientTable, DonorId, SpeciesId } from "../types";

import { ACCEPTORS } from "../data/acceptors";
import { DONORS } from "../data/donors";
import { MOLECULAR_WEIGHTS, speciesDisplayName } from "../data/molecularWeights";

export type KpiBundle = {
  /** 每 mol 供体提供的电子当量 (= 1 / |donor coefficient per e⁻|) */
  electronsPerDonor: number;
  /** 每 mol 供体消耗的受体物质量 (mol / mol donor) — 用主受体物种 */
  acceptorMolPerDonor: number;
  acceptorMassPerDonor: number;
  acceptorDisplayName: string;
  /** 生物量质量产率 Y = g VSS / g 底物 (mass basis)。fs=0 时为 0。 */
  biomassYieldGperG: number;
  biomassGramsPerMolDonor: number;
  /** CO₂ 净产量 (g / mol donor, g / g donor)。若 CO₂ 被消耗则为负。 */
  co2GramsPerMolDonor: number;
  co2GramsPerGramDonor: number;
  /** H⁺ 净 (mol / mol donor)。正→酸化，负→碱度需求。 */
  protonNetMolPerDonor: number;
  /** H₂O 净 (mol / mol donor)。 */
  waterNetMolPerDonor: number;
  /** 电子分配 */
  fe: number;
  fs: number;
  /** 供体每分子转移的电子数（整数，例：葡萄糖 24, 苯 30） */
  electronsPerSubstrateMolecule: number;
};

/** 从供体半反应里读出供体主体物种系数（每 mol e⁻ 基准，负数），取倒数得电子当量。 */
function electronsFromDonor(donorId: DonorId): number {
  const entry = DONORS[donorId];
  const raw = entry.coefficients[entry.primarySpecies];
  if (!raw) throw new Error(`donor ${donorId} missing primarySpecies coeff`);
  const [n, d] = raw.includes("/") ? raw.split("/") : [raw, "1"];
  const value = Number(n) / Number(d);
  return 1 / Math.abs(value);
}

/** 整数化的电子转移数（用于显示，例如 24, 30, 14...） */
function nearestInt(x: number): number {
  return Math.round(x);
}

function molOf(table: CoefficientTable, sp: SpeciesId): number {
  return table.get(sp)?.valueOf() as number ?? 0;
}

export function buildKpis(
  normalized: CoefficientTable,
  donorId: DonorId,
  acceptorId: AcceptorId,
  fs: number,
): KpiBundle {
  const electrons = electronsFromDonor(donorId);
  const donorEntry = DONORS[donorId];
  const acceptorEntry = ACCEPTORS[acceptorId];

  const donorMW = MOLECULAR_WEIGHTS[donorEntry.primarySpecies];

  const acceptorSp = acceptorEntry.primarySpecies;
  const acceptorMol = Math.abs(molOf(normalized, acceptorSp));
  const acceptorMW = MOLECULAR_WEIGHTS[acceptorSp];

  const biomassMol = molOf(normalized, "biomass");
  const biomassGrams = biomassMol * MOLECULAR_WEIGHTS.biomass;

  const co2Mol = molOf(normalized, "co2");
  const co2Grams = co2Mol * MOLECULAR_WEIGHTS.co2;

  const hMol = molOf(normalized, "h_ion");
  const waterMol = molOf(normalized, "h2o");

  return {
    electronsPerDonor: electrons,
    electronsPerSubstrateMolecule: nearestInt(electrons),
    acceptorMolPerDonor: acceptorMol,
    acceptorMassPerDonor: acceptorMol * acceptorMW,
    acceptorDisplayName: speciesDisplayName(acceptorSp),
    biomassYieldGperG: biomassGrams / donorMW,
    biomassGramsPerMolDonor: biomassGrams,
    co2GramsPerMolDonor: co2Grams,
    co2GramsPerGramDonor: co2Grams / donorMW,
    protonNetMolPerDonor: hMol,
    waterNetMolPerDonor: waterMol,
    fe: 1 - fs,
    fs,
  };
}
