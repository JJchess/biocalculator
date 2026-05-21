import type { Fraction } from "fraction.js";

/** All species keys used in coefficients / mass balance.
 *
 * 经典 13 条半反应库的物种 ID 显式列出 (保留自动补全),
 * 额外允许任意字符串以容纳 EPA 126 条扩展库 (epa_001..epa_129 + chloride/bromide/... 等产物 id).
 */
export type SpeciesId =
  | "e_minus"
  | "h_ion"
  | "h2o"
  | "co2"
  | "hco3"
  | "nh4"
  | "biomass"
  | "glucose"
  | "acetate"
  | "benzene"
  | "toluene"
  | "ethanol"
  | "hydrogen"
  | "oxygen"
  | "nitrate"
  | "sulfate"
  | "hs"
  | "methane"
  | "n2"
  | "ferric"
  | "ferrous"
  | "manganite"
  | "manganous"
  | (string & {});

export const DONOR_IDS = [
  "glucose",
  "acetate",
  "benzene",
  "toluene",
  "ethanol",
  "hydrogen",
  "ammonium",
] as const;
export type DonorId = (typeof DONOR_IDS)[number];

export const ACCEPTOR_IDS = [
  "oxygen",
  "nitrate",
  "sulfate",
  "methanogenesis",
  "iron3",
  "manganese_dioxide",
] as const;
export type AcceptorId = (typeof ACCEPTOR_IDS)[number];

/** String form in data files, parsed with `fraction.js`. */
export type CoefficientSpec = string;

/** Raw half-reaction map: negative = reactants, positive = products, per 1 mol e⁻. */
export type HalfReactionCoefficients = Partial<Record<SpeciesId, CoefficientSpec>>;

export type HalfReactionEntry = {
  id: string;
  displayName: string;
  primarySpecies: SpeciesId;
  coefficients: HalfReactionCoefficients;
  /** Optional KaTeX for the reference panel (1 mol e⁻ basis). */
  referenceKatex?: string;
};

export type CoefficientTable = Map<SpeciesId, Fraction>;

export type MassBalanceRow = {
  speciesId: SpeciesId;
  displayName: string;
  /** mol per 1 mol primary donor (signed). */
  moles: number;
  /** g per 1 mol primary donor (signed). */
  massGrams: number;
};

export type ElectronSplitSlice = {
  label: string;
  /** 0–1, sums to ~1. */
  value: number;
  fill: string;
};

export type ProductBarDatum = {
  speciesId: SpeciesId;
  displayName: string;
  massGrams: number;
  fill: string;
};

/** Donor 可以是 curated DonorId 或 "epa_NNN" (扩展自 EPA 126 条) */
export type DonorKey = DonorId | (string & {});
/** Acceptor 同理 */
export type AcceptorKey = AcceptorId | (string & {});

export type CalculatorInput = {
  donorId: DonorKey;
  acceptorId: AcceptorKey;
  /** Fraction of electrons for biomass synthesis (0–1). Energy = 1 − fs. */
  fs: number;
};

export type CalculatorResult = {
  /** Coefficients after merge (per mol e⁻, before donor normalization). */
  combinedRaw: CoefficientTable;
  /** Coefficients normalized to 1 mol of donor primary species. */
  normalized: CoefficientTable;
  equationKatex: string;
  massBalanceRows: MassBalanceRow[];
  electronSlices: ElectronSplitSlice[];
  productBarData: ProductBarDatum[];
  fe: number;
  fs: number;
  kpis: import("./core/kpis").KpiBundle;
  sankey: import("./core/sankey").SankeyData;
  donorId: DonorKey;
  acceptorId: AcceptorKey;
};

export type DonorSelectorProps = {
  value: DonorId;
  onChange: (id: DonorId) => void;
};

export type AcceptorSelectorProps = {
  value: AcceptorId;
  onChange: (id: AcceptorId) => void;
};

export type FsSliderProps = {
  value: number;
  onChange: (value: number) => void;
};

export type EquationDisplayProps = {
  katex: string;
};

export type MassBalanceTableProps = {
  rows: MassBalanceRow[];
};

export type ElectronPieChartProps = {
  data: ElectronSplitSlice[];
};

export type ProductBarChartProps = {
  data: ProductBarDatum[];
};

export type ControlPanelProps = {
  donorId: DonorKey;
  acceptorId: AcceptorKey;
  fs: number;
  onDonorChange: (id: DonorKey) => void;
  onAcceptorChange: (id: AcceptorKey) => void;
  onFsChange: (value: number) => void;
};

export type ResultPanelProps = {
  result: CalculatorResult;
};
