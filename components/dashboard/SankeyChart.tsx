"use client";

import { ResponsiveSankey } from "@nivo/sankey";
import { GitBranch } from "lucide-react";

import type { CalculatorResult } from "@/lib/types";

type Props = { result: CalculatorResult };

const NODE_COLOR: Record<string, string> = {
  donor: "#0a84ff",
  energy: "#30b0c7",
  biomass: "#34c759",
  acceptor: "#ff9500",
  product: "#af52de",
};

export function SankeyChart({ result }: Props) {
  const { sankey } = result;

  // Nivo expects: nodes: {id, nodeColor}, links: {source, target, value}
  const data = {
    nodes: sankey.nodes.map((n) => ({
      id: n.id,
      label: n.label,
      nodeColor: NODE_COLOR[n.id] ?? "#86868b",
    })),
    links: sankey.links,
  };

  return (
    <div className="surface-card relative flex h-full min-h-[420px] flex-col overflow-hidden p-4">
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(0,122,255,0.10)] text-[var(--apple-blue)] dark:bg-[rgba(10,132,255,0.16)] dark:text-[var(--apple-teal)]">
            <GitBranch className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[13px] font-semibold">电子流向</div>
            <div className="text-quaternary text-[11px]">
              供体 → 能量 / 合成 → 受体 · 产物（单位 mol e⁻ · per mol 供体）
            </div>
          </div>
        </div>
      </div>
      <div className="-mx-2 min-h-0 flex-1">
        <ResponsiveSankey
          data={data}
          margin={{ top: 16, right: 110, bottom: 16, left: 110 }}
          align="justify"
          colors={(n) => (n as { nodeColor: string }).nodeColor}
          nodeOpacity={1}
          nodeHoverOthersOpacity={0.35}
          nodeThickness={14}
          nodeSpacing={28}
          nodeBorderWidth={0}
          nodeBorderRadius={4}
          linkOpacity={0.5}
          linkHoverOpacity={0.85}
          linkHoverOthersOpacity={0.1}
          linkContract={2}
          enableLinkGradient
          labelPosition="outside"
          labelOrientation="horizontal"
          labelPadding={12}
          label={(node) => (node as unknown as { label: string }).label}
          labelTextColor={{ from: "color", modifiers: [["darker", 1.4]] }}
          animate
          motionConfig="gentle"
          theme={{
            text: {
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fill: "var(--text-secondary)",
            },
            labels: {
              text: {
                fontFamily: "var(--font-sans)",
                fontSize: 12.5,
                fontWeight: 600,
              },
            },
            tooltip: {
              container: {
                background: "var(--surface-elevated)",
                color: "var(--text-primary)",
                border: "1px solid var(--hairline)",
                borderRadius: 12,
                boxShadow: "var(--shadow-3)",
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                padding: "8px 12px",
              },
            },
          }}
        />
      </div>
    </div>
  );
}
