/**
 * 用化学引擎独立配平所有现有半反应，与硬编码数据对比。
 * 这是 P1 阶段的回归测试：引擎必须重现历史结果，方可在下一轮迭代替换数据源。
 *
 * 运行：npm run verify:chem
 */
import Fraction from "fraction.js";

import { balanceHalfReaction, renameAux } from "../lib/chem/balance";
import { ACCEPTORS } from "../lib/data/acceptors";
import { DONORS } from "../lib/data/donors";
import { SPECIES_FORMULA } from "../lib/data/species";
import type {
  AcceptorId,
  DonorId,
  HalfReactionCoefficients,
  SpeciesId,
} from "../lib/types";

type Case = {
  label: string;
  expected: HalfReactionCoefficients;
  substrate: SpeciesId;
  products: SpeciesId[];
  direction: "oxidation" | "reduction";
};

const donorMap: Record<DonorId, { substrate: SpeciesId; products: SpeciesId[] }> = {
  glucose: { substrate: "glucose", products: ["co2"] },
  acetate: { substrate: "acetate", products: ["co2"] },
  benzene: { substrate: "benzene", products: ["co2"] },
  toluene: { substrate: "toluene", products: ["co2"] },
  ethanol: { substrate: "ethanol", products: ["co2"] },
  hydrogen: { substrate: "hydrogen", products: [] },
  ammonium: { substrate: "nh4", products: ["nitrate"] },
};

const acceptorMap: Record<AcceptorId, { substrate: SpeciesId; products: SpeciesId[] }> = {
  oxygen: { substrate: "oxygen", products: [] },
  nitrate: { substrate: "nitrate", products: ["n2"] },
  sulfate: { substrate: "sulfate", products: ["hs"] },
  methanogenesis: { substrate: "co2", products: ["methane"] },
  iron3: { substrate: "ferric", products: ["ferrous"] },
  manganese_dioxide: { substrate: "manganite", products: ["manganous"] },
};

const cases: Case[] = [];
for (const [id, m] of Object.entries(donorMap) as [DonorId, (typeof donorMap)[DonorId]][]) {
  cases.push({
    label: `donor:${id}`,
    expected: DONORS[id].coefficients,
    substrate: m.substrate,
    products: m.products,
    direction: "oxidation",
  });
}
for (const [id, m] of Object.entries(acceptorMap) as [AcceptorId, (typeof acceptorMap)[AcceptorId]][]) {
  cases.push({
    label: `acceptor:${id}`,
    expected: ACCEPTORS[id].coefficients,
    substrate: m.substrate,
    products: m.products,
    direction: "reduction",
  });
}

function compareCoefficients(
  got: Map<string, Fraction>,
  expected: HalfReactionCoefficients,
): string | null {
  const expEntries = Object.entries(expected).filter(([, v]) => v !== undefined) as [
    string,
    string,
  ][];
  const expMap = new Map<string, Fraction>(expEntries.map(([k, v]) => [k, new Fraction(v)]));

  for (const [k, v] of expMap) {
    const g = got.get(k);
    if (!g) return `missing species ${k}, expected ${v.toFraction()}`;
    if (!g.equals(v)) return `species ${k}: got ${g.toFraction()}, expected ${v.toFraction()}`;
  }
  for (const [k, v] of got) {
    if (!expMap.has(k)) return `unexpected species ${k} = ${v.toFraction()}`;
  }
  return null;
}

let failed = 0;
for (const c of cases) {
  try {
    const { coefficients } = balanceHalfReaction({
      substrate: { id: c.substrate, formula: SPECIES_FORMULA[c.substrate] },
      products: c.products.map((p) => ({ id: p, formula: SPECIES_FORMULA[p] })),
      direction: c.direction,
    });
    const renamed = renameAux(coefficients);
    const diff = compareCoefficients(renamed, c.expected);
    if (diff) {
      console.error(`✗ ${c.label}: ${diff}`);
      console.error(
        `  got:      ${[...renamed.entries()].map(([k, v]) => `${k}=${v.toFraction()}`).join(", ")}`,
      );
      console.error(
        `  expected: ${Object.entries(c.expected)
          .map(([k, v]) => `${k}=${v}`)
          .join(", ")}`,
      );
      failed++;
    } else {
      console.log(`✓ ${c.label}`);
    }
  } catch (e) {
    console.error(`✗ ${c.label}: ${(e as Error).message}`);
    failed++;
  }
}

console.log("");
if (failed > 0) {
  console.error(`FAIL: ${failed}/${cases.length} cases failed`);
  process.exit(1);
}
console.log(`PASS: all ${cases.length} half-reactions match hand-written data`);
