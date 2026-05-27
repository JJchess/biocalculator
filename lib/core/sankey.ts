import type { AcceptorKey, DonorKey } from "../types";

import { lookupAcceptor, lookupDonor } from "../data/lookup";
import { speciesDisplayName } from "../data/molecularWeights";

export type SankeyNode = { id: string; label: string; color: string };
export type SankeyLink = { source: string; target: string; value: number };
export type SankeyData = { nodes: SankeyNode[]; links: SankeyLink[] };

/**
 * 把电子流抽象成 Sankey：
 *   [电子供体] →(总电子) → [能量代谢|细胞合成]
 *                          ├ fe → [电子受体] → [还原产物]
 *                          └ fs → [生物量 C₅H₇O₂N]
 *
 * 数值 = 电子当量 (mol e⁻ per mol donor)。颜色映射 Apple system colors。
 */
export function buildSankeyData(
  donorId: DonorKey,
  acceptorId: AcceptorKey,
  fs: number,
  electronsPerDonor: number,
): SankeyData {
  const fe = 1 - fs;
  const donor = lookupDonor(donorId);
  const acceptor = lookupAcceptor(acceptorId);

  const totalE = electronsPerDonor;
  const eEnergy = totalE * fe;
  const eSynth = totalE * fs;

  // 受体被还原后的主产物名 — 取 acceptor.coefficients 中正系数最大的物种
  const reducedProduct = (() => {
    let best: { id: string; v: number } | null = null;
    for (const [sp, raw] of Object.entries(acceptor.coefficients)) {
      if (!raw) continue;
      const [n, d] = raw.includes("/") ? raw.split("/") : [raw, "1"];
      const v = Number(n) / Number(d);
      if (sp === "h2o" || sp === "h_ion" || sp === "e_minus") continue;
      if (v > 0 && (!best || v > best.v)) best = { id: sp, v };
    }
    return best?.id ?? "product";
  })();

  const nodes: SankeyNode[] = [
    { id: "donor", label: donor.displayName, color: "var(--chart-1)" },
    { id: "energy", label: "能量代谢 (fe)", color: "var(--chart-3)" },
    { id: "biomass", label: "细胞 C₅H₇O₂N", color: "var(--chart-2)" },
    { id: "acceptor", label: acceptor.displayName, color: "var(--chart-4)" },
    { id: "product", label: speciesDisplayName(reducedProduct as never), color: "var(--chart-5)" },
  ];

  const eps = 1e-6;
  const links: SankeyLink[] = [];
  if (eEnergy > eps) {
    links.push({ source: "donor", target: "energy", value: eEnergy });
    links.push({ source: "energy", target: "acceptor", value: eEnergy });
    links.push({ source: "acceptor", target: "product", value: eEnergy });
  }
  if (eSynth > eps) {
    links.push({ source: "donor", target: "biomass", value: eSynth });
  }

  // Sankey 至少要 1 条 link，否则库会崩；fs=1 + 受体未参与的退化情况补一条占位
  if (links.length === 0) {
    links.push({ source: "donor", target: "biomass", value: totalE });
  }

  return { nodes, links };
}
