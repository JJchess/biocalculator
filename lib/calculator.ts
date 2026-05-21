import Fraction from "fraction.js";

import { ACCEPTORS } from "./data/acceptors";
import { CELL_SYNTHESIS } from "./data/cellSynthesis";
import { DONORS } from "./data/donors";
import { getEpaEntry, isEpaDonorId } from "./data/epaAdapter";
import { combineReactions } from "./core/combineReactions";
import { formatEquation } from "./core/formatEquation";
import { buildKpis } from "./core/kpis";
import { buildMassBalanceRows, buildProductBarData } from "./core/massBalance";
import { normalizeToOneMolDonor } from "./core/normalize";
import { buildSankeyData } from "./core/sankey";
import type { CalculatorInput, CalculatorResult, HalfReactionEntry } from "./types";

function clampFs(fs: number): number {
  if (Number.isNaN(fs)) return 0;
  return Math.min(1, Math.max(0, fs));
}

/** 统一查找: 优先 curated 13 条库, 找不到再查 EPA 126 条库 */
function lookupDonor(id: string): HalfReactionEntry {
  if (isEpaDonorId(id)) {
    const e = getEpaEntry(id);
    if (e) return e;
    throw new Error(`Unknown EPA donor: ${id}`);
  }
  const e = DONORS[id as keyof typeof DONORS];
  if (e) return e;
  throw new Error(`Unknown donor: ${id}`);
}

function lookupAcceptor(id: string): HalfReactionEntry {
  if (isEpaDonorId(id)) {
    const e = getEpaEntry(id);
    if (e) return e;
    throw new Error(`Unknown EPA acceptor: ${id}`);
  }
  const e = ACCEPTORS[id as keyof typeof ACCEPTORS];
  if (e) return e;
  throw new Error(`Unknown acceptor: ${id}`);
}

export function calculate(input: CalculatorInput): CalculatorResult {
  const fs = clampFs(input.fs);
  const fe = 1 - fs;

  const donorEntry = lookupDonor(input.donorId);
  const acceptorEntry = lookupAcceptor(input.acceptorId);

  const combinedRaw = combineReactions(
    donorEntry.coefficients,
    acceptorEntry.coefficients,
    CELL_SYNTHESIS.coefficients,
    new Fraction(fe),
    new Fraction(fs),
  );

  const normalized = normalizeToOneMolDonor(
    combinedRaw,
    donorEntry.primarySpecies,
  );

  const equationKatex = formatEquation(normalized);
  const massBalanceRows = buildMassBalanceRows(normalized);
  const productBarData = buildProductBarData(normalized);
  const kpis = buildKpis(normalized, input.donorId, input.acceptorId, fs);
  const sankey = buildSankeyData(
    input.donorId,
    input.acceptorId,
    fs,
    kpis.electronsPerDonor,
  );

  const electronSlices =
    fs <= 0
      ? [{ label: "能量代谢 (受体)", value: fe, fill: "var(--chart-3)" }]
      : fe <= 0
        ? [{ label: "细胞合成", value: fs, fill: "var(--chart-2)" }]
        : [
            { label: "能量代谢 (受体)", value: fe, fill: "var(--chart-3)" },
            { label: "细胞合成", value: fs, fill: "var(--chart-2)" },
          ];

  return {
    combinedRaw,
    normalized,
    equationKatex,
    massBalanceRows,
    electronSlices,
    productBarData,
    fe,
    fs,
    kpis,
    sankey,
    donorId: input.donorId,
    acceptorId: input.acceptorId,
  };
}
