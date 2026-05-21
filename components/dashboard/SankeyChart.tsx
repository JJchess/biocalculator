"use client";

import { ResponsiveSankey } from "@nivo/sankey";

import type { CalculatorResult } from "@/lib/types";

type Props = { result: CalculatorResult };

/**
 * 单色墨水画 + accent-ink 强调电子流。
 * 论文 figure 风：标题在下方斜体 caption。
 */
const NODE_COLOR: Record<string, string> = {
  donor: "var(--ink)",
  energy: "var(--ink-3)",
  biomass: "var(--accent-ink)",
  acceptor: "var(--ink-2)",
  product: "var(--ink-3)",
};

export function SankeyChart({ result }: Props) {
  const { sankey } = result;

  const data = {
    nodes: sankey.nodes.map((n) => ({
      id: n.id,
      label: n.label,
      nodeColor: NODE_COLOR[n.id] ?? "var(--ink-3)",
    })),
    links: sankey.links,
  };

  return (
    <section>
      <SectionLabel title="电子流向" />

      <figure className="mt-5">
        <div className="rule-t rule-b h-[400px] w-full py-3">
          <ResponsiveSankey
            data={data}
            margin={{ top: 14, right: 110, bottom: 14, left: 110 }}
            align="justify"
            colors={(n) => (n as { nodeColor: string }).nodeColor}
            nodeOpacity={1}
            nodeHoverOthersOpacity={0.3}
            nodeThickness={10}
            nodeSpacing={28}
            nodeBorderWidth={0}
            nodeBorderRadius={0}
            linkOpacity={0.32}
            linkHoverOpacity={0.7}
            linkHoverOthersOpacity={0.08}
            linkContract={1}
            enableLinkGradient
            labelPosition="outside"
            labelOrientation="horizontal"
            labelPadding={10}
            label={(node) => (node as unknown as { label: string }).label}
            labelTextColor="var(--ink-2)"
            animate
            motionConfig="gentle"
            theme={{
              text: {
                fontFamily: "var(--font-serif), serif",
                fontSize: 13,
                fill: "var(--ink-2)",
              },
              labels: {
                text: {
                  fontFamily: "var(--font-serif), serif",
                  fontSize: 13.5,
                  fontWeight: 500,
                  fontStyle: "italic",
                },
              },
              tooltip: {
                container: {
                  background: "var(--paper)",
                  color: "var(--ink)",
                  border: "1px solid var(--rule)",
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontFamily: "var(--font-serif), serif",
                  fontSize: 12.5,
                  padding: "6px 10px",
                },
              },
            }}
          />
        </div>
        <figcaption className="ink-3 mt-2.5 text-[12.5px] italic leading-relaxed">
          <span className="ink-4 not-italic">Fig. 1 ·</span>{" "}
          单位电子流量（mol e⁻ · mol⁻¹ 底物）在能量代谢与细胞合成两条路径上的分配；
          支路宽度正比于电子通量。
        </figcaption>
      </figure>
    </section>
  );
}

function SectionLabel({ title }: { title: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <h2 className="ink text-[18px] font-semibold tracking-tight">
        {title}
      </h2>
    </div>
  );
}
