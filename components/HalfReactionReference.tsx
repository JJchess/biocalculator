"use client";

import { BlockMath } from "react-katex";
import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ACCEPTORS } from "@/lib/data/acceptors";
import { CELL_SYNTHESIS } from "@/lib/data/cellSynthesis";
import { DONORS } from "@/lib/data/donors";
import { ACCEPTOR_IDS, DONOR_IDS } from "@/lib/types";

/**
 * 默认收起为页脚一条文字链接，点击才展开完整参考表。
 * 不再占据视觉权重。
 */
export function HalfReactionReference() {
  return (
    <Collapsible className="group/ref mt-2">
      <div className="flex justify-center">
        <CollapsibleTrigger className="text-tertiary inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] transition hover:text-[var(--apple-blue)]">
          <span>查看半反应库（13 条，每 mol e⁻ 基准）</span>
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-data-[panel-open]/ref:rotate-90" />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-3">
        <div className="surface-card p-5">
          <div className="grid gap-5 lg:grid-cols-3">
            <Section title="电子供体（氧化）" accent="blue">
              <ul className="space-y-2.5">
                {DONOR_IDS.map((id) => (
                  <RefItem
                    key={id}
                    name={DONORS[id].displayName}
                    tex={DONORS[id].referenceKatex}
                  />
                ))}
              </ul>
            </Section>
            <Section title="电子受体（还原）" accent="orange">
              <ul className="space-y-2.5">
                {ACCEPTOR_IDS.map((id) => (
                  <RefItem
                    key={id}
                    name={ACCEPTORS[id].displayName}
                    tex={ACCEPTORS[id].referenceKatex}
                  />
                ))}
              </ul>
            </Section>
            <Section title="细胞合成" accent="green">
              <RefItem
                name={CELL_SYNTHESIS.displayName}
                tex={CELL_SYNTHESIS.referenceKatex}
              />
            </Section>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function Section({
  title,
  accent,
  children,
}: {
  title: string;
  accent: "blue" | "orange" | "green";
  children: React.ReactNode;
}) {
  const colorMap: Record<string, string> = {
    blue: "text-[var(--apple-blue)] dark:text-[var(--apple-teal)]",
    orange: "text-[#b35900] dark:text-[var(--apple-orange)]",
    green: "text-[#1c7a3a] dark:text-[var(--apple-green)]",
  };
  return (
    <section>
      <h3
        className={`mb-2 text-[10.5px] font-semibold uppercase tracking-wider ${colorMap[accent]}`}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

function RefItem({ name, tex }: { name: string; tex?: string }) {
  return (
    <li className="rounded-lg border border-[var(--hairline)] bg-[rgba(0,0,0,0.02)] p-2.5 dark:bg-[rgba(255,255,255,0.03)]">
      <div className="text-tertiary mb-1 text-[11px]">{name}</div>
      {tex ? (
        <div className="overflow-x-auto text-[12.5px] [&_.katex-display]:my-1">
          <BlockMath math={tex} />
        </div>
      ) : null}
    </li>
  );
}
