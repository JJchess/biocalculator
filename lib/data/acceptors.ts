import { buildHalfReactionEntry, type HalfReactionSpec } from "../chem/buildEntry";
import type { AcceptorId, HalfReactionEntry } from "../types";

/**
 * 电子受体半反应（还原），每 1 mol e⁻ 归一化。
 * 与 donors.ts 同样使用声明式 — 引擎完成配平 + KaTeX。
 */
const SPECS: Record<AcceptorId, HalfReactionSpec> = {
  oxygen: {
    id: "oxygen",
    displayName: "氧气（好氧）",
    substrate: "oxygen",
    products: [],
    direction: "reduction",
  },
  nitrate: {
    id: "nitrate",
    displayName: "硝酸盐（反硝化）",
    substrate: "nitrate",
    products: ["n2"],
    direction: "reduction",
  },
  sulfate: {
    id: "sulfate",
    displayName: "硫酸盐还原",
    substrate: "sulfate",
    products: ["hs"],
    direction: "reduction",
  },
  methanogenesis: {
    id: "methanogenesis",
    displayName: "产甲烷 (CO₂)",
    substrate: "co2",
    products: ["methane"],
    direction: "reduction",
  },
  iron3: {
    id: "iron3",
    displayName: "铁还原 (Fe³⁺)",
    substrate: "ferric",
    products: ["ferrous"],
    direction: "reduction",
  },
  manganese_dioxide: {
    id: "manganese_dioxide",
    displayName: "锰还原 (MnO₂)",
    substrate: "manganite",
    products: ["manganous"],
    direction: "reduction",
  },
};

export const ACCEPTORS: Record<AcceptorId, HalfReactionEntry> = Object.fromEntries(
  Object.entries(SPECS).map(([k, spec]) => [k, buildHalfReactionEntry(spec)]),
) as Record<AcceptorId, HalfReactionEntry>;
