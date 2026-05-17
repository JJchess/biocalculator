import Fraction from "fraction.js";

import { ACCEPTORS } from "./data/acceptors";
import { CELL_SYNTHESIS } from "./data/cellSynthesis";
import { DONORS } from "./data/donors";
import { combineReactions } from "./core/combineReactions";
import { formatEquation } from "./core/formatEquation";
import { buildKpis } from "./core/kpis";
import { buildMassBalanceRows, buildProductBarData } from "./core/massBalance";
import { normalizeToOneMolDonor } from "./core/normalize";
import { buildSankeyData } from "./core/sankey";
import type { CalculatorInput, CalculatorResult } from "./types";

function clampFs(fs: number): number {
  if (Number.isNaN(fs)) return 0;
  return Math.min(1, Math.max(0, fs));
}

export function calculate(input: CalculatorInput): CalculatorResult {
  const fs = clampFs(input.fs);
  const fe = 1 - fs;

  const donorEntry = DONORS[input.donorId];
  const acceptorEntry = ACCEPTORS[input.acceptorId];

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
